// Regard U.Psy: turns one current news story into a psychological and
// philosophical analysis, with brand visuals and a short vertical video.
//
//   npx tsx scripts/agent/news-insight.ts                  pick a story from the feeds
//   npx tsx scripts/agent/news-insight.ts --url <article>  analyse this story
//   npx tsx scripts/agent/news-insight.ts --fixture <json> skip Claude, render a saved analysis
//
// Writes, for slug <s>:
//   src/content/blog/news.generated.json   the article (blog page, feed, newsletter)
//   marketing/news/<s>.json                the full analysis, to re-render later
//   public/social/<s>.jpg                  the image the social automation posts
//   public/campaign/news/<s>/              carousel (ig, story, li), video.mp4, captions.md
//
// Nothing is published from here: .github/workflows/news-insight.yml opens a
// pull request, and merging it is the editorial review. After the deploy,
// content-automation posts the article to the U.Psy pages and the monthly
// newsletter includes it.
//
// Needs ANTHROPIC_API_KEY (except with --fixture), Playwright with Chromium
// and ffmpeg.
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { Article } from "../../src/content/blog/articles";

const MODEL = "claude-opus-5-5";
const NEWS_FILE = "src/content/blog/news.generated.json";
const SITE = "https://upsy.ma";

// Feeds checked for candidate stories: Moroccan, international health, sport.
const FEEDS = [
  { outlet: "Hespress", url: "https://fr.hespress.com/feed" },
  {
    outlet: "ONU Info",
    url: "https://news.un.org/feed/subscribe/fr/news/topic/health/feed/rss.xml",
  },
  { outlet: "OMS", url: "https://www.who.int/rss-feeds/news-english.xml" },
  { outlet: "Le Monde", url: "https://www.lemonde.fr/sante/rss_full.xml" },
  { outlet: "BBC", url: "https://feeds.bbci.co.uk/news/health/rss.xml" },
  { outlet: "L'Équipe", url: "https://dwh.lequipe.fr/api/edito/rss?path=/" },
];

const ART = [
  "athlete-hub",
  "care",
  "league",
  "online-africa",
  "newsletter",
  "get-matched",
  "assessments",
] as const;

interface Candidate {
  outlet: string;
  title: string;
  url: string;
  date: string;
  summary: string;
}

interface Analysis {
  slug: string;
  readMinutes: number;
  art: (typeof ART)[number];
  source: Candidate;
  content: Article["content"];
  social: {
    hook: string;
    summary: string;
    insight: string;
    philosophy: string;
    philosopher: string;
    actions: string[];
    linkedin: string;
    instagram: string;
    facebook: string;
    x: string;
  };
}

// --- Feeds ---------------------------------------------------------------------
const clean = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
const tag = (xml: string, name: string) =>
  clean(
    xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? "",
  );

async function candidates(): Promise<Candidate[]> {
  const since = Date.now() - 3 * 86400000;
  const out: Candidate[] = [];
  for (const f of FEEDS) {
    try {
      const xml = await (
        await fetch(f.url, { signal: AbortSignal.timeout(15000) })
      ).text();
      for (const item of xml
        .match(/<item[\s>][\s\S]*?<\/item>/g)
        ?.slice(0, 15) ?? []) {
        const date = new Date(tag(item, "pubDate") || Date.now());
        if (date.getTime() < since) continue;
        out.push({
          outlet: f.outlet,
          title: tag(item, "title"),
          url: tag(item, "link"),
          date: date.toISOString().slice(0, 10),
          summary: tag(item, "description").slice(0, 400),
        });
      }
    } catch (e) {
      console.warn(`feed ${f.outlet}: ${String(e).slice(0, 120)}`);
    }
  }
  return out.filter((c) => c.title && c.url);
}

/** Readable text of the article page, to ground the analysis. Best effort. */
async function articleText(url: string): Promise<string> {
  try {
    const html = await (
      await fetch(url, { signal: AbortSignal.timeout(15000) })
    ).text();
    const body = html
      .replace(/<(script|style|nav|header|footer|aside)[\s\S]*?<\/\1>/gi, " ")
      .match(/<p[\s>][\s\S]*?<\/p>/gi);
    return clean((body ?? []).join("\n")).slice(0, 8000);
  } catch {
    return "";
  }
}

