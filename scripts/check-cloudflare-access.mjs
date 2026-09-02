#!/usr/bin/env node
/**
 * Turns a Cloudflare deploy failure into a named cause.
 *
 * `wrangler deploy` reports every credential problem as the same line:
 *
 *   A request to the Cloudflare API (/accounts/***\/workers/services/...) failed.
 *   Authentication error [code: 10000]
 *
 * That single message covers a revoked token, a token scoped to the wrong
 * account, a token missing the Workers Scripts permission, and an account id
 * that simply does not match the token — four different fixes behind one string.
 * Worse, wrangler prints it only after the build has already run, and its
 * follow-up "you are logged in as ..." line reports the token's OWN account,
 * which is easy to misread as confirmation that CLOUDFLARE_ACCOUNT_ID is right.
 *
 * This script asks the three questions separately, before the build, and names
 * which one failed. It prints no secret values: tokens and account ids are
 * reported only as present/absent and by length.
 *
 * Exit codes: 0 all checks passed, 1 a check failed, 2 required env missing.
 */
const API = "https://api.cloudflare.com/client/v4";
const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

const mask = (v) => (v ? `set (${v.length} chars)` : "MISSING");
console.log(`CLOUDFLARE_API_TOKEN   ${mask(token)}`);
console.log(`CLOUDFLARE_ACCOUNT_ID  ${mask(accountId)}`);

if (!token || !accountId) {
  console.error("::error::CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must both be set.");
  process.exit(2);
}
if (/\s/.test(token) || /\s/.test(accountId)) {
  console.error("::error::A Cloudflare secret contains whitespace — it was probably pasted with a trailing newline or space.");
  process.exit(1);
}

const call = async (path) => {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15000),
  });
  let body = {};
  try { body = await res.json(); } catch { /* non-JSON error page */ }
  return { status: res.status, ok: body?.success === true, body };
};

const firstError = (b) =>
  Array.isArray(b?.errors) && b.errors.length
    ? `${b.errors[0].code}: ${b.errors[0].message}`
    : "no error detail returned";

let failed = false;
const report = (name, ok, detail) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed = true;
};

// 1. Is the token itself valid and active?
const verify = await call("/user/tokens/verify");
report(
  "token is valid and active",
  verify.ok && verify.body?.result?.status === "active",
  verify.ok ? `status=${verify.body?.result?.status}` : firstError(verify.body),
);

// 2. Can this token see the account the workflow is deploying into? This is the
//    check that distinguishes a good token from a good token pointed at the
//    wrong account id — the failure mode wrangler cannot describe.
const account = await call(`/accounts/${accountId}`);
report(
  "token can access CLOUDFLARE_ACCOUNT_ID",
  account.ok,
  account.ok
    ? `account name: ${account.body?.result?.name ?? "unknown"}`
    : `HTTP ${account.status} — ${firstError(account.body)}. The token is not scoped to this account id, or the id is wrong.`,
);

// 3. Does the token actually carry Workers Scripts permission on that account?
//    A token created from a non-Workers template authenticates fine and still
//    cannot deploy.
const scripts = await call(`/accounts/${accountId}/workers/scripts`);
report(
  "token has Workers Scripts access on that account",
  scripts.ok,
  scripts.ok
    ? `${scripts.body?.result?.length ?? 0} existing worker script(s)`
    : `HTTP ${scripts.status} — ${firstError(scripts.body)}. Recreate the token from the "Edit Cloudflare Workers" template with Account Resources set to this account.`,
);

if (failed) {
  console.error("::error::Cloudflare preflight failed — see the FAIL line(s) above. Fix that before the deploy step runs.");
  process.exit(1);
}
console.log("Cloudflare preflight passed — token, account and Workers permission all check out.");
