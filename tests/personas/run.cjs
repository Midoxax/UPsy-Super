// Run: BASE=https://upsy.ma node tests/personas/run.cjs
// Persona journeys against production. Read-only: no form is submitted.
const { chromium, devices } = require("playwright");
const BASE = process.env.BASE || "https://upsy.ma";
const phone = devices["iPhone 13"];
const desk = { viewport: { width: 1366, height: 860 } };

const personas = [
  { name: "Athlete, FR, phone", ctx: phone, steps: ["/fr/for-athletes", "/fr/free-score", "/fr/psychologists"] },
  { name: "Adult client, AR, phone", ctx: phone, steps: ["/ar", "/ar/psychologists", "/ar/get-matched"] },
  { name: "Adult client, EN, desktop", ctx: desk, steps: ["/", "/psychologists", "/pricing", "/book-a-call"] },
  { name: "Specialist, FR, desktop", ctx: desk, steps: ["/fr/pricing-specialists", "/fr/apply", "/fr/apply/wizard"] },
  { name: "HR / organisation, EN, desktop", ctx: desk, steps: ["/for-organizations", "/apply/organization"] },
  { name: "School / parent, FR, phone", ctx: phone, steps: ["/fr/center/schools", "/fr/resources", "/fr/learn"] },
  { name: "Anonymous on private pages", ctx: desk, steps: ["/admin", "/dashboard", "/my-space"] },
];

(async () => {
  const browser = await chromium.launch();
  let problems = 0;
  for (const p of personas) {
    const ctx = await browser.newContext(p.ctx);
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push("pageerror: " + e.message.slice(0, 140)));
    page.on("console", (m) => m.type() === "error" && errs.push("console: " + m.text().slice(0, 140)));
    console.log(`\n## ${p.name}`);
    // Profile page: follow the first specialist card when a list is shown.
    for (const path of p.steps) {
      errs.length = 0;
      const res = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 }).catch((e) => ({ status: () => "ERR " + e.message.slice(0, 60) }));
      await page.waitForTimeout(800);
      const info = await page.evaluate(() => ({
        url: location.pathname,
        h1: (document.querySelector("h1")?.innerText || "").slice(0, 70).replace(/\n/g, " "),
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        cta: [...document.querySelectorAll("a,button")].filter((e) => e.offsetParent).length,
        dir: document.documentElement.dir || "ltr",
      }));
      const bad = [];
      const st = res.status();
      if (typeof st !== "number" || st >= 400) bad.push("status " + st);
      if (!info.h1) bad.push("no h1");
      if (info.overflow > 2) bad.push(`horizontal overflow ${info.overflow}px`);
      if (path.startsWith("/ar") && info.dir !== "rtl") bad.push("not RTL");
      const realErrs = errs.filter((e) => !/favicon|Failed to load resource: the server responded with a status of 401/.test(e));
      if (realErrs.length) bad.push(...realErrs.slice(0, 3));
      problems += bad.length;
      console.log(`${bad.length ? "✗" : "✓"} ${path} → ${info.url} | ${st} | "${info.h1}"${bad.length ? "\n    " + bad.join("\n    ") : ""}`);
    }
    await ctx.close();
  }
  // Specialist profile from the directory (the step a client takes before booking).
  const ctx = await browser.newContext(phone); const page = await ctx.newPage();
  await page.goto(BASE + "/psychologists", { waitUntil: "networkidle" });
  const href = await page.evaluate(() => [...document.querySelectorAll('a[href*="/psychologists/"]')].map((a) => a.getAttribute("href")).find((h) => h.split("/").length > 2));
  if (href) {
    const r = await page.goto(BASE + href, { waitUntil: "networkidle" });
    const book = await page.locator("text=/R[ée]server|Book|احجز/i").count();
    console.log(`\n## Client opens a specialist profile\n${r.status() < 400 && book ? "✓" : "✗"} ${href} | ${r.status()} | booking buttons: ${book}`);
    if (!(r.status() < 400 && book)) problems++;
  } else { console.log("\n✗ no specialist card link found on /psychologists"); problems++; }
  await browser.close();
  console.log(`\n${problems} problem(s)`);
})();
