#!/usr/bin/env node
/**
 * Substitutes the `{{GTM_ID}}` slot (src/routes/__root.tsx) with the real GTM
 * container ID across the built output — client and server both, since the
 * snippet is a JS template literal that ends up inlined into bundles on both
 * sides, not just index.html.
 *
 * No-op when GTM_ID is unset: the snippet guards itself against an
 * unreplaced slot (see GTM_SNIPPET's own check), so analytics simply stay
 * off rather than the build failing.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { buildDirs } from "./build-output.mjs";

const GTM_ID = process.env.GTM_ID?.trim();
if (!GTM_ID) {
  console.log("GTM_ID not set — skipping substitution ({{GTM_ID}} slot stays inert).");
  process.exit(0);
}

const dirs = buildDirs();
if (!dirs) {
  console.error("No build output found — run the build before injecting GTM_ID.");
  process.exit(1);
}

const TEXT_FILE = /\.(html|js|mjs|cjs)$/;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (TEXT_FILE.test(entry)) files.push(full);
  }
  return files;
}

let replaced = 0;
for (const root of [dirs.client, dirs.server]) {
  for (const file of walk(root)) {
    const body = readFileSync(file, "utf8");
    if (!body.includes("{{GTM_ID}}")) continue;
    writeFileSync(file, body.split("{{GTM_ID}}").join(GTM_ID));
    replaced++;
  }
}

console.log(`GTM_ID injected into ${replaced} file(s).`);
