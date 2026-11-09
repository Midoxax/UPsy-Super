/**
 * Validated psychometric instruments, scored exactly as their manuals say.
 *
 * Item wording is copied from the official published versions (see each
 * instrument's `source`), never paraphrased: a reworded item is a different,
 * unvalidated question, and its cut-offs no longer apply. Languages without a
 * verified official translation are simply absent; the UI falls back to
 * French, then English, and says so.
 */
export type Lang = "en" | "fr" | "ar";

/** Text in each available language. English is always present. */
export type Text = { en: string } & Partial<
  Record<Exclude<Lang, "en">, string>
>;

/** How concerning a band is, for colour and follow-up: never a diagnosis. */
export type Level = "low" | "moderate" | "high";

export interface Option {
  value: number;
  label: Text;
}

export interface Item {
  /** Stable id stored with answers, e.g. "phq9_1". */
  id: string;
  text: Text;
  /** Item-specific answers (AUDIT items 1–10 each have their own). */
  options?: Option[];
}

export interface Band {
  /** Inclusive lower bound of the scored value. */
  min: number;
  /** Inclusive upper bound. */
  max: number;
  label: Text;
  level: Level;
}

export interface Subscale {
  id: string;
  label: Text;
  items: string[];
  /** DASS-21 doubles subscale sums to match DASS-42 norms. */
  multiplier?: number;
  bands?: Band[];
}

/** A finding that must be shown whatever the total, e.g. PHQ-9 item 9. */
export interface Flag {
  id: string;
  /** "crisis" opens crisis resources immediately. */
  severity: "crisis" | "attention";
  message: Text;
}

export interface Instrument {
  /** Stable code, also stored in `assessments.code`. */
  code: string;
  name: Text;
  shortName: string;
  /** One-line card description (interface text, translated). */
  summary: Text;
  category: "general" | "athlete";
  /** Languages with a verified official item text. */
  languages: Lang[];
  instructions: Text;
  /** Default answer scale shared by items without their own options. */
  options: Option[];
  items: Item[];
  /** How the total is computed and read. Omitted when only subscales count. */
  total?: {
    label: Text;
    /** WHO-5: raw 0–25 × 4 = percentage 0–100. */
    multiplier?: number;
    bands: Band[];
  };
  subscales?: Subscale[];
  /** Items skipped when an earlier answer makes them not applicable. */
  skip?: (answers: Answers) => string[];
  flags?: (answers: Answers) => Flag[];
  minutes: number;
  /** Full reference and where the official text was taken from. */
  source: string;
  license: string;
}

export type Answers = Record<string, number>;

export interface ScaleResult {
  raw: number;
  score: number;
  max: number;
  band: Band | null;
}

export interface InstrumentResult {
  code: string;
  complete: boolean;
  /** Item ids that still need an answer (skipped items excluded). */
  missing: string[];
  total: ScaleResult | null;
  subscales: Record<string, ScaleResult>;
  flags: Flag[];
  /** Highest concern across total and subscales, for the result header. */
  level: Level;
}
