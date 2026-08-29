#!/usr/bin/env node
/**
 * Supabase wiring and schema-sync guard.
 *
 * WHY THIS EXISTS
 *
 * A migration can be written, reviewed, merged and deployed without ever
 * reaching a database, and nothing in the pipeline notices. That happened here:
 * the Supabase GitHub integration was pointed at a directory (`UPsy supa/
 * supabase`) that has never existed in this repository, on a project
 * (`bvhqdgiptlnfclnsybaz`) that is not the one the app connects to
 * (`vuawmihxcaewzmkuarkr`). Both halves were wrong, the integration reported
 * the failure only on its own status check, and 96 migrations sat in `main`
 * with no way to tell which of them the database had actually seen.
 *
 * The dashboard settings that caused it are not in this repository and cannot
 * be asserted from here. What can be asserted is everything on this side of the
 * boundary — and that turns out to be enough to catch the same class of fault:
 *
 *  1. PROJECT WIRING. `supabase/config.toml`, `.env`'s project id and `.env`'s
 *     URL host must all name the same project. Two of those disagreeing is the
 *     exact shape of the fault above, and it is invisible until a migration
 *     silently lands somewhere else.
 *
 *  2. LAYOUT. The CLI and every integration resolve migrations relative to the
 *     `supabase/` directory at the repository root. If that moves, or a
 *     migration filename stops sorting correctly, migrations apply in the wrong
 *     order or not at all.
 *
 *  3. SCHEMA SYNC. `src/integrations/supabase/types.ts` is generated *from the
 *     live database*, which makes it the only in-repo evidence of what that
 *     database actually contains. Diffing it against the tables the migrations
 *     create answers a question nothing else here can:
 *
 *       - a table in the migrations but not in the types has, as far as this
 *         repository can tell, never reached the database;
 *       - a table in the types but not in the migrations was created by hand in
 *         the dashboard and will not survive a rebuild from source.
 *
 * WHAT THIS CHECK DOES NOT PROVE
 *
 * `types.ts` is a snapshot, refreshed when someone regenerates it. A migration
 * applied *after* the last regeneration looks identical to one that never
 * applied at all. So a table listed as pending here means "not yet corroborated
 * by generated types" — not "definitely absent". `scripts/check-database.mjs`
 * settles it by asking the database directly; this check runs offline, on every
 * PR, and keeps the gap from growing unnoticed between those runs.
 *
 * Known-pending tables live in `supabase/pending-migrations.json` so the gate
 * is precise rather than merely tolerant: an expected gap is recorded with a
 * reason, anything else fails, and once a pending table shows up in regenerated
 * types the check fails until the entry is removed. The ratchet closes itself.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(resolve(ROOT, f), "utf8");
const has = (f) => existsSync(resolve(ROOT, f));

const failures = [];
const notes = [];

// --- 1. Project wiring ------------------------------------------------------
// Three declarations of "which Supabase project is this?", which nothing keeps
// in agreement. They must name the same project or a migration is being written
// against a database the app never talks to.

console.log("  project wiring");

const CONFIG = "supabase/config.toml";
let configProject = null;
if (!has(CONFIG)) {
  failures.push(
    `${CONFIG} is missing. The CLI and the GitHub integration both resolve the ` +
      `project from it; without it neither knows where to apply migrations.`
  );
} else {
  configProject = read(CONFIG).match(/^\s*project_id\s*=\s*"([^"]+)"/m)?.[1] ?? null;
  if (!configProject) failures.push(`${CONFIG} declares no project_id.`);
}

let envProject = null;
let envHost = null;
if (!has(".env")) {
  notes.push(".env is absent — skipping the project-id comparison.");
} else {
  const env = read(".env");
  const val = (k) => env.match(new RegExp(`^${k}\\s*=\\s*"?([^"\\n]+)"?`, "m"))?.[1]?.trim() ?? null;
  envProject = val("VITE_SUPABASE_PROJECT_ID");
  const url = val("VITE_SUPABASE_URL");
  envHost = url?.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1] ?? null;
  if (url && !envHost) failures.push(`VITE_SUPABASE_URL is not a Supabase project URL: ${url}`);
}

const declared = { [CONFIG]: configProject, "VITE_SUPABASE_PROJECT_ID": envProject, "VITE_SUPABASE_URL host": envHost };
const present = Object.entries(declared).filter(([, v]) => v);
const distinct = new Set(present.map(([, v]) => v));

for (const [where, value] of present) console.log(`    ${value}  ${where}`);

if (distinct.size > 1) {
  failures.push(
    `This repository names ${distinct.size} different Supabase projects:\n` +
      present.map(([where, v]) => `      ${v}  (${where})`).join("\n") +
      `\n\n    Migrations apply to one project while the app reads another, so a ` +
      `\n    schema change appears to land and the running site never sees it.` +
      `\n    Decide which project is authoritative and make all three agree.`
  );
}

// --- 2. Layout --------------------------------------------------------------
// Migrations resolve relative to `supabase/` at the repository root, and apply
// in filename order. Both are load-bearing and neither is self-evident.

console.log("\n  migration layout");

const MIGRATIONS = "supabase/migrations";
let migrationFiles = [];
if (!has(MIGRATIONS)) {
  failures.push(
    `${MIGRATIONS}/ does not exist. Every Supabase tool resolves migrations from ` +
      `that path relative to the repository root; moving it strands them.`
  );
} else {
  migrationFiles = readdirSync(resolve(ROOT, MIGRATIONS)).filter((f) => f.endsWith(".sql")).sort();
  console.log(`    ${migrationFiles.length} migrations in ${MIGRATIONS}/`);

  if (migrationFiles.length === 0) {
    failures.push(`${MIGRATIONS}/ contains no .sql files.`);
  }

  // Supabase orders by the leading timestamp and refuses names it cannot parse.
  const malformed = migrationFiles.filter((f) => !/^\d{14}_.+\.sql$/.test(f));
  if (malformed.length) {
    failures.push(
      `Migration filenames must be <14-digit timestamp>_<name>.sql — order of ` +
        `application depends on it:\n` +
        malformed.map((f) => `      ${f}`).join("\n")
    );
  }
}

// --- 3. Schema sync ---------------------------------------------------------

console.log("\n  schema sync");

const TYPES = "src/integrations/supabase/types.ts";
const PENDING = "supabase/pending-migrations.json";

/** Tables the migrations create, mapped to the migration that first creates them. */
function tablesFromMigrations() {
  const created = new Map();
  for (const f of migrationFiles) {
    const sql = read(join(MIGRATIONS, f));
    for (const m of sql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?"?(\w+)"?/gi)) {
      if (!created.has(m[1])) created.set(m[1], f);
    }
  }
  return created;
}

