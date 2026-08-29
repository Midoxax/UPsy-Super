#!/usr/bin/env node
/**
 * Production verification — asserts the deployed site, not the build output.
 *
 * Every other gate in this repository inspects `dist/`. None of them prove
 * anything about what a user actually receives, because the two can differ in
 * ways that matter enormously:
 *
 *   - `vercel.json` headers only exist if Vercel is reading that file. A
 *     misconfigured project, a different host, or a moved file leaves the CSP
 *     and HSTS silently absent while every local check stays green.
 *   - Deployment Protection puts an auth wall in front of the site. The owner,
 *     already logged in, sees it working. Everyone else sees a login screen.
 *     This check runs unauthenticated, so it catches that.
 *   - A build can succeed and still be served from a stale or wrong deployment.
 *
 * Runs from GitHub Actions rather than a developer machine because the runner
 * has unrestricted egress and is not logged into anything — which is exactly
 * the vantage point of a real visitor.
 *
 * Usage:
 *   npm run check:production                  # uses package.json "homepage"
 *   PROD_URL=https://staging.example node scripts/check-production.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// The production alias is committed in package.json rather than supplied only
// by the environment, so this check is runnable by anyone who clones the repo
// without first being told a URL. PROD_URL still overrides it, which is what
// CI passes when verifying a specific deployment.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const homepage = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")).homepage ?? "";

const URL_BASE = (process.env.PROD_URL || homepage).replace(/\/$/, "");
if (!URL_BASE) {
  console.error(
    'No target. Set "homepage" in package.json or pass PROD_URL=https://... — nothing to verify.'
  );
  process.exit(1);
}

const failures = [];
const warnings = [];
const notes = [];

/** Headers that must be present. Absence means vercel.json is not being applied. */
const REQUIRED_HEADERS = {
  "content-security-policy": {
    why: "XSS containment. Absent means vercel.json headers are not live.",
    expect: (v) => v.includes("frame-ancestors") && v.includes("default-src"),
  },
  "strict-transport-security": {
    why: "Forces HTTPS. Absent leaves a downgrade window on first visit.",
    expect: (v) => /max-age=\d{6,}/.test(v),
  },
  "x-content-type-options": {
    why: "Blocks MIME sniffing.",
    expect: (v) => v.toLowerCase() === "nosniff",
  },
  "referrer-policy": {
    why: "Stops URLs leaking to third parties — URLs can identify a patient.",
    expect: (v) => v.length > 0,
  },
  "permissions-policy": {
    why: "Restricts camera/mic to same-origin for video sessions.",
    expect: (v) => v.length > 0,
  },
};

/** Registrable-ish site key, so apex and www count as the same site. */
const siteOf = (u) => new URL(u).hostname.replace(/^www\./, "");

/**
 * Fetch a document, following a redirect that stays on the same site.
 *
 * `redirect: "manual"` is deliberate — it is how the Vercel SSO wall is
 * detected, since that redirects *off* site to vercel.com/sso-api. But leaving
 * it fully manual made this check measure the wrong response: an apex that
 * 308s to www returns a redirect carrying only the headers Vercel attaches at
 * the domain level, not the ones vercel.json applies to served routes. The
 * result was four "MISSING" security headers on a site that serves all of
 * them — the same misdiagnosis this script exists to prevent, one hop earlier.
 *
 * So: same-site redirects are followed (apex → www is a routing detail, not a
 * finding), cross-site ones are returned untouched for the protection-wall
 * check to interpret.
 */
async function fetchDoc(path, { maxHops = 3 } = {}) {
  let url = URL_BASE + path;
  const hops = [];

  for (let i = 0; i <= maxHops; i++) {
    const res = await fetch(url, {
      redirect: "manual",
      headers: { "user-agent": "upsy-production-check" },
    });

    const location = res.headers.get("location");
    const isRedirect = res.status >= 300 && res.status < 400 && location;
    if (!isRedirect) {
      res.hops = hops;
      return res;
    }

    const next = new URL(location, url).toString();
    // Off-site: hand it back so the caller can recognise an auth wall.
    if (siteOf(next) !== siteOf(url)) {
      res.hops = hops;
      return res;
    }
    hops.push(`${res.status} ${url} -> ${next}`);
    url = next;
  }
  throw new Error(`More than ${maxHops} same-site redirects from ${URL_BASE}${path} — likely a loop`);
}

