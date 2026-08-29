#!/usr/bin/env node
/**
 * Asks the database what it actually contains.
 *
 * WHY THIS EXISTS
 *
 * `check-supabase-sync.mjs` compares migrations against generated types, which
 * is a snapshot. It cannot distinguish "this migration never applied" from
 * "the types are older than this migration" — and those need opposite fixes.
 * Only the database can answer, so this asks it.
 *
 * HOW IT ASKS
 *
 * PostgREST distinguishes the two cases that matter, without needing any
 * privileged credential:
 *
 *   - a table that does not exist answers 404 with code PGRST205, because the
 *     relation is missing from the schema cache;
 *   - a table that exists but grants the anonymous role nothing answers 200
 *     with an empty array, because row-level security filters rows — it does
 *     not hide the relation.
 *
 * So the public anon key is enough to prove existence, and only existence: the
 * request selects zero rows (`limit=0`) and reads no data. That matters here —
 * this runs against the production database of a mental-health platform, and a
 * diagnostic has no business reading patient rows.
 *
 * A control table that is known to exist runs first. Without it, a bad key or a
 * paused project would answer 4xx for everything and read as "no migrations
 * applied", which is the same misdiagnosis that makes people stop trusting a
 * check. If the control fails, this reports the connection as broken and stops
 * rather than blaming the schema.
 *
 * Usage:
 *   npm run check:database                    # reads .env
 *   SUPABASE_URL=... SUPABASE_KEY=... node scripts/check-database.mjs
 *
 * Needs network access to *.supabase.co. Sandboxes and locked-down CI runners
 * often block it; that is a skip, not a failure, and is reported as such.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// --- configuration ----------------------------------------------------------
function fromEnvFile(key) {
  const p = resolve(ROOT, ".env");
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8").match(new RegExp(`^${key}\\s*=\\s*"?([^"\\n]+)"?`, "m"))?.[1]?.trim() ?? null;
}

const URL_BASE = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || fromEnvFile("VITE_SUPABASE_URL") || "").replace(/\/$/, "");
const KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || fromEnvFile("VITE_SUPABASE_PUBLISHABLE_KEY") || "";

if (!URL_BASE || !KEY) {
  console.error(
    "No Supabase URL or key.\n" +
      "  Set SUPABASE_URL and SUPABASE_KEY, or keep VITE_SUPABASE_URL and\n" +
      "  VITE_SUPABASE_PUBLISHABLE_KEY in .env. The publishable (anon) key is\n" +
      "  sufficient and is public by design."
  );
  process.exit(1);
}

/** A table that certainly exists, to tell a broken connection from a missing table. */
const CONTROL = process.env.CONTROL_TABLE || "profiles";

/** Tables to verify: whatever check-supabase-sync.mjs recorded as unproven. */
const PENDING = resolve(ROOT, "supabase/pending-migrations.json");
const targets = existsSync(PENDING)
  ? (JSON.parse(readFileSync(PENDING, "utf8")).pending ?? []).map((p) => p.table)
  : [];

