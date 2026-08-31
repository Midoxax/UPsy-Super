#!/usr/bin/env node
/**
 * Phase 2, step 3 — prove the new database is the old database.
 *
 * A restore that prints no errors is not evidence. pg_dump can skip a table it
 * had no permission to read, a foreign key can silently reject a batch under
 * `ON_ERROR_STOP` being lost to a heredoc, and a trigger disabled for the load
 * can leave a derived table empty. Every one of those failures looks like a
 * clean run at the end.
 *
 * So this compares the two databases directly, and refuses to be optimistic:
 *
 *   1. Row count per table in `public`, both sides, diffed.
 *   2. Account count in `auth.users`, both sides.
 *   3. RLS enabled/disabled per table, both sides — the security posture is
 *      part of the data, and a table that arrives with RLS off is a breach,
 *      not a warning.
 *   4. Policy count per table, both sides.
 *   5. Tables present in one and not the other, in either direction.
 *
 * Exits non-zero on any difference. Do not flip DNS until this is green.
 *
 * Usage:
 *   export SOURCE_DB_URL='...'   # the Lovable-managed project
 *   export TARGET_DB_URL='...'   # the project on your own account
 *   bun run exit:verify
 */
import { execFileSync } from "node:child_process";

const SOURCE = process.env["SOURCE_DB_URL"];
const TARGET = process.env["TARGET_DB_URL"];

if (!SOURCE || !TARGET) {
  console.error("Both SOURCE_DB_URL and TARGET_DB_URL must be set.");
  process.exit(1);
}

/** Run a query and return rows as arrays of strings. */
function query(url, sql) {
  const out = execFileSync("psql", [url, "-tAF", "\u0001", "-c", sql], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return out
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => line.split("\u0001"));
}

// Row counts come from a live count(*), not from pg_class.reltuples, which is
// an estimate and can be wildly wrong on a freshly restored database that has
// never been analysed.
const COUNTS = `
  select relname, (xpath('/row/c/text()',
           query_to_xml(format('select count(*) as c from public.%I', relname),
                        false, true, '')))[1]::text::bigint as n
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
  order by relname
`;

const SECURITY = `
  select c.relname,
         c.relrowsecurity::text,
         (select count(*) from pg_policy p where p.polrelid = c.oid)::text
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
  order by c.relname
`;

const toMap = (rows) => new Map(rows.map(([k, ...rest]) => [k, rest]));

console.log("Reading source…");
const srcCounts = toMap(query(SOURCE, COUNTS));
const srcSec = toMap(query(SOURCE, SECURITY));
const srcUsers = query(SOURCE, "select count(*) from auth.users")[0][0];

console.log("Reading target…");
const tgtCounts = toMap(query(TARGET, COUNTS));
const tgtSec = toMap(query(TARGET, SECURITY));
const tgtUsers = query(TARGET, "select count(*) from auth.users")[0][0];

const problems = [];

for (const table of srcCounts.keys()) {
  if (!tgtCounts.has(table)) {
    problems.push(`MISSING TABLE  ${table} — exists in source, absent from target`);
  }
}
for (const table of tgtCounts.keys()) {
  if (!srcCounts.has(table)) {
    problems.push(`EXTRA TABLE    ${table} — exists in target, absent from source`);
  }
}

for (const [table, [n]] of srcCounts) {
  const t = tgtCounts.get(table);
  if (!t) continue;
  if (t[0] !== n) problems.push(`ROW COUNT      ${table}: source ${n}, target ${t[0]}`);
}

for (const [table, [rls, policies]] of srcSec) {
  const t = tgtSec.get(table);
  if (!t) continue;
  if (t[0] !== rls) {
    problems.push(
      `RLS           ${table}: source ${rls === "true" ? "enabled" : "DISABLED"}, ` +
        `target ${t[0] === "true" ? "enabled" : "DISABLED"}`,
    );
  }
  if (t[1] !== policies) {
    problems.push(`POLICY COUNT  ${table}: source ${policies}, target ${t[1]}`);
  }
}

if (srcUsers !== tgtUsers) {
  problems.push(`ACCOUNTS      auth.users: source ${srcUsers}, target ${tgtUsers}`);
}

// A table with RLS off in BOTH databases is a pre-existing hole, not a
// migration defect — but the cutover is the right moment to see it.
const openTables = [...tgtSec.entries()]
  .filter(([, [rls]]) => rls !== "true")
  .map(([t]) => t);

console.log("");
console.log(`Tables compared : ${srcCounts.size}`);
console.log(`Accounts        : ${srcUsers} → ${tgtUsers}`);

if (openTables.length > 0) {
  console.log("");
  console.log(`Note: ${openTables.length} table(s) have RLS disabled on BOTH sides:`);
  for (const t of openTables) console.log(`  • ${t}`);
  console.log("Not a restore failure, but review before the domain goes live.");
}

if (problems.length > 0) {
  console.error("");
  console.error(`PARITY FAILED — ${problems.length} difference(s):`);
  console.error("");
  for (const p of problems) console.error(`  ${p}`);
  console.error("");
  console.error("Do not point the domain at the new database until this is clean.");
  process.exit(1);
}

console.log("");
console.log("Parity OK — every table, row count, RLS flag and policy count matches.");