console.log(`Verifying ${URL_BASE}\n`);

// --- 1. Is the site reachable and public? -----------------------------------
let root;
try {
  root = await fetchDoc("/");
} catch (e) {
  console.error(`Cannot reach ${URL_BASE}: ${e.message}`);
  process.exit(1);
}

console.log(`  status ${root.status}`);

// Vercel's Deployment Protection answers 401 to unauthenticated visitors. The
// owner's browser is authenticated and sees a working site, so this failure is
// invisible from the dashboard — and total for everyone else.
const location = root.headers.get("location") || "";

// Only Vercel can put up Vercel's auth wall. Every response Vercel serves —
// including the SSO wall — carries an x-vercel-id, so its absence on a 401/403
// means something in front of the site answered instead: a corporate proxy, an
// egress allowlist, a WAF. Blaming Deployment Protection for those sends the
// reader to a dashboard toggle that is already correct, and a check that
// misdiagnoses gets distrusted and then ignored.
const servedByVercel =
  root.headers.has("x-vercel-id") || /vercel/i.test(root.headers.get("server") || "");
const namesVercelSso = /vercel\.com\/sso-api|\/\.well-known\/vercel\/protection/.test(location);
const isBlocked = root.status === 401 || root.status === 403;
const isProtectionWall = namesVercelSso || (isBlocked && servedByVercel);

if (isBlocked && !isProtectionWall) {
  console.error("\nCANNOT VERIFY — blocked before reaching the site\n");
  console.error(
    `  ${URL_BASE} answered ${root.status}, but the response did not come from\n` +
      `  Vercel (no x-vercel-id header). Something between this machine and the\n` +
      `  site answered on its behalf — commonly an egress allowlist, a corporate\n` +
      `  proxy, or a WAF.\n\n` +
      `  This is not a verdict on the deployment: nothing about the site was\n` +
      `  reached, so nothing about it is proven. Re-run from a network with\n` +
      `  direct outbound access, such as a GitHub-hosted runner.\n`
  );
  process.exit(1);
}

if (isProtectionWall) {
  // Diagnose the actual cause and stop. Continuing would measure headers on
  // Vercel's SSO redirect rather than on the app, and report five confusing
  // "missing header" failures whose real cause is this one line. A gate that
  // misdiagnoses gets distrusted, then ignored.
  console.error("\nPRODUCTION VERIFICATION FAILED\n");
  console.error(
    `  - The site is behind an authentication wall.\n` +
      `    Root returned ${root.status}${location ? ` -> ${location.slice(0, 80)}` : ""}\n\n` +
      `    This is Vercel Deployment Protection. The owner's browser is already\n` +
      `    signed in and sees a working site; every patient and psychologist sees\n` +
      `    a login screen. Nothing behind it can be verified.\n\n` +
      `    Fix: Vercel -> Settings -> Deployment Protection -> Disabled\n` +
      `    (or "Only Preview Deployments" to keep previews private).\n`
  );
  process.exit(1);
}

for (const hop of root.hops ?? []) notes.push(`Followed same-site redirect: ${hop}`);

