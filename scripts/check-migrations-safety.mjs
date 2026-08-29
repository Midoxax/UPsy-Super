// Static security scan of supabase/migrations — catches the regression class
// the Supabase linter flags, at the source, without DB access: a CREATE TABLE
// in the public schema that never gets ENABLE ROW LEVEL SECURITY, or never
// gets a GRANT, across the entire migration corpus.
//
// Baseline mode: the historical corpus predates the GRANT-enforcement rule,
// so a strict scan would fail forever. We snapshot the current violation set
// into scripts/migrations-safety-baseline.json and CI fails ONLY on violations
// that are NOT in the baseline — i.e. genuine regressions in new migrations.
// Improvement (a baseline entry fixed) is reported but does not fail.
//
//   node scripts/check-migrations-safety.mjs            # compare vs baseline
//   node scripts/check-migrations-safety.mjs --update   # rewrite baseline
//
// Exit 1 on new regressions; 0 otherwise.

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = new URL("../supabase/migrations", import.meta.url).pathname;
const BASELINE_FILE = new URL("migrations-safety-baseline.json", import.meta.url).pathname;
const FAIL = "\x1b[31m";
const WARN = "\x1b[33m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const updateMode = process.argv.includes("--update");

function listSqlFiles(dir) {
  let out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out = out.concat(listSqlFiles(full));
    else if (entry.endsWith(".sql")) out.push(full);
  }
  return out.sort();
}

function findMatches(sql, re) {
  const out = [];
  let m;
  while ((m = re.exec(sql)) !== null) out.push(m);
  return out;
}

function collectViolations() {
  let files;
  try {
    files = listSqlFiles(MIGRATIONS_DIR);
  } catch {
    return { files: 0, violations: [] };
  }
  if (files.length === 0) return { files: 0, violations: [] };

  const created = new Map();
  const rlsEnabled = new Set();
  const granted = new Set();
  const definerFns = new Map();
  const anonExecFns = new Set();

  for (const file of files) {
    const sql = readFileSync(file, "utf8");
    for (const m of findMatches(sql, /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.("?[a-z_][a-z0-9_]*"?)\s*\(/gi)) {
      const name = m[1].replace(/"/g, "");
      if (!created.has(name)) created.set(name, file);
    }
    for (const m of findMatches(sql, /ALTER\s+TABLE\s+public\.("?[a-z_][a-z0-9_]*"?)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi)) {
      rlsEnabled.add(m[1].replace(/"/g, ""));
    }
    for (const m of findMatches(sql, /GRANT\s+[^;]+?\s+ON\s+public\.("?[a-z_][a-z0-9_]*"?)\s+TO/gi)) {
      granted.add(m[1].replace(/"/g, ""));
    }
    for (const m of findMatches(sql, /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\.("?[a-z_][a-z0-9_]*"?)\s*\([^)]*\)[\s\S]*?SECURITY\s+DEFINER/gi)) {
      const name = m[1].replace(/"/g, "");
      if (!definerFns.has(name)) definerFns.set(name, file);
    }
    for (const m of findMatches(sql, /GRANT\s+EXECUTE\s+ON\s+(?:FUNCTION\s+)?public\.("?[a-z_][a-z0-9_]*"?)\s+TO\s+anon/gi)) {
      anonExecFns.add(m[1].replace(/"/g, ""));
    }
  }

  const violations = [];
  for (const [name, file] of created) {
    if (!rlsEnabled.has(name)) violations.push(`${"rls_missing"}:${name}:${file.split("/").pop()}`);
    if (!granted.has(name)) violations.push(`${"grant_missing"}:${name}:${file.split("/").pop()}`);
  }
  for (const [name, file] of definerFns) {
    if (!anonExecFns.has(name)) continue;
    const sql = readFileSync(file, "utf8");
    const bodyRe = new RegExp(`CREATE\\s+(?:OR\\s+REPLACE\\s+)?FUNCTION\\s+public\\.${name}\\s*\\([^)]*\\)[\\s\\S]*?\\$\\$`, "i");
    const bm = bodyRe.exec(sql);
    const hasGuard = bm ? /has_role\s*\(/i.test(bm[0]) : false;
    if (!hasGuard) violations.push(`anon_security_definer_no_guard:${name}:${file.split("/").pop()}`);
  }
  return { files: files.length, violations: violations.sort() };
}

function loadBaseline() {
  try {
    return new Set(JSON.parse(readFileSync(BASELINE_FILE, "utf8")));
  } catch {
    return new Set();
  }
}

function main() {
  const { files, violations } = collectViolations();
  if (files === 0) {
    console.log(`${DIM}no migrations — skipping${RESET}`);
    process.exit(0);
  }

  if (updateMode) {
    writeFileSync(BASELINE_FILE, JSON.stringify(violations, null, 2) + "\n");
    console.log(`${GREEN}baseline written: ${violations.length} entries${RESET}`);
    process.exit(0);
  }

  const baseline = loadBaseline();
  const current = new Set(violations);
  const newViolations = violations.filter((v) => !baseline.has(v));
  const fixed = [...baseline].filter((v) => !current.has(v));

  if (newViolations.length === 0) {
    console.log(`${DIM}migrations safety: ${files} files, ${violations.length} known violations (baselineed), ${fixed.length} fixed since baseline${RESET}`);
    if (fixed.length > 0) {
      console.log(`${GREEN}${fixed.length} previously-flagged issue(s) resolved — run \`node scripts/check-migrations-safety.mjs --update\` to refresh the baseline${RESET}`);
    }
    process.exit(0);
  }

  for (const v of newViolations) {
    const [rule, table, file] = v.split(":");
    const sev = rule === "anon_security_definer_no_guard" ? WARN : FAIL;
    const label = sev === WARN ? "warn" : "error";
    console.log(`${sev}[${label}]${RESET} ${rule} on public.${table} (new — created/changed in ${file})`);
  }
  console.log(`\n${FAIL}${newViolations.length} new regression(s) beyond baseline${RESET}`);
  process.exit(1);
}

main();
