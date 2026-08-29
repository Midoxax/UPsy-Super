#!/usr/bin/env node
/**
 * Production build verification.
 *
 * A green `vite build` only proves the bundler did not throw. It does not
 * prove the output is servable. These checks cover the failures that reach
 * users while every other gate stays green.
 *
 * The app renders on the server (TanStack Start -> Cloudflare Worker), so the
 * build emits two trees rather than an index.html:
 *
 *   dist/server/  the Worker: index.mjs plus its route chunks and wrangler.json
 *   dist/client/  everything the browser fetches: hashed assets and static files
 *
 * There is deliberately no index.html to inspect any more — every document is
 * produced per request by the Worker. Metadata is therefore verified against
 * the running server by the accessibility audit, not here. What this script
 * asserts is that the artefact is complete and deployable:
 *
 *   - the Worker entry and its wrangler config exist and are non-empty
 *   - the client asset directory was actually emitted
 *   - robots.txt and sitemap.xml shipped, and robots does not deindex the site
 *   - no deploy-time {{PLACEHOLDER}} survived into a shipped text file
 *
 * Deliberately narrow. It asserts things that are objectively broken, not
 * things that are merely suboptimal — that is the audit's job.
 */
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(ROOT, "dist");
const CLIENT = resolve(DIST, "client");
const SERVER = resolve(DIST, "server");

const failures = [];
const warnings = [];
const fail = (m) => failures.push(m);
const warn = (m) => warnings.push(m);

if (!existsSync(DIST)) {
  console.error("No dist/ — run `npm run build` first.");
  process.exit(1);
}
for (const [label, dir] of [["client", CLIENT], ["server", SERVER]]) {
  if (!existsSync(dir)) {
    console.error(`dist/${label}/ missing — the build produced no ${label} output.`);
    process.exit(1);
  }
}

// 1. The Worker is deployable: an entry module and the config wrangler reads.
const workerEntry = resolve(SERVER, "index.mjs");
if (!existsSync(workerEntry)) fail("dist/server/index.mjs missing — no Worker entry to deploy");
else if (statSync(workerEntry).size === 0) fail("dist/server/index.mjs is empty");

const wranglerConfig = resolve(SERVER, "wrangler.json");
if (!existsSync(wranglerConfig)) {
  fail("dist/server/wrangler.json missing — `npm run deploy` has nothing to point at");
} else {
  try {
    const cfg = JSON.parse(readFileSync(wranglerConfig, "utf8"));
    if (!cfg.main) fail("wrangler.json declares no `main` entry");
    if (!cfg.name) fail("wrangler.json declares no Worker `name`");
    const assetDir = cfg.assets?.directory;
    if (!assetDir) fail("wrangler.json binds no static asset directory");
    else if (!existsSync(resolve(SERVER, assetDir))) {
      fail(`wrangler.json points assets at ${assetDir}, which does not exist`);
    }
  } catch (error) {
    fail(`wrangler.json is not valid JSON (${error.message})`);
  }
}

// 2. The browser has something to fetch.
const assetsDir = resolve(CLIENT, "assets");
if (!existsSync(assetsDir)) {
  fail("dist/client/assets/ missing — no bundled assets were emitted");
} else {
  const assets = readdirSync(assetsDir);
  const js = assets.filter((f) => f.endsWith(".js"));
  const css = assets.filter((f) => f.endsWith(".css"));
  if (js.length === 0) fail("no JavaScript emitted into dist/client/assets/");
  if (css.length === 0) warn("no stylesheet emitted into dist/client/assets/");
  const empty = assets.filter((f) => statSync(resolve(assetsDir, f)).size === 0);
  for (const f of empty) fail(`dist/client/assets/${f} is empty`);
  console.log(`  ${assets.length} client assets (${js.length} js, ${css.length} css)`);
}

// 3. Crawler-facing files exist and are non-trivial.
for (const file of ["robots.txt", "sitemap.xml"]) {
  const p = resolve(CLIENT, file);
  if (!existsSync(p)) fail(`${file} missing from build output`);
  else if (statSync(p).size < 20) fail(`${file} is suspiciously small (${statSync(p).size} bytes)`);
}

const robotsPath = resolve(CLIENT, "robots.txt");
if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, "utf8");
  if (/^\s*Disallow:\s*\/\s*$/im.test(robots) && !/Allow:/i.test(robots)) {
    fail("robots.txt disallows the entire site — this would deindex production");
  }
  if (!/Sitemap:/i.test(robots)) warn("robots.txt does not advertise a Sitemap:");
}

// 4. No unreplaced deploy-time placeholders in shipped text files.
const textFiles = readdirSync(CLIENT).filter((f) => /\.(html|txt|xml|json|webmanifest|js)$/.test(f));
for (const file of textFiles) {
  const body = readFileSync(resolve(CLIENT, file), "utf8");
  for (const name of new Set([...body.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)].map((m) => m[1]))) {
    // The GTM snippet guards itself against its own unreplaced slot, so an
    // absent container ID degrades cleanly rather than breaking the page.
    if (name === "GTM_ID") warn(`{{GTM_ID}} not substituted in ${file} — analytics disabled (snippet self-guards)`);
    else fail(`unreplaced placeholder {{${name}}} shipped in ${file}`);
  }
}

// ---- report -------------------------------------------------------------
if (warnings.length) {
  console.log("\nWarnings\n");
  for (const w of warnings) console.log(`  - ${w}`);
  console.log();
}
if (failures.length) {
  console.error("\nProduction build verification FAILED\n");
  for (const f of failures) console.error(`  - ${f}`);
  console.error();
  process.exit(1);
}
console.log("\nProduction build verified — Worker entry, client assets and crawler files all present.");
