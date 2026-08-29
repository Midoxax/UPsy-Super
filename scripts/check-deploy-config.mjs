#!/usr/bin/env node
/**
 * Independent-hosting deploy gate.
 *
 * Phase 0 of the exit runbook makes hosting portable: the app must be
 * deployable from the repo to Cloudflare Workers with no Lovable-side state.
 * Three things silently break that, and none of them fail a normal build:
 *
 *   1. A `.env.example` that drifts from the variables the code actually reads,
 *      so a cutover comes up with a blank Supabase client.
 *   2. A stale SPA-style rewrite config left over from the Vite/React Router
 *      era, which serves index.html for every path and kills SSR.
 *   3. A missing deploy script, so the runbook's commands do not exist.
 *
 * Usage: node scripts/check-deploy-config.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

// --- 1. Every VITE_* the source reads must be documented in .env.example ----
const examplePath = resolve(ROOT, ".env.example");
if (!existsSync(examplePath)) {
  failures.push(".env.example is missing — the env contract for a cutover is undocumented.");
} else {
  const example = readFileSync(examplePath, "utf8");
  const used = new Set();
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx|mjs|js)$/.test(entry)) continue;
      const source = readFileSync(full, "utf8");
      for (const match of source.matchAll(/import\.meta\.env\.(VITE_[A-Z0-9_]+)/g)) {
        used.add(match[1]);
      }
    }
  };
  walk(resolve(ROOT, "src"));

  for (const name of [...used].sort()) {
    if (!example.includes(name)) {
      failures.push(`${name} is read by the app but absent from .env.example.`);
    }
  }
}

// --- 2. No SPA catch-all rewrite may survive: the app is SSR ----------------
for (const file of ["vercel.json", "netlify.toml", "public/_redirects"]) {
  const path = resolve(ROOT, file);
  if (!existsSync(path)) continue;
  const contents = readFileSync(path, "utf8");
  if (/index\.html/.test(contents) && /\/\*|\(\.\*\)/.test(contents)) {
    failures.push(
      `${file} contains a catch-all rewrite to index.html. This app renders on the server; ` +
        `that rule would serve an empty shell for every route.`,
    );
  }
}

// --- 3. The runbook's deploy commands must exist ----------------------------
const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
for (const script of ["deploy", "deploy:preview"]) {
  if (!pkg.scripts?.[script]) {
    failures.push(`package.json is missing the "${script}" script used by the deploy workflow.`);
  }
}

if (failures.length > 0) {
  console.error("check:deploy — independent hosting is not deployable as configured:\n");
  for (const failure of failures) console.error(`  • ${failure}`);
  process.exit(1);
}

console.log("check:deploy — env contract, routing and deploy scripts are consistent.");
