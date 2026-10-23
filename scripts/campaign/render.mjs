// Render a campaign's brochure and social visuals from its HTML sources.
//
//   node scripts/campaign/render.mjs academy            everything
//   node scripts/campaign/render.mjs academy 02-launch  one post, every format
//
// Sources: marketing/<campaign>/{brochure.html, visuals.html, posts.js, assets/}.
// Output:  public/campaign/<campaign>/ — the brochure PDF and <format>/<post>.jpg,
//          served by the site so the social automation can publish them.
// Needs Playwright with Chromium (`bun add --no-save playwright` and
// `bunx playwright install chromium`, or PLAYWRIGHT_CHROMIUM=/path/to/chrome).
import { chromium } from "playwright";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const [campaign, only] = process.argv.slice(2);
if (!campaign)
  throw new Error(
    "usage: node scripts/campaign/render.mjs <campaign> [post-id]",
  );
const src = resolve("marketing", campaign);
const out = resolve("public/campaign", campaign);
const FORMATS = {
  ig: [1080, 1350],
  story: [1080, 1920],
  li: [1200, 627],
  sq: [1080, 1080],
};

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM }
    : {},
);

if (!only && existsSync(`${src}/brochure.html`)) {
  const page = await browser.newPage();
  await page.goto(`file://${src}/brochure.html`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const name =
    readFileSync(`${src}/brochure.html`, "utf8").match(
      /<title>([^<]+)</,
    )?.[1] ?? campaign;
  mkdirSync(out, { recursive: true });
  const file = `${out}/U.Psy-${campaign[0].toUpperCase()}${campaign.slice(1)}-Brochure-FR.pdf`;
  await page.pdf({
    path: file,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });
  console.log(`brochure: ${name} → ${file}`);
  await page.close();
}

const ids = [
  ...readFileSync(`${src}/posts.js`, "utf8").matchAll(/id: "([^"]+)"/g),
]
  .map((m) => m[1])
  .filter((id) => !only || id === only);
for (const [fmt, [w, h]] of Object.entries(FORMATS)) {
  mkdirSync(`${out}/${fmt}`, { recursive: true });
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  for (const id of ids) {
    await page.goto(`file://${src}/visuals.html?post=${id}&fmt=${fmt}`);
    await page.waitForFunction("window.READY === true");
    await page.waitForLoadState("networkidle");
    await page.locator("#c").screenshot({
      path: `${out}/${fmt}/${id}.jpg`,
      type: "jpeg",
      quality: 88,
    });
  }
  await page.close();
}
console.log(
  `${ids.length} post(s) × ${Object.keys(FORMATS).length} formats → ${out}`,
);
await browser.close();
