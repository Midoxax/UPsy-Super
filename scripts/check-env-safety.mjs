#!/usr/bin/env node
/**
 * Guards against committing a secret to a tracked .env file.
 *
 * Why this exists: .env is tracked in this repository. That is survivable
 * today because it holds only VITE_-prefixed values, which Vite inlines into
 * the client bundle and are therefore public by definition — the Supabase
 * anon key included, since row-level security is what actually protects that
 * data.
 *
 * The danger is the next engineer. Adding SUPABASE_SERVICE_ROLE_KEY, a Stripe
 * secret or a Resend key to that same file feels natural and commits a live
 * credential to git history, where it is effectively permanent. On a platform
 * holding clinical records that is the difference between a config change and
 * a breach.
 *
 * So the rule is narrow and mechanical: anything in a tracked .env that is not
 * VITE_-prefixed is either useless (Vite will not expose it to the client) or
 * a secret that must not be in git. Both cases are a failure. Real secrets
 * belong in the hosting provider's environment settings, or in .env.local,
 * which .gitignore excludes.
 */
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const ALLOWED_PREFIX = "VITE_";

/**
 * Platform-generated, publishable-by-design keys.
 *
 * Lovable Cloud writes these three into .env itself and rewrites the file on
 * every backend change, so they cannot be moved to .env.local without being
 * regenerated on the next sync. They are the same public project identifier
 * and publishable key already exposed through their VITE_ twins — row-level
 * security, not obscurity, is what protects that data. Nothing else is
 * exempt: a service-role key or a Resend key added to this file still fails.
 */
const ALLOWED_KEYS = new Set([
  "SUPABASE_PROJECT_ID",
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
]);

function trackedEnvFiles() {
  try {
    return execSync("git ls-files", { encoding: "utf8" })
      .split("\n")
      .filter((f) => /(^|\/)\.env($|\.)/.test(f) && !f.endsWith(".example"));
  } catch {
    return existsSync(".env") ? [".env"] : [];
  }
}

const offenders = [];
for (const file of trackedEnvFiles()) {
  if (!existsSync(file)) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (!match) return;
    const key = match[1];
    if (!key.startsWith(ALLOWED_PREFIX) && !ALLOWED_KEYS.has(key)) {
      offenders.push({ file, line: i + 1, key });
    }
  });
}

if (offenders.length > 0) {
  console.error("\nCommitted secret check FAILED\n");
  for (const o of offenders) {
    console.error(`  ${o.file}:${o.line}  ${o.key}`);
  }
  console.error(
    `\n${offenders.length} non-${ALLOWED_PREFIX} key(s) in a tracked .env file.\n` +
      `Vite only exposes ${ALLOWED_PREFIX}* to the client, so these are either dead\n` +
      `config or a credential now committed to git history.\n\n` +
      `Move them to your hosting provider's environment settings, or to\n` +
      `.env.local (gitignored) for local development.\n`
  );
  process.exit(1);
}

console.log("Committed secret check passed — tracked .env files hold only VITE_* public values.");