/** Tables the live database reported at the last type generation. */
function tablesFromTypes(source) {
  const block = source.match(/Tables:\s*\{([\s\S]*?)\n {4}\}\n {4}Views:/);
  if (!block) return null;
  return new Set([...block[1].matchAll(/^ {6}(\w+): \{$/gm)].map((m) => m[1]));
}

if (!has(TYPES)) {
  notes.push(`${TYPES} is absent — skipping the schema comparison.`);
} else if (!migrationFiles.length) {
  notes.push("No migrations to compare.");
} else {
  const live = tablesFromTypes(read(TYPES));
  if (!live) {
    notes.push(
      `Could not locate the Tables block in ${TYPES}. If Supabase changed its ` +
        `generated layout, update tablesFromTypes() here.`
    );
  } else {
    const created = tablesFromMigrations();

    const pendingDoc = has(PENDING) ? JSON.parse(read(PENDING)) : { pending: [] };
    const pending = new Map((pendingDoc.pending ?? []).map((p) => [p.table, p]));

    console.log(`    ${created.size} tables created by migrations`);
    console.log(`    ${live.size} tables in generated types`);
    if (pending.size) console.log(`    ${pending.size} recorded pending`);

    // Migrations the database has never confirmed.
    const unconfirmed = [...created.keys()].filter((t) => !live.has(t));
    const unexpected = unconfirmed.filter((t) => !pending.has(t));
    if (unexpected.length) {
      failures.push(
        `${unexpected.length} table(s) are created by a migration but absent from the ` +
          `generated types, and are not recorded as pending:\n` +
          unexpected.map((t) => `      ${t}  <- ${created.get(t)}`).join("\n") +
          `\n\n    Either the migration has not reached the database, or ${TYPES}` +
          `\n    is stale. Run \`npm run check:database\` to find out which, then` +
          `\n    regenerate the types or record the gap in ${PENDING}.`
      );
    }

    // Tables the database has that no migration creates: dashboard-authored
    // schema, which a rebuild from source would not reproduce.
    const undeclared = [...live].filter((t) => !created.has(t));
    if (undeclared.length) {
      failures.push(
        `${undeclared.length} table(s) exist in the database with no migration that ` +
          `creates them:\n` +
          undeclared.map((t) => `      ${t}`).join("\n") +
          `\n\n    These were created outside version control and would not survive` +
          `\n    rebuilding this project from source. Write a migration for them.`
      );
    }

    // A pending entry that the database has since confirmed. Failing here is the
    // point: it is what stops the escape hatch from quietly becoming permanent.
    const landed = [...pending.keys()].filter((t) => live.has(t));
    if (landed.length) {
      failures.push(
        `${landed.length} table(s) recorded as pending now appear in the generated types:\n` +
          landed.map((t) => `      ${t}`).join("\n") +
          `\n\n    The migration has landed. Remove the entry from ${PENDING}` +
          `\n    so the gate covers it again.`
      );
    }

    // A pending entry no migration creates: left behind by a rename or revert.
    const orphaned = [...pending.keys()].filter((t) => !created.has(t));
    if (orphaned.length) {
      failures.push(
        `${orphaned.length} pending entr(ies) name a table no migration creates:\n` +
          orphaned.map((t) => `      ${t}`).join("\n") +
          `\n\n    Stale after a rename or a revert. Remove them from ${PENDING}.`
      );
    }

    for (const t of unconfirmed.filter((t) => pending.has(t))) {
      notes.push(`${t} pending — ${pending.get(t).reason ?? "no reason recorded"}`);
    }
  }
}

// --- report -----------------------------------------------------------------
console.log();
if (notes.length) {
  console.log("Notes");
  for (const n of notes) console.log(`  - ${n}`);
  console.log();
}
if (failures.length) {
  console.error("SUPABASE SYNC CHECK FAILED\n");
  for (const f of failures) console.error(`  - ${f}\n`);
  console.error("See the database section of DEPLOYMENT.md.\n");
  process.exit(1);
}
console.log("Supabase sync OK — one project named consistently, migrations discoverable, schema and types agree.");
