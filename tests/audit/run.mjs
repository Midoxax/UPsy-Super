/**
 * Production readiness audit.
 *
 * Drives a real browser over the public routes and reports, per page:
 *   - WCAG 2.1 A/AA violations (axe-core)
 *   - horizontal overflow at each breakpoint
 *   - touch targets below the 24x24 CSS px WCAG 2.2 minimum
 *   - uncaught page errors and raw i18n keys leaking into visible text
 *
 * It exercises both themes, three locales and five widths, because that is
 * where the regressions actually live — a page can be clean in light/desktop/en
 * and broken in dark/mobile/ar.
 *
 * Usage:
 *   npm run build && npx vite preview --host 127.0.0.1 --port 4173
 *   node tests/audit/run.mjs                    # summary
 *   node tests/audit/run.mjs --full             # every combination (slow)
 *   BASE=http://127.0.0.1:4173 node tests/audit/run.mjs
 *
 * Exits non-zero on critical findings by default; set AUDIT_FAIL_ON=serious
 * to ratchet the gate up once the serious backlog is cleared.
 */
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const BASE = process.env.BASE || "http://127.0.0.1:4173";
const FULL = process.argv.includes("--full");
// Let Playwright resolve its own browser unless a path is given explicitly
// (needed in sandboxes that pre-install Chromium elsewhere).
const CHROME = process.env.CHROME_PATH || undefined;

// Public marketing surface.
const ROUTES = [
  "/", "/about", "/services", "/psychologists", "/pricing",
  "/contact", "/auth", "/founder", "/resources", "/apply",
];

// Category A: the routes a beta user must be able to reach.
//
// Checked unauthenticated, which is the point — a protected route must
// *redirect* to /auth, never white-screen. A guard that throws instead of
// redirecting looks identical to a broken product from the user's side, and
// nothing else in the pipeline would catch it. These cannot be logged into
// from CI, so this asserts the boundary, not the flow behind it.
const CRITICAL_ROUTES = [
  "/auth", "/auth/mfa-setup", "/apply/wizard", "/apply/organization",
  "/get-matched", "/dashboard", "/dashboard/client", "/dashboard/specialist",
  "/dashboard/organization", "/my-space", "/intake", "/book-a-call",
  "/session/test-id", "/booking/respond/test-token",
];
const BREAKPOINTS = [
  { name: "phone", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "desktop", width: 1536, height: 960 },
  { name: "ultrawide", width: 1920, height: 1080 },
];
const THEMES = ["light", "dark"];
const LOCALES = ["", "/fr", "/ar"];

/** Minimum touch target, WCAG 2.2 SC 2.5.8. */
const MIN_TARGET = 24;

const findings = [];
const record = (severity, area, route, detail) =>
  findings.push({ severity, area, route, detail });

async function auditPage(ctx, route, bp, theme) {
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 160)));

  try {
    await page.goto(BASE + route, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(700);
  } catch (e) {
    record("critical", "load", `${route} ${bp.name}/${theme}`, `navigation failed: ${String(e).slice(0, 90)}`);
    await page.close();
    return;
  }

  const dom = await page.evaluate((MIN) => {
    const vw = document.documentElement.clientWidth;
    const overflow = document.documentElement.scrollWidth - vw;

    // Deepest overflowing nodes are the cause; ancestors merely inherit it.
    const overflowing = [];
    if (overflow > 1) {
      document.querySelectorAll("*").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > vw + 1) {
          overflowing.push({
            tag: el.tagName.toLowerCase(),
            cls: (typeof el.className === "string" ? el.className : "").slice(0, 70),
            over: Math.round(r.right - vw),
            depth: (() => { let d = 0, n = el; while (n.parentElement) { d++; n = n.parentElement; } return d; })(),
          });
        }
      });
      overflowing.sort((a, b) => b.depth - a.depth);
    }

    // Interactive elements smaller than the minimum tap size.
    //
    // WCAG 2.2 SC 2.5.8 exempts two things this check would otherwise flag:
    // targets hidden until focus (skip links are *meant* to be 1x1 until
    // focused), and links flowing inline inside a sentence, whose size is
    // determined by the text itself. Both are correct code, so excluding them
    // here keeps the report to things actually worth fixing.
    const small = [];
    const isVisuallyHidden = (el) => {
      const cs = getComputedStyle(el);
      return cs.visibility === "hidden" || cs.clip === "rect(0px, 0px, 0px, 0px)" ||
             cs.clipPath === "inset(50%)" || el.closest(".sr-only") !== null ||
             el.classList.contains("sr-only");
    };
    const isInlineInText = (el) => {
      if (el.tagName !== "A") return false;
      const parent = el.parentElement;
      if (!parent) return false;
      // Sitting among sibling text rather than laid out as its own control.
      return getComputedStyle(el).display.startsWith("inline") &&
             (parent.textContent || "").trim().length > (el.textContent || "").trim().length;
    };
    document.querySelectorAll('a,button,[role="button"],input,select,textarea').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;           // hidden
      if (isVisuallyHidden(el) || isInlineInText(el)) return;
      if (r.width < MIN || r.height < MIN) {
        small.push({
          tag: el.tagName.toLowerCase(),
          label: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 28),
          size: `${Math.round(r.width)}x${Math.round(r.height)}`,
        });
      }
    });

    // Raw translation identifiers rendered as copy, e.g. "pricing.heroTitle".
    const leaks = (document.body.innerText.match(/\b[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]{2,}\b/g) || [])
      .filter((s) => !/\.(com|ma|org|net|io|fr|png|jpg|svg|webp)$/.test(s));

    return {
      overflow, overflowing: overflowing.slice(0, 3), small: small.slice(0, 5),
      leaks: [...new Set(leaks)].slice(0, 4),
      textLen: document.body.innerText.trim().length,
      crashed: document.body.innerText.includes("Something went wrong"),
      dir: document.documentElement.dir || "ltr",
      isDark: document.documentElement.classList.contains("dark"),
    };
  }, MIN_TARGET);

  const where = `${route || "/"} ${bp.name}/${theme}`;

  if (dom.crashed) record("critical", "crash", where, "ErrorBoundary fallback rendered");
  if (dom.textLen < 400) record("critical", "empty", where, `only ${dom.textLen} chars of text`);
  if (dom.isDark !== (theme === "dark")) record("serious", "theme", where, `expected ${theme}, html.dark=${dom.isDark}`);
  if (dom.overflow > 1) {
    const w = dom.overflowing[0];
    record("serious", "overflow", where,
      `${dom.overflow}px` + (w ? ` — <${w.tag} class="${w.cls}"> +${w.over}px` : ""));
  }
  for (const l of dom.leaks) record("serious", "i18n", where, `raw key rendered: "${l}"`);
  for (const e of errors) record("serious", "js-error", where, e);
  for (const s of dom.small) {
    record("moderate", "touch-target", where, `<${s.tag}> ${s.size} "${s.label}"`);
  }

  // axe only needs one width per theme; violations are not width-dependent
  // for the rules we care about, and it is by far the slowest step.
  if (bp.name === "phone") {
    try {
      const res = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      for (const v of res.violations) {
        record(v.impact === "critical" ? "critical" : v.impact === "serious" ? "serious" : "moderate",
          "a11y", where, `${v.id}: ${v.help} (${v.nodes.length} node${v.nodes.length === 1 ? "" : "s"})`);
      }
    } catch (e) {
      record("moderate", "a11y", where, `axe failed: ${String(e).slice(0, 80)}`);
    }
  }

  await page.close();
}

