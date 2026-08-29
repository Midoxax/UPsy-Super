// Generates public/sitemap.xml with hreflang alternates for EN / FR / AR / x-default.
// Runs on `predev` and `prebuild`.
import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";

// Single source of truth, mirroring src/config/site.ts for the Node side (this
// runs before Vite, so it cannot import the browser module). Both default to
// the Vercel deployment because upsy.ma has no DNS record — a sitemap full of
// non-resolving URLs is worse than no sitemap, since Search Console reports
// every entry as an error and Google learns the site is broken.
//
// Override with VITE_SITE_URL, or fall back to package.json "homepage".
const BASE_URL = (
  process.env.VITE_SITE_URL ||
  (JSON.parse(readFileSync(resolve("package.json"), "utf8")).homepage as string) ||
  "https://upsy-ma.vercel.app"
).replace(/\/$/, "");
const LOCALES = ["en", "fr", "ar"] as const;
type Locale = (typeof LOCALES)[number];

const localizedPath = (path: string, locale: Locale) =>
  locale === "en" ? path : `/${locale}${path === "/" ? "" : path}`;

interface Entry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// Public marketing routes served in every locale.
const ROUTES: Entry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/founder", changefreq: "monthly", priority: "0.7" },
  { path: "/why-us", changefreq: "monthly", priority: "0.7" },
  { path: "/services", changefreq: "monthly", priority: "0.8" },
  { path: "/services/consulting-for-organizations", changefreq: "monthly", priority: "0.6" },
  { path: "/psychologists", changefreq: "weekly", priority: "0.9" },
  { path: "/get-matched", changefreq: "monthly", priority: "0.8" },
  { path: "/assessment-lab", changefreq: "monthly", priority: "0.7" },
  { path: "/assessments", changefreq: "monthly", priority: "0.6" },
  { path: "/free-score", changefreq: "monthly", priority: "0.6" },
  { path: "/observatoire", changefreq: "monthly", priority: "0.7" },
  { path: "/mental-performance", changefreq: "monthly", priority: "0.8" },
  { path: "/mental-toughness-athletes", changefreq: "monthly", priority: "0.8" },
  { path: "/pricing", changefreq: "monthly", priority: "0.8" },
  { path: "/pricing-specialists", changefreq: "monthly", priority: "0.5" },
  { path: "/learn", changefreq: "weekly", priority: "0.6" },
  { path: "/resources", changefreq: "weekly", priority: "0.6" },
  { path: "/talent-innovation-hub", changefreq: "monthly", priority: "0.6" },
  { path: "/athlete-hub", changefreq: "monthly", priority: "0.6" },
  { path: "/for-organizations", changefreq: "monthly", priority: "0.6" },
  { path: "/psf", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/legal", changefreq: "yearly", priority: "0.3" },
  { path: "/apply", changefreq: "monthly", priority: "0.5" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
  { path: "/install", changefreq: "yearly", priority: "0.3" },
  { path: "/skool", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/moroccan-umbrella", changefreq: "monthly", priority: "0.6" },
];

// English-only content (blog posts).
const EN_ONLY_ROUTES: Entry[] = [
  { path: "/blog/benefits-online-therapy", priority: "0.5" },
  { path: "/blog/do-i-need-therapy", priority: "0.5" },
  { path: "/blog/find-right-psychologist", priority: "0.5" },
  { path: "/blog/how-to-support-a-loved-one", priority: "0.5" },
  { path: "/blog/mental-health-at-work", priority: "0.5" },
  { path: "/blog/mindfulness-for-beginners", priority: "0.5" },
  { path: "/blog/how-to-improve-focus", priority: "0.6" },
  { path: "/blog/how-to-clear-brain-fog", priority: "0.6" },
  { path: "/blog/understanding-anxiety", priority: "0.5" },
  { path: "/blog/understanding-depression", priority: "0.5" },
];

function urlBlock(loc: string, path: string, priority?: string, changefreq?: string, alternates?: string) {
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    alternates ?? null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

function alternatesBlock(path: string) {
  const links = [
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${path === "/" ? "/" : path}" />`,
    ...LOCALES.map(
      (l) =>
        `    <xhtml:link rel="alternate" hreflang="${l}" href="${BASE_URL}${localizedPath(path, l)}${path === "/" && l !== "en" ? "/" : ""}" />`,
    ),
  ];
  return links.join("\n");
}

const urls: string[] = [];

for (const r of ROUTES) {
  const alt = alternatesBlock(r.path);
  for (const l of LOCALES) {
    const localized = localizedPath(r.path, l);
    const loc = `${BASE_URL}${localized}${r.path === "/" && l !== "en" ? "/" : ""}`;
    urls.push(urlBlock(loc, r.path, r.priority, r.changefreq, alt));
  }
}

for (const r of EN_ONLY_ROUTES) {
  urls.push(urlBlock(`${BASE_URL}${r.path}`, r.path, r.priority, "monthly"));
}

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  urls.join("\n") +
  `\n</urlset>\n`;

writeFileSync(resolve("public/sitemap.xml"), xml);
console.log(`sitemap.xml written (${urls.length} URLs across ${LOCALES.length} locales + EN-only content)`);

// robots.txt is generated from the same BASE_URL rather than kept as a static
// file. Its `Sitemap:` line is an absolute URL, so a hand-maintained copy is a
// second place for the origin to drift — and it drifted: it advertised a
// sitemap on a host with no DNS record, which is the first thing a crawler
// reads and the first thing it fails on.
const robots = [
  "# Generated by scripts/generate-sitemap.ts — do not edit by hand.",
  "# The Sitemap line must match the origin the site is actually served from.",
  "",
  ...["Googlebot", "Bingbot", "Twitterbot", "facebookexternalhit", "*"].flatMap((ua) => [
    `User-agent: ${ua}`,
    "Allow: /",
    "",
  ]),
  `Sitemap: ${BASE_URL}/sitemap.xml`,
  "",
].join("\n");

writeFileSync(resolve("public/robots.txt"), robots);
console.log(`robots.txt written (sitemap advertised at ${BASE_URL}/sitemap.xml)`);
