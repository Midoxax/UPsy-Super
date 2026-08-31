#!/usr/bin/env node
/**
 * Where the build actually landed.
 *
 * WHY THIS FILE EXISTS
 *
 * The same `vite build` writes to two different places depending on who runs it:
 *
 *   inside Lovable   → dist/server + dist/client
 *   anywhere else    → .output/server + .output/client
 *
 * That is not a bug in either environment. `@lovable.dev/vite-tanstack-config`
 * pins `nitro.output` to `dist/` only when it detects the Lovable sandbox
 * (`isSandbox`); outside it, nitro keeps its own default, which is `.output/`.
 * So a `--config dist/server/wrangler.json` hardcoded into a deploy script is
 * correct in one environment and a file-not-found in the other — which is
 * exactly the failure mode that makes a deploy job die eight minutes in.
 *
 * Everything that needs a built path resolves it here instead of guessing:
 * whichever tree exists wins, and if both exist the more recently written one
 * wins, so a stale `dist/` left over from a previous run cannot shadow a fresh
 * `.output/`.
 *
 * Usage from a script:      import { buildDirs } from "./build-output.mjs";
 * Usage from a shell/CI:    node scripts/build-output.mjs --wrangler
 *                           node scripts/build-output.mjs --client
 *                           node scripts/build-output.mjs --server
 */
import { existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const CANDIDATES = [".output", "dist"];

/** mtime of a path, or 0 when it does not exist. */
const mtime = (p) => (existsSync(p) ? statSync(p).mtimeMs : 0);

/**
 * Resolve the build root, preferring the tree that actually contains a Worker
 * entry; ties broken by freshness. Returns `null` when nothing was built.
 */
export function buildRoot() {
  const built = CANDIDATES.map((name) => ({ name, dir: resolve(ROOT, name) }))
    .filter(({ dir }) => existsSync(resolve(dir, "server", "index.mjs")))
    .sort((a, b) => mtime(resolve(b.dir, "server")) - mtime(resolve(a.dir, "server")));

  if (built.length > 0) return built[0].dir;

  // Nothing has a Worker entry — fall back to any directory that exists at all,
  // so callers can produce a precise "the build is incomplete" message rather
  // than a generic "no build output".
  const present = CANDIDATES.map((n) => resolve(ROOT, n)).filter(existsSync);
  return present[0] ?? null;
}

/**
 * The browser-facing tree, whose name also differs by environment: nitro's own
 * default is `public/`, while the Lovable sandbox config renames it `client/`.
 * Probed rather than assumed, for the same reason as the root above; when
 * neither exists yet the nitro default is returned so the caller's "missing"
 * message names a real path.
 */
function clientDir(root) {
  for (const name of ["public", "client"]) {
    const dir = resolve(root, name);
    if (existsSync(dir)) return dir;
  }
  return resolve(root, "public");
}

/** `{ root, server, client, wrangler }` absolute paths, or `null` if unbuilt. */
export function buildDirs() {
  const root = buildRoot();
  if (!root) return null;
  return {
    root,
    server: resolve(root, "server"),
    client: clientDir(root),
    wrangler: resolve(root, "server", "wrangler.json"),
  };
}

// ---- CLI ------------------------------------------------------------------
// Prints a path for shell interpolation. Exits non-zero (with the reason on
// stderr) rather than printing an empty string, so `--config $(…)` fails loudly
// instead of handing wrangler an empty argument.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const dirs = buildDirs();
  if (!dirs) {
    console.error("No build output found (looked for .output/ and dist/) — run `npm run build` first.");
    process.exit(1);
  }
  const flag = process.argv[2] ?? "--wrangler";
  const map = {
    "--wrangler": dirs.wrangler,
    "--server": dirs.server,
    "--client": dirs.client,
    "--root": dirs.root,
  };
  const value = map[flag];
  if (!value) {
    console.error(`Unknown flag ${flag}. Use one of: ${Object.keys(map).join(", ")}`);
    process.exit(1);
  }
  // Relative to the repo root: wrangler resolves --config against the cwd, and
  // a relative path keeps CI logs readable.
  console.log(value.startsWith(ROOT) ? value.slice(ROOT.length + 1) : value);
}
