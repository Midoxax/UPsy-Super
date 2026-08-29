#!/usr/bin/env node
/**
 * Bundle budget — a ratchet, not a permanent allowance.
 *
 * Measures the gzipped bytes the browser must fetch before it can render the
 * homepage: the entry scripts and stylesheets the server-rendered document
 * references, plus anything modulepreloaded alongside them. Lazy route chunks
 * are excluded because they are not on the critical path.
 *
 * The app renders on the server, so there is no dist/index.html to parse any
 * more. The document only exists once the Worker produces it, which means this
 * check runs against a running server: it fetches "/" from BASE and resolves
 * every referenced asset back to a file in dist/client. In CI that is the same
 * preview server the accessibility audit uses, so the cost is one extra fetch.
 *
 * The budgets in bundle-budget.json are set to what the build produces today,
 * not to an aspirational target. That is deliberate. A budget above current
 * size silently permits regression up to the ceiling; a budget below it is red
 * on arrival and gets switched off. Pinned to today's number, the check does
 * the one thing that matters — it makes any increase a conscious decision that
 * shows up in review.
 *
 * Lowering a budget is the normal way to bank an optimisation: land the change,
 * then lower the number in the same PR so the win cannot be silently spent.
 *
 * Usage:
 *   BASE=http://127.0.0.1:4173 node scripts/check-bundle-size.mjs
 *   UPDATE_BUDGET=1 BASE=... node scripts/check-bundle-size.mjs  # rewrite to current
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = resolve(ROOT, "dist", "client");
const BUDGET_FILE = resolve(ROOT, "bundle-budget.json");
const BASE = (process.env.BASE || "http://127.0.0.1:4173").replace(/\/$/, "");

if (!existsSync(CLIENT)) {
  console.error("No dist/client — run `npm run build` first.");
  process.exit(1);
}

let html;
try {
  const res = await fetch(`${BASE}/`, { headers: { accept: "text/html" } });
  if (!res.ok) {
    console.error(`GET ${BASE}/ returned ${res.status} — the preview server is not serving the homepage.`);
    process.exit(1);
  }
  html = await res.text();
} catch (error) {
  console.error(
    `Could not reach ${BASE}/ (${error.message}).\n` +
      "Start the built Worker first (npm run preview:cf) or set BASE to a running server."
  );
  process.exit(1);
}

// Everything fetched before first render: entry tags plus modulepreload hints.
const referenced = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]);
const preloaded = [...html.matchAll(/rel="modulepreload"[^>]*href="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
const critical = [...new Set([...referenced, ...preloaded])];

if (critical.length === 0) {
  console.error("The served homepage references no /assets/ bundles at all — is this the production build?");
  process.exit(1);
}

let js = 0;
let css = 0;
const files = [];
const missing = [];
for (const file of critical) {
  const path = resolve(CLIENT, file.replace(/^\//, ""));
  if (!existsSync(path)) {
    missing.push(file);
    continue;
  }
  const gz = gzipSync(readFileSync(path), { level: 9 }).length;
  files.push({ file, gz });
  if (file.endsWith(".js")) js += gz;
  else css += gz;
}
files.sort((a, b) => b.gz - a.gz);

if (missing.length) {
  console.error("The served document references assets that are not in dist/client:\n");
  for (const m of missing) console.error(`  - ${m}`);
  console.error("\nThe server and the client build are out of sync — rebuild before measuring.\n");
  process.exit(1);
}

const actual = {
  initialJsGzipKb: +(js / 1024).toFixed(1),
  initialCssGzipKb: +(css / 1024).toFixed(1),
};

if (process.env.UPDATE_BUDGET) {
  writeFileSync(BUDGET_FILE, JSON.stringify(actual, null, 2) + "\n");
  console.log("Budget updated to current build:", actual);
  process.exit(0);
}

if (!existsSync(BUDGET_FILE)) {
  console.error(`Missing ${BUDGET_FILE}. Create it with UPDATE_BUDGET=1.`);
  process.exit(1);
}
const budget = JSON.parse(readFileSync(BUDGET_FILE, "utf8"));

console.log("Critical-path payload (gzipped)\n");
for (const f of files.slice(0, 6)) {
  console.log(`  ${(f.gz / 1024).toFixed(1).padStart(7)} KB  ${f.file}`);
}
if (files.length > 6) console.log(`  ${String(files.length - 6).padStart(7)} more`);
console.log();

/**
 * Tolerance before a budget is considered breached: 1% or 2 KB, whichever is
 * larger. A byte-exact ceiling trips on ordinary churn — a dependency patch
 * shifting a few hundred bytes is not a regression worth failing a build over,
 * and a gate that cries wolf is a gate someone eventually deletes. 2 KB is
 * comfortably below anything that would move a real user's experience, so
 * genuine growth still gets caught.
 */
const tolerance = (limit) => Math.max(limit * 0.01, 2);

let failed = false;
for (const [key, limit] of Object.entries(budget)) {
  const value = actual[key];
  if (value === undefined) continue;
  const allowed = +(limit + tolerance(limit)).toFixed(1);
  const delta = +(value - limit).toFixed(1);
  const sign = delta > 0 ? "+" : "";
  const over = value > allowed;
  console.log(
    `  ${(over ? "OVER" : "ok").padEnd(5)} ${key.padEnd(18)} ${String(value).padStart(7)} KB ` +
      `(budget ${limit} KB, ${sign}${delta} KB, fails above ${allowed} KB)`
  );
  if (over) failed = true;
}

if (failed) {
  console.error(
    "\nBundle budget exceeded.\n\n" +
      "If the growth is intended, raise the number in bundle-budget.json in the\n" +
      "same commit so the cost is visible in review. If it is not, find what was\n" +
      "added to the critical path — usually a static import into a module the\n" +
      "entry already reaches.\n"
  );
  process.exit(1);
}

console.log("\nWithin budget.");
