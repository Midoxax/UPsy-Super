/**
 * Lightweight visual regression harness for typography + RTL layout.
 *
 * Captures screenshots of key routes in EN, FR, and AR (RTL) at desktop + mobile
 * widths, then diffs them against a baseline in tests/visual/baseline/.
 *
 * Usage:
 *   bun run test:visual              # compare against baseline
 *   bun run test:visual -- --update  # write new baseline
 *
 * Requires:
 *   - Dev server running at http://localhost:8080 (bun run dev)
 *   - Playwright: bun add -d playwright && bunx playwright install chromium
 */
import { chromium, type Browser, type Page } from "playwright";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const BASE = process.env.BASE_URL || "http://localhost:8080";
const UPDATE = process.argv.includes("--update");
const THRESHOLD = 0.02; // 2% pixel-diff tolerance
const ROOT = resolve("tests/visual");
const BASELINE_DIR = resolve(ROOT, "baseline");
const CURRENT_DIR = resolve(ROOT, "current");
const DIFF_DIR = resolve(ROOT, "diff");

interface Case {
  name: string;
  path: string;
  locales: Array<{ locale: "en" | "fr" | "ar"; prefix: string }>;
  viewports: Array<{ label: string; width: number; height: number }>;
}

const LOCALES = [
  { locale: "en" as const, prefix: "" },
  { locale: "fr" as const, prefix: "/fr" },
  { locale: "ar" as const, prefix: "/ar" }, // RTL — critical
];

const VIEWPORTS = [
  { label: "desktop", width: 1440, height: 900 },
  { label: "mobile", width: 390, height: 844 },
];

const CASES: Case[] = [
  { name: "home", path: "/", locales: LOCALES, viewports: VIEWPORTS },
  { name: "psychologists", path: "/psychologists", locales: LOCALES, viewports: VIEWPORTS },
  { name: "pricing", path: "/pricing", locales: LOCALES, viewports: VIEWPORTS },
  { name: "auth", path: "/auth", locales: LOCALES, viewports: VIEWPORTS },
  { name: "get-matched", path: "/get-matched", locales: LOCALES, viewports: VIEWPORTS },
  { name: "founder", path: "/founder", locales: LOCALES, viewports: VIEWPORTS },
];

function ensureDir(p: string) {
  if (!existsSync(dirname(p))) mkdirSync(dirname(p), { recursive: true });
}

async function capture(page: Page, url: string, out: string, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
  // Kill animations for stable diffs.
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation-duration: 0s !important; animation-delay: 0s !important;
      transition-duration: 0s !important; transition-delay: 0s !important;
      caret-color: transparent !important;
    }`,
  });
  await page.waitForTimeout(400);
  ensureDir(out);
  await page.screenshot({ path: out, fullPage: false });
}

function compare(baselinePath: string, currentPath: string, diffPath: string): { pct: number; ok: boolean } {
  if (!existsSync(baselinePath)) return { pct: 0, ok: false };
  const b = PNG.sync.read(readFileSync(baselinePath));
  const c = PNG.sync.read(readFileSync(currentPath));
  if (b.width !== c.width || b.height !== c.height) return { pct: 1, ok: false };
  const diff = new PNG({ width: b.width, height: b.height });
  const px = pixelmatch(b.data, c.data, diff.data, b.width, b.height, { threshold: 0.15 });
  const pct = px / (b.width * b.height);
  ensureDir(diffPath);
  writeFileSync(diffPath, PNG.sync.write(diff));
  return { pct, ok: pct <= THRESHOLD };
}

(async () => {
  console.log(`[visual] mode=${UPDATE ? "UPDATE-BASELINE" : "COMPARE"} base=${BASE}`);
  let failures = 0;
  let checks = 0;
  const browser: Browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  for (const c of CASES) {
    for (const l of c.locales) {
      for (const v of c.viewports) {
        const url = `${BASE}${l.prefix}${c.path}`;
        const rel = `${c.name}__${l.locale}__${v.label}.png`;
        const currentPath = resolve(CURRENT_DIR, rel);
        try {
          await capture(page, url, currentPath, v);
        } catch (err) {
          console.log(`  ⚠  ${rel} — capture failed: ${(err as Error).message}`);
          failures++;
          continue;
        }
        checks++;
        if (UPDATE) {
          const dest = resolve(BASELINE_DIR, rel);
          ensureDir(dest);
          writeFileSync(dest, readFileSync(currentPath));
          console.log(`  ✓  baseline written: ${rel}`);
        } else {
          const { pct, ok } = compare(
            resolve(BASELINE_DIR, rel),
            currentPath,
            resolve(DIFF_DIR, rel),
          );
          const pctStr = (pct * 100).toFixed(2);
          if (ok) console.log(`  ✓  ${rel} (${pctStr}% diff)`);
          else {
            console.log(`  ✗  ${rel} (${pctStr}% diff — see tests/visual/diff/)`);
            failures++;
          }
        }
      }
    }
  }
  await browser.close();
  console.log(`[visual] ${checks - failures}/${checks} passed, ${failures} failed`);
  process.exit(failures > 0 && !UPDATE ? 1 : 0);
})();
