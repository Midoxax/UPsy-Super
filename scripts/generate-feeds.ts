// Generates the blog feeds from the same article data the site renders:
//   public/blog-feed.json  read by the newsletter and social-posting functions
//   public/rss.xml         English RSS
//   public/rss-fr.xml      French RSS
// Runs on `predev` and `prebuild`, after the sitemap.
import { existsSync, writeFileSync, readFileSync } from "fs";
import { resolve } from "path";
import { ARTICLES } from "../src/content/blog/articles";
import { LEGACY_POSTS } from "../src/content/blog/legacy";
import fr from "../src/lib/i18n/locales/fr";

// Translated strings of the page-based posts, by their t() key.
const frText = (key: string, fallback: string): string => {
  let v: unknown = fr;
  for (const k of key.split(".")) v = (v as Record<string, unknown>)?.[k];
  return typeof v === "string" ? v : fallback;
};

const BASE_URL = (
  process.env.VITE_SITE_URL ||
  (JSON.parse(readFileSync(resolve("package.json"), "utf8"))
    .homepage as string) ||
  "https://upsy.ma"
).replace(/\/$/, "");

// The older page-based posts carry no date; they predate the data articles.
const LEGACY_DATE = "2026-03-01";

type Lang = "en" | "fr";
export interface FeedItem {
  slug: string;
  date: string;
  legacy: boolean;
  url: Record<Lang, string>;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  category: Record<Lang, string>;
  readMinutes: number;
  image: string | null;
}

const imageFor = (slug: string) =>
  existsSync(resolve("public/social", `${slug}.jpg`))
    ? `${BASE_URL}/social/${slug}.jpg`
    : null;

const url = (slug: string): Record<Lang, string> => ({
  en: `${BASE_URL}/blog/${slug}`,
  fr: `${BASE_URL}/fr/blog/${slug}`,
});

const items: FeedItem[] = [
  ...ARTICLES.map((a) => ({
    slug: a.slug,
    date: a.datePublished,
    legacy: false,
    url: url(a.slug),
    title: { en: a.content.en.title, fr: a.content.fr.title },
    description: { en: a.content.en.description, fr: a.content.fr.description },
    category: { en: a.content.en.category, fr: a.content.fr.category },
    readMinutes: a.readMinutes,
    image: imageFor(a.slug),
  })),
  ...LEGACY_POSTS.map((p) => ({
    slug: p.slug,
    date: LEGACY_DATE,
    legacy: true,
    url: url(p.slug),
    title: { en: p.fallbackTitle, fr: frText(p.titleKey, p.fallbackTitle) },
    description: { en: p.fallbackDesc, fr: frText(p.descKey, p.fallbackDesc) },
    category: { en: p.category, fr: frText(p.categoryKey, p.category) },
    readMinutes: parseInt(p.readTime, 10) || 5,
    image: imageFor(p.slug),
  })),
].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

writeFileSync(
  resolve("public/blog-feed.json"),
  JSON.stringify({ version: 1, items }, null, 2) + "\n",
);

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

for (const lang of ["en", "fr"] as const) {
  const file = lang === "en" ? "rss.xml" : "rss-fr.xml";
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${lang === "en" ? "U.Psy blog" : "Blog U.Psy"}</title>
  <link>${BASE_URL}${lang === "en" ? "" : "/fr"}/blog</link>
  <atom:link href="${BASE_URL}/${file}" rel="self" type="application/rss+xml"/>
  <description>${lang === "en" ? "Mental health and performance psychology, from Morocco." : "Santé mentale et psychologie de la performance, depuis le Maroc."}</description>
  <language>${lang}</language>
${items
  .map(
    (i) => `  <item>
    <title>${esc(i.title[lang])}</title>
    <link>${i.url[lang]}</link>
    <guid isPermaLink="true">${i.url[lang]}</guid>
    <pubDate>${new Date(i.date + "T08:00:00Z").toUTCString()}</pubDate>
    <category>${esc(i.category[lang])}</category>
    <description>${esc(i.description[lang])}</description>${i.image ? `\n    <enclosure url="${i.image}" type="image/jpeg" length="0"/>` : ""}
  </item>`,
  )
  .join("\n")}
</channel>
</rss>
`;
  writeFileSync(resolve("public", file), rss);
}

// French titles of the page-based posts, for server-rendered <title> tags
// (the app loads the French locale file lazily; the head needs it at once).
writeFileSync(
  resolve("src/content/blog/legacy-fr.generated.json"),
  JSON.stringify(
    Object.fromEntries(
      LEGACY_POSTS.map((p) => [
        p.slug,
        {
          title: frText(p.titleKey, p.fallbackTitle),
          description: frText(p.descKey, p.fallbackDesc),
        },
      ]),
    ),
    null,
    2,
  ) + "\n",
);

console.log(
  `Feeds: ${items.length} posts → blog-feed.json, rss.xml, rss-fr.xml`,
);
