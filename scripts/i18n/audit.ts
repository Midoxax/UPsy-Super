// i18n gate, run in CI.
//
// 1. Every English key must exist in French and Arabic (hand-written in
//    locales/<lang>.ts or machine-written in locales/auto/<lang>.json).
// 2. English typed straight into components is counted per file against
//    i18n-baseline.json. A file may only go down: a new hardcoded string
//    fails, removing some lowers the bar for good (--update rewrites it).
//
//   npx tsx scripts/i18n/audit.ts            check
//   npx tsx scripts/i18n/audit.ts --update   accept the current counts
//   npx tsx scripts/i18n/audit.ts --report   list the worst files
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { missingKeys, TARGETS, type Target } from "./shared";

const BASELINE = "i18n-baseline.json";
const args = new Set(process.argv.slice(2));
let failed = false;

for (const target of Object.keys(TARGETS) as Target[]) {
  const missing = missingKeys(target);
  if (missing.length) {
    failed = true;
    console.error(
      `✗ ${target}: ${missing.length} English keys have no translation`,
    );
    for (const k of missing.slice(0, 20)) console.error(`    ${k}`);
    console.error(`  Run: npx tsx scripts/i18n/translate.ts ${target}`);
  } else console.log(`✓ ${target}: every English key is translated`);
}

/** Visible English in a component: JSX text and user-facing string props. */
export function countHardcoded(source: string): number {
  let n = 0;
  for (const m of source.matchAll(
    />\s*([A-Z][A-Za-z'’,.!?&\- ]{3,}[a-z][^<>{}]*)\s*</g,
  ))
    if (m[1].trim().split(/\s+/).length >= 2) n++;
  for (const m of source.matchAll(
    /\b(title|desc|description|placeholder|aria-label|label|alt)=\{?["'`]([A-Z][^"'`{}]{6,})["'`]/g,
  ))
    if (m[2].split(/\s+/).length >= 2) n++;
  return n;
}

const files = execSync("git ls-files 'src/**/*.tsx'")
  .toString()
  .trim()
  .split("\n");
const counts: Record<string, number> = {};
for (const f of files) {
  const n = countHardcoded(readFileSync(f, "utf8"));
  if (n) counts[f] = n;
}
const total = Object.values(counts).reduce((a, b) => a + b, 0);

if (args.has("--update") || !existsSync(BASELINE)) {
  writeFileSync(
    BASELINE,
    JSON.stringify(Object.fromEntries(Object.entries(counts).sort()), null, 2) +
      "\n",
  );
  console.log(
    `Wrote ${BASELINE}: ${total} hardcoded strings in ${Object.keys(counts).length} files.`,
  );
} else {
  const base: Record<string, number> = JSON.parse(
    readFileSync(BASELINE, "utf8"),
  );
  const grew = Object.entries(counts).filter(([f, n]) => n > (base[f] ?? 0));
  const shrank = Object.entries(base).filter(([f, n]) => (counts[f] ?? 0) < n);
  if (grew.length) {
    failed = true;
    console.error(
      "✗ New English typed into components (use t() and add the key to en.ts):",
    );
    for (const [f, n] of grew)
      console.error(`    ${f}: ${base[f] ?? 0} → ${n}`);
  } else
    console.log(
      `✓ No new hardcoded English (${total} left to move into the dictionaries).`,
    );
  if (shrank.length)
    console.log(
      `  ${shrank.length} file(s) improved; run with --update to lock that in.`,
    );
}

if (args.has("--report"))
  for (const [f, n] of Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40))
    console.log(String(n).padStart(4), f);

process.exit(failed ? 1 : 0);