// Nothing is served here at all. Stop, for the same reason the auth wall stops:
// headers and routes measured against a 404 describe the error page, and
// reporting five missing security headers hides the one fact that matters. A
// 404 on the *root* of a deployment almost never means "one page is missing" —
// it means this URL is not attached to the project, which is exactly what
// happened when the production alias was left pointing at a retired
// *.vercel.app address after the custom domain was added.
if (root.status >= 400) {
  console.error("\nPRODUCTION VERIFICATION FAILED\n");
  console.error(
    `  - Nothing is served at ${URL_BASE} — the root returned ${root.status}.\n\n` +
      (root.status === 404
        ? `    A 404 on the root is a routing fact, not a content one: the host\n` +
          `    resolves, something answers, and that something does not know about\n` +
          `    this project. Usually the domain is not attached to the deployment.\n\n` +
          `    Check Vercel -> Settings -> Domains and confirm this exact hostname\n` +
          `    is listed, then point "homepage" in package.json at one that is.\n`
        : `    The deployment is failing to serve its root document.\n`) +
      `\n    Header and route results are omitted deliberately: measured against an\n` +
      `    error page they describe the error page, not the application.\n`
  );
  process.exit(1);
} else if (root.status >= 300) {
  // Still a redirect after same-site following means it points off-site and
  // was not an auth wall — worth naming, since headers below describe the
  // redirect rather than the app.
  failures.push(
    `Root redirects off-site to ${location}. Everything measured below describes ` +
      `that redirect, not the application. Verify the destination directly.`
  );
}

// --- 2. Are the security headers actually being served? ---------------------
console.log("\n  security headers");
for (const [name, spec] of Object.entries(REQUIRED_HEADERS)) {
  const value = root.headers.get(name);
  if (!value) {
    failures.push(`Missing "${name}" — ${spec.why}`);
    console.log(`    MISSING  ${name}`);
  } else if (!spec.expect(value)) {
    warnings.push(`"${name}" present but unexpected: ${value.slice(0, 80)}`);
    console.log(`    odd      ${name}`);
  } else {
    console.log(`    ok       ${name}`);
  }
}

// Headers that should NOT be present.
if (root.headers.get("x-powered-by")) {
  warnings.push("x-powered-by is exposed — unnecessary implementation detail.");
}

// --- 3. Is caching configured so repeat visits are cheap? -------------------
const html = await root.text().catch(() => "");
const assetMatch = html.match(/(?:src|href)="(\/assets\/[^"]+\.js)"/);
if (assetMatch) {
  const asset = await fetch(URL_BASE + assetMatch[1]).catch(() => null);
  const cc = asset?.headers.get("cache-control") || "";
  console.log(`\n  asset cache-control: ${cc || "(none)"}`);
  if (!cc.includes("immutable")) {
    warnings.push(
      `Hashed assets are not served immutable (${cc || "no cache-control"}). ` +
        `Repeat visitors re-download the bundle on every visit.`
    );
  }
} else {
  warnings.push("Could not find a hashed asset in the served HTML.");
}

// --- 4. Do the routes a pilot user needs actually respond? ------------------
const ROUTES = ["/", "/psychologists", "/services", "/pricing", "/auth", "/contact", "/apply"];
console.log("\n  routes");
for (const r of ROUTES) {
  try {
    const res = await fetchDoc(r);
    const ok = res.status < 400;
    if (!ok) failures.push(`${r} returned ${res.status}`);
    console.log(`    ${String(res.status).padEnd(4)} ${r}`);
  } catch (e) {
    failures.push(`${r} threw: ${e.message}`);
  }
}

// --- 5. Crawler-facing files ------------------------------------------------
for (const f of ["/robots.txt", "/sitemap.xml"]) {
  const res = await fetchDoc(f).catch(() => null);
  if (!res || res.status >= 400) warnings.push(`${f} returned ${res?.status ?? "error"}`);
}

// --- report -----------------------------------------------------------------
console.log();
if (notes.length) {
  console.log("Notes");
  for (const n of notes) console.log(`  - ${n}`);
  console.log();
}
if (warnings.length) {
  console.log("Warnings");
  for (const w of warnings) console.log(`  - ${w}`);
  console.log();
}
if (failures.length) {
  console.error("PRODUCTION VERIFICATION FAILED\n");
  for (const f of failures) console.error(`  - ${f}`);
  console.error();
  process.exit(1);
}
console.log("Production verified — reachable unauthenticated, headers served, routes responding.");