// --- Claude ----------------------------------------------------------------------
const SYSTEM = `You are the editorial voice of "Regard U.Psy", the news analysis series of U.Psy (upsy.ma), a Moroccan platform of verified psychologists founded by a clinical sport psychologist. The mission: democratise access to mental health care in Morocco and Africa.

Each piece reads one current news story through two lenses: psychology (clinical, social, sport and performance psychology) and philosophy. It must leave the reader with something to understand and something to do.

Editorial rules, all mandatory:
- Psychology must be evidence-informed. Name real concepts accurately (e.g. learned helplessness, moral injury, collective trauma, choking under pressure, social comparison). Never invent statistics, studies or quotes. If you are not sure of a figure, do not give one.
- Philosophy: one thinker whose idea genuinely fits (Stoics, Ibn Khaldun, Ibn Rushd, Al-Ghazali, Montaigne, Camus, Arendt, Fanon, Simone Weil, Frankl...). Quote only lines you are certain are real and correctly attributed; otherwise paraphrase and say so.
- Never diagnose or speculate about the mental state of a named real person (the Goldwater rule). Talk about the phenomenon, not the individual.
- Suicide and self-harm: follow WHO media guidance. No method, no location, no simplistic cause, no sensational wording. Always include where to get help: in an emergency, call 15 or 141 in Morocco or go to the nearest emergency department; and U.Psy psychologists for ongoing support.
- Stay strictly within what the source says about the facts. Attribute facts to the outlet.
- Respectful of Moroccan and African readers, of religion and of culture. No partisan politics.
- French is the main language (Moroccan register, "vous", warm, clear, no jargon without explanation). English is a faithful adaptation, not a literal translation.
- Length: 900 to 1300 words per language. Sections: what happened (short, attributed), the psychological reading, the philosophical lens, what you can do (bullets), when to ask for help.
- The CTA invites the reader, without pressure, to talk to a U.Psy psychologist.`;

const PICK_SCHEMA = {
  type: "object",
  properties: {
    index: { type: ["integer", "null"] },
    reason: { type: "string" },
  },
  required: ["index", "reason"],
  additionalProperties: false,
} as const;

const BODY = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    category: { type: "string" },
    intro: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          paragraphs: { type: "array", items: { type: "string" } },
          bullets: { type: "array", items: { type: "string" } },
        },
        required: ["heading", "paragraphs"],
        additionalProperties: false,
      },
    },
    faq: {
      type: "array",
      items: {
        type: "object",
        properties: { q: { type: "string" }, a: { type: "string" } },
        required: ["q", "a"],
        additionalProperties: false,
      },
    },
    cta: { type: "string" },
  },
  required: [
    "title",
    "description",
    "category",
    "intro",
    "sections",
    "faq",
    "cta",
  ],
  additionalProperties: false,
} as const;

const WRITE_SCHEMA = {
  type: "object",
  properties: {
    slug: { type: "string" },
    readMinutes: { type: "integer" },
    art: { type: "string", enum: [...ART] },
    fr: BODY,
    en: BODY,
    social: {
      type: "object",
      properties: {
        hook: { type: "string" },
        summary: { type: "string" },
        insight: { type: "string" },
        philosophy: { type: "string" },
        philosopher: { type: "string" },
        actions: { type: "array", items: { type: "string" } },
        linkedin: { type: "string" },
        instagram: { type: "string" },
        facebook: { type: "string" },
        x: { type: "string" },
      },
      required: [
        "hook",
        "summary",
        "insight",
        "philosophy",
        "philosopher",
        "actions",
        "linkedin",
        "instagram",
        "facebook",
        "x",
      ],
      additionalProperties: false,
    },
  },
  required: ["slug", "readMinutes", "art", "fr", "en", "social"],
  additionalProperties: false,
} as const;

async function ask<T>(schema: object, prompt: string): Promise<T> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();
  const res = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 32000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [
      { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
    ],
    output_config: { format: { type: "json_schema", schema } },
    messages: [{ role: "user", content: prompt }],
  });
  if (res.stop_reason === "refusal") throw new Error("Claude declined");
  if (res.stop_reason === "max_tokens") throw new Error("Answer was cut off");
  return JSON.parse(
    res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join(""),
  ) as T;
}