const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {});

const themeInit = (t) => `try{localStorage.setItem('u-psy-theme-v2','${t}')}catch(e){}`;

const routes = FULL
  ? [...ROUTES, ...CRITICAL_ROUTES].flatMap((r) => LOCALES.map((l) => l + (r === "/" ? "/" : r)))
  : [...ROUTES, ...CRITICAL_ROUTES];
const breakpoints = FULL ? BREAKPOINTS : [BREAKPOINTS[0], BREAKPOINTS[2]];

let checked = 0;
for (const theme of THEMES) {
  for (const bp of breakpoints) {
    const ctx = await browser.newContext({
      viewport: { width: bp.width, height: bp.height },
      colorScheme: theme,
    });
    await ctx.addInitScript(themeInit(theme));
    for (const route of routes) {
      await auditPage(ctx, route, bp, theme);
      checked++;
    }
    await ctx.close();
  }
}
await browser.close();

// ---- report -------------------------------------------------------------
/**
 * What counts as a build failure.
 *
 * Defaults to "critical" because a gate that is red the day it lands gets
 * switched off, and everything it would have caught later goes with it. The
 * codebase currently carries 14 serious findings — mostly a light-mode
 * contrast token whose fix is a brand decision — so failing on those would
 * block every unrelated PR from day one.
 *
 * Serious findings are still printed on every run. Once the backlog is clear,
 * set AUDIT_FAIL_ON=serious to ratchet the gate up; that is the point of
 * making it a variable rather than a constant.
 */
const FAIL_ON = process.env.AUDIT_FAIL_ON === "serious" ? "serious" : "critical";
const FAILING = FAIL_ON === "serious" ? ["critical", "serious"] : ["critical"];
const bySeverity = { critical: [], serious: [], moderate: [] };
for (const f of findings) bySeverity[f.severity].push(f);

// Collapse identical detail across route/breakpoint/theme — one systemic
// problem should read as one line, with a count, not fifty.
function group(list) {
  const m = new Map();
  for (const f of list) {
    const k = `${f.area}|${f.detail}`;
    if (!m.has(k)) m.set(k, { ...f, count: 0, examples: [] });
    const g = m.get(k);
    g.count++;
    if (g.examples.length < 3) g.examples.push(f.route);
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}

console.log(`\nAudited ${checked} page loads — ${routes.length} routes x ${breakpoints.length} widths x ${THEMES.length} themes\n`);
let exitCode = 0;
for (const sev of ["critical", "serious", "moderate"]) {
  const g = group(bySeverity[sev]);
  if (!g.length) continue;
  if (FAILING.includes(sev)) exitCode = 1;
  console.log(`${sev.toUpperCase()} (${bySeverity[sev].length} occurrences, ${g.length} distinct)`);
  for (const f of g.slice(0, 18)) {
    console.log(`  [${f.area}] ${f.detail}`);
    console.log(`      x${f.count}  e.g. ${f.examples.join(", ")}`);
  }
  if (g.length > 18) console.log(`  ... ${g.length - 18} more distinct`);
  console.log();
}
if (!findings.length) console.log("No issues found.\n");
console.log(
  exitCode
    ? `FAILED — ${FAIL_ON}+ findings present (gate: AUDIT_FAIL_ON=${FAIL_ON}).`
    : `PASSED — no ${FAIL_ON}-level findings. ` +
      `${bySeverity.serious.length} serious / ${bySeverity.moderate.length} moderate reported above, not gated.`
);
process.exit(exitCode);
