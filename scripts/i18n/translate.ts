// Machine-translate English UI strings into French and Arabic.
//
// Finds every English key that French or Arabic has no text for, plus machine
// translations whose English has changed since they were written, and asks
// Claude for them in batches. Results go to src/lib/i18n/locales/auto/<lang>.json,
// which the locale files merge under their hand-written text (src/lib/i18n/autoMerge.ts),
// so a person's wording always wins.
//
//   npx tsx scripts/i18n/translate.ts          both languages
//   npx tsx scripts/i18n/translate.ts ar       one language
//   npx tsx scripts/i18n/translate.ts --dry    list what would be sent
//
// Needs ANTHROPIC_API_KEY (or an `ant auth login` profile). The GitHub workflow
// .github/workflows/i18n-translate.yml runs this when en.ts changes and opens
// a pull request with the result for review.
import Anthropic from "@anthropic-ai/sdk";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { ENGLISH, flatten, missingKeys, TARGETS, type Target } from "./shared";

const MODEL = "claude-opus-5-5";
const BATCH = 60;
const DIR = "src/lib/i18n/locales/auto";
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const only = args.filter((a) => a in TARGETS) as Target[];
const targets = only.length ? only : (Object.keys(TARGETS) as Target[]);

const LANGUAGE: Record<Target, string> = {
  fr: "French as written in Morocco (vous, formal but warm)",
  ar: "Modern Standard Arabic, clear and warm, as read by Moroccan and North African users",
};

// Stable across runs, so it is cached after the first batch.
const SYSTEM = `You translate the interface of U.Psy (upsy.ma), a Moroccan platform that connects people with verified psychologists for therapy, sport psychology and mental performance, in person or online.

Rules:
- Translate meaning and tone, not word for word. Clinical, calm, respectful; never alarmist or salesy.
- Keep placeholders exactly as written: {name}, {{count}}, %s, <b>…</b>, URLs, emails, phone numbers.
- Keep brand and product names unchanged: U.Psy, UPsy, Nour, Skool, LSSPM, WhatsApp, GAD-7, PHQ-9, EMDR, CBT/TCC acronyms as used locally.
- Match the length and register of the source: a button stays a short button, a title stays a title.
- Keep the source's capitalisation style for French sentence case; do not Title Case French.
- Glossary (English → French → Arabic):
  psychologist → psychologue → أخصائي نفسي
  session → séance → حصة
  therapy → thérapie → علاج نفسي
  booking / book → réservation / réserver → حجز / احجز
  assessment → évaluation → تقييم
  mental performance → performance mentale → الأداء الذهني
  wellbeing → bien-être → الرفاه النفسي
  athlete → sportif → رياضي
  verified → vérifié → موثوق
  match / matching → orientation / être orienté → توجيه
- Return every key you were given, with the translation as "text".`;

const SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: { key: { type: "string" }, text: { type: "string" } },
        required: ["key", "text"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
} as const;

const readJson = (path: string): Record<string, string> =>
  existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
const writeJson = (path: string, data: Record<string, string>) =>
  writeFileSync(
    path,
    JSON.stringify(Object.fromEntries(Object.entries(data).sort()), null, 2) +
      "\n",
  );

const english = flatten(ENGLISH);
const client = dry ? null : new Anthropic();

async function translateBatch(
  target: Target,
  keys: string[],
): Promise<Record<string, string>> {
  const payload = Object.fromEntries(keys.map((k) => [k, english[k]]));
  const response = await client!.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [
      { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
    ],
    output_config: { format: { type: "json_schema", schema: SCHEMA } },
    messages: [
      {
        role: "user",
        content: `Translate these English UI strings into ${LANGUAGE[target]}.\n\n${JSON.stringify(payload, null, 2)}`,
      },
    ],
  });
  if (response.stop_reason === "refusal")
    throw new Error(`Refused a ${target} batch starting at ${keys[0]}`);
  if (response.stop_reason === "max_tokens")
    throw new Error(`Batch starting at ${keys[0]} was cut off; lower BATCH`);
  const text = response.content
    .flatMap((b) => (b.type === "text" ? [b.text] : []))
    .join("");
  const { items } = JSON.parse(text) as {
    items: { key: string; text: string }[];
  };
  const out: Record<string, string> = {};
  for (const { key, text: value } of items)
    if (key in payload && value.trim()) out[key] = value;
  const lost = keys.filter((k) => !(k in out));
  if (lost.length)
    console.warn(
      `  ${target}: ${lost.length} key(s) came back empty, will retry next run`,
    );
  return out;
}

for (const target of targets) {
  const autoPath = `${DIR}/${target}.json`;
  const sourcePath = `${DIR}/${target}.source.json`;
  const auto = readJson(autoPath);
  const source = readJson(sourcePath); // the English each machine translation was made from
  const stale = Object.keys(auto).filter(
    (k) => k in english && source[k] !== english[k],
  );
  // A key removed from en.ts takes its machine translation with it.
  for (const k of Object.keys(auto)) {
    if (k in english) continue;
    delete auto[k];
    delete source[k];
  }
  const todo = [...new Set([...missingKeys(target), ...stale])];
  console.log(`${target}: ${todo.length} to translate (${stale.length} stale)`);
  if (dry) {
    for (const k of todo) console.log(`  ${k}: ${english[k]}`);
    continue;
  }
  for (let i = 0; i < todo.length; i += BATCH) {
    const done = await translateBatch(target, todo.slice(i, i + BATCH));
    for (const [k, v] of Object.entries(done)) {
      auto[k] = v;
      source[k] = english[k];
    }
    writeJson(autoPath, auto); // save as we go, so a failure keeps finished batches
    writeJson(sourcePath, source);
    console.log(`  ${Math.min(i + BATCH, todo.length)}/${todo.length}`);
  }
}