async function pick(list: Candidate[], covered: Set<string>) {
  const fresh = list.filter((c) => !covered.has(c.url));
  if (!fresh.length) return null;
  const { index, reason } = await ask<{ index: number | null; reason: string }>(
    PICK_SCHEMA,
    `Pick the ONE story below that best deserves a Regard U.Psy analysis today: strongest link to mental health, wellbeing, performance or how people live together, and most meaningful for readers in Morocco and Africa. Skip stories that cannot be treated without harm (ongoing attacks, named victims of a tragedy, partisan politics, religious controversy). Return null if none fits.\n\n${fresh
      .map((c, i) => `${i}. [${c.outlet}, ${c.date}] ${c.title} — ${c.summary}`)
      .join("\n")}`,
  );
  console.log(`pick: ${index} — ${reason}`);
  return index === null ? null : (fresh[index] ?? null);
}

async function write(src: Candidate): Promise<Analysis> {
  const text = await articleText(src.url);
  const r = await ask<
    Omit<Analysis, "source" | "content"> & {
      fr: Article["content"]["fr"];
      en: Article["content"]["en"];
    }
  >(
    WRITE_SCHEMA,
    `Write the Regard U.Psy piece on this story.

Source: ${src.outlet}, ${src.date}
Title: ${src.title}
URL: ${src.url}
Summary: ${src.summary}
${text ? `\nArticle text (may be partial):\n${text}` : ""}

Also return:
- slug: short, lowercase, ascii, hyphens, French, no date (e.g. "pression-scolaire-bac").
- art: the illustration that fits best (athlete-hub = sport, care = health and care, league = professionals and society, online-africa = Africa and access, newsletter = learning and youth, get-matched = finding help, assessments = measuring and understanding oneself).
- social, in French: hook (max 70 characters, the headline on the visual), summary (max 140), insight (one psychological sentence, max 180), philosophy (one sentence, a certain quote or a paraphrase, max 180), philosopher (name, or "d'après <name>" for a paraphrase), actions (exactly 3, max 60 characters each), and one post per network: linkedin (professional, 900-1300 characters, ends with the link ${SITE}/fr/blog/<slug>), instagram (warm, 600-900 characters, "lien en bio", 5-8 hashtags), facebook (500-800 characters, link), x (max 260 characters, link).`,
  );
  return {
    slug: r.slug,
    readMinutes: r.readMinutes,
    art: r.art,
    social: r.social,
    source: src,
    content: { fr: r.fr, en: r.en },
  };
}

// --- Visuals and video ------------------------------------------------------------
const esc = (s: string) => JSON.stringify(s);

function postsJs(a: Analysis) {
  const s = a.social;
  const cat = a.content.fr.category;
  const kicker = /regard u\.?psy/i.test(cat)
    ? "Regard U.Psy · Actualité"
    : `Regard U.Psy · ${cat}`;
  const art2 = a.art === "care" ? "league" : "care";
  return `window.CAMPAIGN = {
  url: "upsy.ma/blog",
  footer: "Regard U.Psy · Psychologie & philosophie de l'actualité",
  posts: [
    { id: "01", layout: "hero", art: ${esc(a.art)}, kicker: ${esc(kicker)}, title: ${esc(s.hook)}, body: ${esc(s.summary)} },
    { id: "02", layout: "quote", art: ${esc(art2)}, quote: ${esc(s.insight)}, author: "Lecture psychologique", role: "U.Psy" },
    { id: "03", layout: "quote", art: ${esc(a.art)}, quote: ${esc(s.philosophy)}, author: ${esc(s.philosopher)}, role: "Le regard philosophique" },
    { id: "04", layout: "track", art: "get-matched", no: "3", kicker: "Ce que vous pouvez faire", title: "Trois pistes concrètes", points: ${JSON.stringify(s.actions.slice(0, 3))} },
    { id: "05", layout: "cta", art: "newsletter", kicker: "L'analyse complète", title: "Lire le Regard U.Psy.", body: ${esc(a.content.fr.title)}, cta: "Lire" },
  ],
};\n`;
}

