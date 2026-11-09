import type {
  Answers,
  Band,
  Instrument,
  InstrumentResult,
  Item,
  Lang,
  Level,
  Option,
  ScaleResult,
  Text,
} from "./types";

const LEVEL_RANK: Record<Level, number> = { low: 0, moderate: 1, high: 2 };

export const optionsFor = (inst: Instrument, item: Item): Option[] =>
  item.options ?? inst.options;

const maxFor = (inst: Instrument, item: Item) =>
  Math.max(...optionsFor(inst, item).map((o) => o.value));

const bandFor = (bands: Band[] | undefined, value: number): Band | null =>
  bands?.find((b) => value >= b.min && value <= b.max) ?? null;

/** Text in the requested language, else French, else English. */
export const tr = (t: Text, lang: Lang): string => t[lang] ?? t.fr ?? t.en;

/** True when this instrument's items exist in `lang` (no fallback needed). */
export const hasOfficialText = (inst: Instrument, lang: Lang) =>
  inst.languages.includes(lang);

/**
 * Score an instrument exactly as its manual defines.
 *
 * Every applicable item must be answered: these scales are not validated with
 * prorated or partial totals, so an incomplete form returns `complete: false`
 * and no bands. Answers must be one of the item's own option values.
 */
export function scoreInstrument(
  inst: Instrument,
  answers: Answers,
): InstrumentResult {
  const skipped = new Set(inst.skip?.(answers) ?? []);
  const valid = (item: Item) =>
    optionsFor(inst, item).some((o) => o.value === answers[item.id]);
  const missing = inst.items
    .filter((i) => !skipped.has(i.id) && !valid(i))
    .map((i) => i.id);
  const complete = missing.length === 0;

  // Skipped items count as 0, as the AUDIT instructions require.
  const value = (id: string) => (skipped.has(id) ? 0 : (answers[id] ?? 0));
  const byId = new Map(inst.items.map((i) => [i.id, i]));

  const scale = (
    ids: string[],
    multiplier = 1,
    bands?: Band[],
  ): ScaleResult => {
    const raw = ids.reduce((s, id) => s + value(id), 0);
    const max = ids.reduce((s, id) => s + maxFor(inst, byId.get(id)!), 0);
    const score = raw * multiplier;
    return {
      raw,
      score,
      max: max * multiplier,
      band: complete ? bandFor(bands, score) : null,
    };
  };

  const total = inst.total
    ? scale(
        inst.items.map((i) => i.id),
        inst.total.multiplier,
        inst.total.bands,
      )
    : null;

  const subscales: Record<string, ScaleResult> = {};
  for (const s of inst.subscales ?? [])
    subscales[s.id] = scale(s.items, s.multiplier, s.bands);

  // Safety flags apply even to an incomplete form: a "yes" to self-harm
  // must never wait for the last answer.
  const flags = inst.flags?.(answers) ?? [];

  const bands = [total?.band, ...Object.values(subscales).map((s) => s.band)];
  let level: Level = "low";
  for (const b of bands)
    if (b && LEVEL_RANK[b.level] > LEVEL_RANK[level]) level = b.level;
  if (flags.some((f) => f.severity === "crisis")) level = "high";

  return {
    code: inst.code,
    complete,
    missing,
    total,
    subscales,
    flags,
    level,
  };
}
