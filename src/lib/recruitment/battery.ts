import { INSTRUMENTS_BY_CODE } from "@/lib/psychometrics/instruments";
import { scoreInstrument } from "@/lib/psychometrics/score";
import type { InstrumentResult } from "@/lib/psychometrics/types";

/**
 * LSSPM recruitment battery, browser side: the Mini-IPIP6 personality items,
 * attention checks, and the scoring and interpretation of everything except
 * the vignettes (scored on the server, key never sent).
 *
 * Mini-IPIP6 — Sibley, Luyten, Purnomo et al. (2011), New Zealand Journal of
 * Psychology 40(3), 142-159, built on the Mini-IPIP of Donnellan, Oswald,
 * Baird & Lucas (2006), Psychological Assessment 18(2), 192-203. Items from
 * the International Personality Item Pool (ipip.ori.org), public domain.
 * Item wording is the published English text; no validated French version is
 * bundled, so the items show in English (the UI says so).
 * Scored 1-5 per item, trait = mean of its four items. Interpretation bands
 * (< 2.5 low, > 3.5 high) are descriptive, not normative.
 */

export type Trait = "E" | "A" | "C" | "N" | "I" | "H";
export type Niche = "adult" | "child" | "sport" | "neuro" | "work" | "trauma";

export const NICHES: Niche[] = [
  "adult",
  "child",
  "sport",
  "neuro",
  "work",
  "trauma",
];

export const IPIP_SCALE = [
  "Very inaccurate",
  "Moderately inaccurate",
  "Neither accurate nor inaccurate",
  "Moderately accurate",
  "Very accurate",
];

type IpipItem = { id: string; text: string; trait: Trait; reverse: boolean };

/** The 24 Mini-IPIP6 items (four per trait), mixed across traits. */
export const IPIP: IpipItem[] = (
  [
    ["Am the life of the party.", "E", false],
    ["Sympathize with others' feelings.", "A", false],
    ["Get chores done right away.", "C", false],
    ["Have frequent mood swings.", "N", false],
    ["Have a vivid imagination.", "I", false],
    ["Feel entitled to more of everything.", "H", true],
    ["Don't talk a lot.", "E", true],
    ["Am not interested in other people's problems.", "A", true],
    ["Have difficulty understanding abstract ideas.", "I", true],
    ["Like order.", "C", false],
    ["Make a mess of things.", "C", true],
    ["Deserve more things in life.", "H", true],
    ["Do not have a good imagination.", "I", true],
    ["Feel others' emotions.", "A", false],
    ["Am relaxed most of the time.", "N", true],
    ["Get upset easily.", "N", false],
    ["Seldom feel blue.", "N", true],
    [
      "Would like to be seen driving around in a very expensive car.",
      "H",
      true,
    ],
    ["Keep in the background.", "E", true],
    ["Am not really interested in others.", "A", true],
    ["Am not interested in abstract ideas.", "I", true],
    ["Often forget to put things back in their proper place.", "C", true],
    ["Talk to a lot of different people at parties.", "E", false],
    [
      "Would get a lot of pleasure from owning expensive luxury goods.",
      "H",
      true,
    ],
  ] as [string, Trait, boolean][]
).map(([text, trait, reverse], i) => ({
  id: `ipip_${i + 1}`,
  text,
  trait,
  reverse,
}));

/** Attention checks inserted among the personality items (expected: 4). */
export const ATTENTION = [
  {
    id: "att_1",
    after: 8,
    fr: "Pour vérifier votre attention, choisissez « Moderately accurate ».",
    en: "To check your attention, choose “Moderately accurate”.",
  },
  {
    id: "att_2",
    after: 16,
    fr: "Pour cette ligne, sélectionnez la quatrième réponse.",
    en: "For this line, select the fourth answer.",
  },
  {
    id: "att_3",
    after: 22,
    fr: "Merci de répondre « Moderately accurate » à cette question.",
    en: "Please answer “Moderately accurate” to this question.",
  },
];
export const ATTENTION_EXPECTED = 4;

