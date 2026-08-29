#!/usr/bin/env node
/**
 * Runtime contract guard.
 *
 * This exists because of a real failure. The unit suite passed locally on Node
 * 22 and crashed in CI on Node 20 — jsdom depends on undici, which calls
 * `webidl.util.markAsUncloneable`, an API Node 20 does not have. The contract
 * was documented in DEPLOYMENT.md and still drifted, because documentation
 * cannot fail a build.
 *
 * Two independent checks:
 *
 *  1. Do the declarations agree with each other? `.nvmrc` drives local shells
 *     and CI (via node-version-file); `engines.node` drives Vercel's build
 *     image and npm's own warning. Nothing keeps those two in sync, so a
 *     half-finished version bump can leave local and production on different
 *     majors with everything still green.
 *
 *  2. Does the Node actually executing this satisfy them? A green `npm run
 *     verify` on the wrong major proves nothing about CI or production.
 *
 * Runs first in `npm run verify` and in CI, so a mismatch fails immediately
 * with an actionable message rather than surfacing later as an unrelated
 * TypeError deep inside a dependency.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(resolve(ROOT, f), "utf8");

const pkg = JSON.parse(read("package.json"));
const enginesRange = pkg.engines?.node;
if (!enginesRange) {
  console.error("package.json declares no engines.node — the runtime is unpinned.");
  process.exit(1);
}

const nvmrcPath = resolve(ROOT, ".nvmrc");
if (!existsSync(nvmrcPath)) {
  console.error("No .nvmrc — local shells and CI have nothing to pin against.");
  process.exit(1);
}
const nvmrc = read(".nvmrc").trim().replace(/^v/, "");

/** Leading major from a range like "22.x", ">=22", "^22.1.0" or "22". */
const majorOf = (s) => {
  const m = String(s).match(/(\d+)/);
  return m ? Number(m[1]) : NaN;
};

const enginesMajor = majorOf(enginesRange);
const nvmrcMajor = majorOf(nvmrc);
const runningMajor = Number(process.versions.node.split(".")[0]);

const problems = [];

if (Number.isNaN(enginesMajor) || Number.isNaN(nvmrcMajor)) {
  problems.push(`Could not parse a major version from engines.node="${enginesRange}" or .nvmrc="${nvmrc}".`);
} else if (enginesMajor !== nvmrcMajor) {
  problems.push(
    `Declaration drift: .nvmrc pins Node ${nvmrcMajor} but engines.node says "${enginesRange}" (major ${enginesMajor}).\n` +
      `  .nvmrc drives local shells and CI; engines.node drives Vercel's build image.\n` +
      `  Left split, local and production run different majors with everything green.`
  );
}

if (!Number.isNaN(enginesMajor) && runningMajor !== enginesMajor) {
  problems.push(
    `Running Node ${process.versions.node}, but this project pins Node ${enginesMajor}.\n` +
      `  A pass on the wrong major proves nothing about CI or production — that is\n` +
      `  exactly how a green local run shipped a CI failure. Run \`nvm use\`.`
  );
}

if (problems.length) {
  console.error("\nRuntime contract check FAILED\n");
  for (const p of problems) console.error(`  - ${p}\n`);
  console.error(
    "To change the pinned version, update .nvmrc and engines.node together,\n" +
      "then re-run the full pipeline. See the runtime contract in DEPLOYMENT.md.\n"
  );
  process.exit(1);
}

console.log(
  `Runtime contract OK — Node ${process.versions.node}, npm ${process.env.npm_config_user_agent?.match(/npm\/(\S+)/)?.[1] ?? "?"}; ` +
    `.nvmrc and engines.node both pin major ${enginesMajor}.`
);
