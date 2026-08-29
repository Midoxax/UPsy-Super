#!/usr/bin/env node
/**
 * vercel.json route-syntax gate.
 *
 * Vercel validates `source` patterns with path-to-regexp, which rejects regex
 * lookarounds. A rule such as
 *
 *   /(?!assets/|api/|robots.txt|_next/)(.*)
 *
 * fails the deployment *before the build runs*, with nothing but an
 * "invalid route source pattern" message. That class of error is trivially
 * detectable locally, so it should never reach Vercel again.
 *
 * Exclusion on Vercel is expressed with ordered routes or `has`/`missing`
 * conditions — never with negative regex.
 *
 * Usage: node scripts/check-vercel-config.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG = resolve(ROOT, "vercel.json");

if (!existsSync(CONFIG)) {
  console.log("check:vercel — no vercel.json, nothing to validate.");
  process.exit(0);
}

let config;
try {
  config = JSON.parse(readFileSync(CONFIG, "utf8"));
} catch (error) {
  console.error(`vercel.json is not valid JSON: ${error.message}`);
  process.exit(1);
}

const failures = [];

/** Patterns path-to-regexp cannot compile. */
const UNSUPPORTED = [
  { token: "(?!", what: "negative lookahead" },
  { token: "(?=", what: "positive lookahead" },
  { token: "(?<!", what: "negative lookbehind" },
  { token: "(?<=", what: "positive lookbehind" },
];

const SECTIONS = ["rewrites", "redirects", "headers", "routes"];

for (const section of SECTIONS) {
  const rules = config[section];
  if (!Array.isArray(rules)) continue;

  rules.forEach((rule, index) => {
    const source = rule?.source ?? rule?.src;
    if (typeof source !== "string") return;

    for (const { token, what } of UNSUPPORTED) {
      if (source.includes(token)) {
        failures.push(
          `${section}[${index}] source ${JSON.stringify(source)} uses a ${what} ` +
            `("${token}"). Vercel rejects it. Use ordered routes or has/missing conditions instead.`
        );
      }
    }

    if (!source.startsWith("/") && !source.startsWith("(")) {
      failures.push(
        `${section}[${index}] source ${JSON.stringify(source)} must start with "/".`
      );
    }
  });
}

// The SPA fallback is the one rule the app cannot work without: without it,
// every deep link 404s on refresh.
const rewrites = Array.isArray(config.rewrites) ? config.rewrites : [];
const hasSpaFallback = rewrites.some(
  (r) => typeof r?.source === "string" && /^\/\(\.\*\)$|^\/:path\*$/.test(r.source) && r.destination === "/index.html"
);
if (!hasSpaFallback) {
  failures.push(
    'Missing the SPA fallback rewrite { "source": "/(.*)", "destination": "/index.html" }. ' +
      "Deep links and refreshes would 404."
  );
}

if (failures.length) {
  console.error("vercel.json route configuration is invalid:\n");
  for (const f of failures) console.error(`  - ${f}`);
  console.error("\nSee https://vercel.link/invalid-route-source-pattern\n");
  process.exit(1);
}

console.log(
  `check:vercel — OK (${rewrites.length} rewrite(s), ` +
    `${(config.redirects ?? []).length} redirect(s), ${(config.headers ?? []).length} header rule(s)).`
);