/** Pairs of opposite items of the same trait: an attentive answer agrees. */
const OPPOSITES: [string, string][] = [
  ["ipip_1", "ipip_19"],
  ["ipip_23", "ipip_7"],
  ["ipip_2", "ipip_8"],
  ["ipip_14", "ipip_20"],
  ["ipip_4", "ipip_15"],
  ["ipip_16", "ipip_17"],
  ["ipip_3", "ipip_11"],
  ["ipip_10", "ipip_22"],
];

export type Likert = Record<string, number>;
export type Level = "low" | "mid" | "high";

export type TraitScore = { mean: number; level: Level };

export type Validity = {
  attentionFailed: number;
  inconsistency: number;
  straightLining: boolean;
  tooFast: boolean;
  /** True when answers should be read with caution. */
  caution: boolean;
};

export type Report = {
  traits: Record<Trait, TraitScore>;
  who5: InstrumentResult;
  k6: InstrumentResult;
  validity: Validity;
};

const level = (m: number): Level =>
  m < 2.5 ? "low" : m > 3.5 ? "high" : "mid";

export function scoreTraits(a: Likert): Record<Trait, TraitScore> {
  const out = {} as Record<Trait, TraitScore>;
  for (const t of ["E", "A", "C", "N", "I", "H"] as Trait[]) {
    const items = IPIP.filter((i) => i.trait === t);
    const sum = items.reduce(
      (s, i) => s + (i.reverse ? 6 - (a[i.id] ?? 3) : (a[i.id] ?? 3)),
      0,
    );
    const mean = Math.round((sum / items.length) * 100) / 100;
    out[t] = { mean, level: level(mean) };
  }
  return out;
}

export function validity(
  a: Likert,
  startedAt: string,
  completedAt: string | null,
): Validity {
  const attentionFailed = ATTENTION.filter(
    (x) => a[x.id] !== ATTENTION_EXPECTED,
  ).length;
  // Mean disagreement of opposite pairs (0 = consistent, 4 = contradictory).
  const inconsistency =
    Math.round(
      (OPPOSITES.reduce(
        (s, [p, q]) => s + Math.abs((a[p] ?? 3) - (6 - (a[q] ?? 3))),
        0,
      ) /
        OPPOSITES.length) *
        100,
    ) / 100;
  const values = IPIP.map((i) => a[i.id]).filter((v) => v != null);
  const mode = Math.max(
    ...[1, 2, 3, 4, 5].map((v) => values.filter((x) => x === v).length),
  );
  const straightLining = values.length > 0 && mode / values.length >= 0.8;
  const minutes = completedAt
    ? (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000
    : Infinity;
  const tooFast = minutes < 8;
  return {
    attentionFailed,
    inconsistency,
    straightLining,
    tooFast,
    caution:
      attentionFailed >= 1 || inconsistency >= 2 || straightLining || tooFast,
  };
}

export function buildReport(
  likert: Likert,
  startedAt: string,
  completedAt: string | null,
): Report {
  return {
    traits: scoreTraits(likert),
    who5: scoreInstrument(INSTRUMENTS_BY_CODE.who5, likert),
    k6: scoreInstrument(INSTRUMENTS_BY_CODE.k6, likert),
    validity: validity(likert, startedAt, completedAt),
  };
}

/** Where a profile is likely to contribute, from traits and vignettes. */
export function suggestedDivisions(
  traits: Record<Trait, TraitScore>,
  sjtCorePct: number | null,
): string[] {
  const s = (t: Trait) => traits[t].mean;
  const out: string[] = [];
  if (s("E") > 3.3 && s("I") > 3.3) out.push("formation");
  if (s("A") > 3.5 && s("C") > 3.3 && s("N") < 3 && (sjtCorePct ?? 0) >= 75)
    out.push("supervision");
  if (s("I") > 3.5 && s("C") > 3.3) out.push("recherche");
  if (s("E") > 3.5 && s("A") > 3.3) out.push("communication");
  return out;
}