// The project ref is what `supabase link` wants, so resolve it properly rather
// than printing a URL into a command that would not run.
const configPath = resolve(ROOT, "supabase/config.toml");
const project =
  URL_BASE.match(/^https:\/\/([a-z0-9]{20})\.supabase\.co/)?.[1] ??
  (existsSync(configPath) ? readFileSync(configPath, "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m)?.[1] : null) ??
  "<project-ref>";
console.log(`Querying project ${project}\n`);

/**
 * Resolve a table to "present" | "absent" | "unknown".
 * Selects zero rows: this proves the relation resolves and reads no data.
 */
async function probe(table) {
  let res;
  try {
    res = await fetch(`${URL_BASE}/rest/v1/${encodeURIComponent(table)}?select=*&limit=0`, {
      headers: { apikey: KEY, authorization: `Bearer ${KEY}`, accept: "application/json" },
    });
  } catch (e) {
    return { state: "unreachable", detail: e.message };
  }
  if (res.status === 200) return { state: "present", detail: "200" };

  const body = await res.text().catch(() => "");
  let json = null;
  try {
    json = JSON.parse(body);
  } catch {
    /* handled below — a non-JSON body is the tell */
  }

  // PostgREST answers JSON for every outcome, including its errors. A non-JSON
  // error body therefore did not come from the database: it is a proxy, a WAF,
  // or an egress allowlist answering on its behalf. Calling that a schema
  // problem is the misdiagnosis this check is built to avoid, so treat it as a
  // network condition and report it as one.
  if (!json) {
    return { state: "unreachable", detail: `${res.status} from an intermediary: ${body.slice(0, 120) || "(empty body)"}` };
  }

  const code = json.code ?? "";
  // PGRST205: relation absent from the schema cache. PGRST106: schema not exposed.
  if (res.status === 404 && (code === "PGRST205" || /Could not find the table/i.test(body))) {
    return { state: "absent", detail: `404 ${code}` };
  }
  return { state: "unknown", detail: `${res.status} ${code || (json.message ?? "").slice(0, 120)}` };
}

// --- control ----------------------------------------------------------------
const control = await probe(CONTROL);
console.log(`  control  ${CONTROL}: ${control.state} (${control.detail})`);

if (control.state === "unreachable") {
  console.log(
    `\nSKIPPED — cannot reach ${URL_BASE}.\n` +
      `  ${control.detail}\n\n` +
      `  Nothing answered for the database, so nothing about the schema is proven\n` +
      `  either way. Re-run from a machine or CI runner with outbound access to\n` +
      `  *.supabase.co. Exiting 0: an unrun check must not read as a passing one,\n` +
      `  but it must not fail a build for a condition the build cannot fix.`
  );
  process.exit(0);
}
if (control.state !== "present") {
  console.error(
    `\nCONNECTION CHECK FAILED — the control table answered "${control.state}" (${control.detail}).\n\n` +
      `  ${CONTROL} exists in every version of this schema, so this is a connection\n` +
      `  problem, not a schema problem: a wrong or rotated key, a paused project, or\n` +
      `  a URL pointing at the wrong project. Nothing below would be trustworthy.\n\n` +
      `  Verified: ${URL_BASE}`
  );
  process.exit(1);
}

// --- targets ----------------------------------------------------------------
if (!targets.length) {
  console.log("\nNo pending tables recorded — nothing to verify.");
  process.exit(0);
}

console.log("\n  pending migrations");
const absent = [];
const unknown = [];
for (const t of targets) {
  const r = await probe(t);
  console.log(`    ${r.state.padEnd(8)} ${t}  (${r.detail})`);
  if (r.state === "absent") absent.push(t);
  else if (r.state !== "present") unknown.push(`${t}: ${r.detail}`);
}

console.log();
if (unknown.length) {
  console.error("INCONCLUSIVE\n");
  for (const u of unknown) console.error(`  - ${u}`);
  console.error("\n  The control table resolved, so the connection is fine. Investigate these directly.\n");
  process.exit(1);
}

if (absent.length) {
  console.error("MIGRATIONS NOT APPLIED\n");
  for (const t of absent) console.error(`  - ${t} does not exist in project ${project}`);
  console.error(
    `\n  The migration that creates ${absent.length === 1 ? "it" : "them"} is committed but has not reached the\n` +
      `  database. Apply it:\n\n` +
      `      supabase link --project-ref ${project}\n` +
      `      supabase db push\n\n` +
      `  Then regenerate types and clear the entries from\n` +
      `  supabase/pending-migrations.json in the same commit:\n\n` +
      `      supabase gen types typescript --project-id ${project} > src/integrations/supabase/types.ts\n`
  );
  process.exit(1);
}

console.log(`All ${targets.length} pending table(s) exist in ${project}.`);
console.log("Regenerate types and clear supabase/pending-migrations.json — the migrations landed.");
