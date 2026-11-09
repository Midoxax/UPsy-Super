/**
 * Clinical resource library: psychoeducation guides and printable worksheets
 * (CBT/TCC and schema therapy), rendered at /resources/<slug>.
 *
 * Written for U.Psy, in French and English. Arabic readers get the French text
 * until an Arabic version is added (titles and summaries are translated).
 * Concepts and technique names come from the cited literature; no copyrighted
 * questionnaire (e.g. YSQ, SMI) is reproduced.
 */
export type LibLang = "fr" | "en";

export interface LibTable {
  columns: string[];
  /** A filled-in example row, shown in italics. */
  example?: string[];
  /** Empty rows to fill in when printed. */
  blankRows?: number;
}

export interface LibSection {
  heading: string;
  body?: string[];
  bullets?: string[];
  /** Numbered steps. */
  steps?: string[];
  table?: LibTable;
  /** A highlighted practical tip. */
  tip?: string;
}

export interface LibBody {
  title: string;
  summary: string;
  sections: LibSection[];
}

export interface LibResource {
  slug: string;
  approach:
    "cbt" | "schema" | "act" | "dbt" | "compassion" | "sport" | "wellbeing";
  format: "guide" | "worksheet";
  /** Matches resource_topics.slug, so it files under an existing topic. */
  topic: string;
  readMinutes: number;
  /** Shown as a note: some techniques belong in therapy, not self-help. */
  withTherapist?: boolean;
  content: Record<LibLang, LibBody>;
  ar: { title: string; summary: string };
  references: string[];
}