function render(a: Analysis) {
  const out = resolve("public/campaign/news", a.slug);
  const src = mkdtempSync(join(tmpdir(), "regard-"));
  symlinkSync(resolve("marketing/academy/visuals.html"), `${src}/visuals.html`);
  symlinkSync(resolve("marketing/academy/assets"), `${src}/assets`);
  writeFileSync(`${src}/posts.js`, postsJs(a));
  execFileSync("node", ["scripts/campaign/render.mjs", "news"], {
    stdio: "inherit",
    env: {
      ...process.env,
      CAMPAIGN_SRC: src,
      CAMPAIGN_OUT: out,
      CAMPAIGN_FORMATS: "ig,story,li",
    },
  });
  mkdirSync("public/social", { recursive: true });
  execFileSync("cp", [`${out}/ig/01.jpg`, `public/social/${a.slug}.jpg`]);

  // 25 s vertical video: the five story slides, 5 s each, cross-faded.
  const slides = ["01", "02", "03", "04", "05"].map(
    (id) => `${out}/story/${id}.jpg`,
  );
  const inputs = slides.flatMap((f) => ["-loop", "1", "-t", "5", "-i", f]);
  let chain = "";
  let last = "[0:v]";
  for (let i = 1; i < slides.length; i++) {
    const label = `[v${i}]`;
    chain += `${last}[${i}:v]xfade=transition=fade:duration=0.6:offset=${i * 4.4}${label};`;
    last = label;
  }
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      ...inputs,
      "-filter_complex",
      `${chain}${last}format=yuv420p,scale=1080:1920[out]`,
      "-map",
      "[out]",
      "-r",
      "30",
      "-c:v",
      "libx264",
      "-crf",
      "26",
      "-movflags",
      "+faststart",
      `${out}/video.mp4`,
    ],
    { stdio: "inherit" },
  );

  const s = a.social;
  writeFileSync(
    `${out}/captions.md`,
    `# ${a.content.fr.title}\n\nSource : [${a.source.title}](${a.source.url}) — ${a.source.outlet}, ${a.source.date}\n\n## LinkedIn\n\n${s.linkedin}\n\n## Instagram (carrousel ig/01-05 ou Reel video.mp4)\n\n${s.instagram}\n\n## Facebook\n\n${s.facebook}\n\n## X\n\n${s.x}\n`,
  );
  return out;
}

// --- Main ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const news: Article[] = existsSync(NEWS_FILE)
  ? JSON.parse(readFileSync(NEWS_FILE, "utf8"))
  : [];
const covered = new Set(news.flatMap((n) => (n.source ? [n.source.url] : [])));

let analysis: Analysis;
const fixture = arg("--fixture");
if (fixture) {
  analysis = JSON.parse(readFileSync(fixture, "utf8"));
} else {
  const url = arg("--url");
  const src = url
    ? {
        outlet: new URL(url).hostname.replace(/^www\./, ""),
        title: url,
        url,
        date: new Date().toISOString().slice(0, 10),
        summary: "",
      }
    : await pick(await candidates(), covered);
  if (!src) {
    console.log("No story fits today; nothing written.");
    process.exit(0);
  }
  analysis = await write(src);
}

analysis.slug = analysis.slug
  .toLowerCase()
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 70);
if (news.some((n) => n.slug === analysis.slug))
  analysis.slug += `-${new Date().toISOString().slice(0, 10)}`;

mkdirSync("marketing/news", { recursive: true });
writeFileSync(
  `marketing/news/${analysis.slug}.json`,
  JSON.stringify(analysis, null, 2) + "\n",
);
const out = render(analysis);

const article: Article = {
  slug: analysis.slug,
  readMinutes: analysis.readMinutes,
  datePublished: new Date().toISOString().slice(0, 10),
  content: analysis.content,
  source: {
    outlet: analysis.source.outlet,
    title: analysis.source.title,
    url: analysis.source.url,
    date: analysis.source.date,
  },
};
writeFileSync(
  NEWS_FILE,
  JSON.stringify(
    [article, ...news.filter((n) => n.slug !== article.slug)],
    null,
    2,
  ) + "\n",
);

// For the workflow's pull request.
writeFileSync(
  join(tmpdir(), "regard-pr.md"),
  `**${analysis.content.fr.title}**\n\n${analysis.content.fr.description}\n\nSource: [${analysis.source.title}](${analysis.source.url}) (${analysis.source.outlet}, ${analysis.source.date})\n\n- Page: \`/fr/blog/${analysis.slug}\` and \`/blog/${analysis.slug}\`\n- Visuals: \`public/campaign/news/${analysis.slug}/\` (ig, story, li), \`video.mp4\`, \`captions.md\`\n- Social image: \`public/social/${analysis.slug}.jpg\`\n\nReview checklist: facts match the source; no diagnosis of a named person; any quote is real and correctly attributed; suicide or self-harm content follows WHO guidance and lists where to get help.\n\nAfter merge and deploy, content-automation posts the article to the U.Psy pages the next morning, and the monthly newsletter includes it.`,
);
console.log(`Regard U.Psy: ${analysis.slug} → ${out}`);
