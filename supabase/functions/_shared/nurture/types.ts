/**
 * Follow-up email sequences ("nurture"): shared types and the languages they
 * are written in. Pure TypeScript, no Deno or npm imports, so the app's unit
 * tests can check the copy too.
 */

/** fr, ar, en: the site's languages. ary: Moroccan Darija (Arabic script).
 *  zgh: Standard Moroccan Tamazight (Tifinagh). rif: Tarifit (Latin). */
export type Lang = "fr" | "ar" | "en" | "ary" | "zgh" | "rif";
export const LANG_CODES: Lang[] = ["fr", "ar", "en", "ary", "zgh", "rif"];

export interface LangInfo {
  /** The language's own name, shown in the language links. */
  name: string;
  /** Email layout it uses: direction, fonts, alignment. */
  layout: "fr" | "en" | "ar";
  /** Site version the links open. */
  site: "fr" | "en" | "ar";
  /**
   * Read and approved by a native speaker. Only reviewed languages are sent
   * and offered in the language links; a recipient whose language is not
   * reviewed yet receives French (Arabic for Darija).
   */
  reviewed: boolean;
}

export const LANGS: Record<Lang, LangInfo> = {
  fr: { name: "Français", layout: "fr", site: "fr", reviewed: true },
  ar: { name: "العربية", layout: "ar", site: "ar", reviewed: true },
  en: { name: "English", layout: "en", site: "en", reviewed: true },
  ary: { name: "الدارجة", layout: "ar", site: "ar", reviewed: false },
  zgh: { name: "ⵜⴰⵎⴰⵣⵉⵖⵜ", layout: "fr", site: "fr", reviewed: false },
  rif: { name: "Tarifit", layout: "fr", site: "fr", reviewed: false },
};

/** The language an email is actually written in for a recipient. */
export const sendLang = (l: Lang): Lang =>
  LANGS[l]?.reviewed ? l : l === "ary" ? "ar" : "fr";

export const normaliseLang = (v: unknown): Lang => {
  const s = String(v ?? "").toLowerCase();
  if ((LANG_CODES as string[]).includes(s)) return s as Lang;
  const two = s.slice(0, 2);
  return two === "ar" || two === "en" ? two : "fr";
};

export type SequenceId = "lsspm" | "specialist" | "free_score" | "onboarding";

/** What the database knows about a recipient, read at send time. */
export interface Flags {
  /** Submitted a U.Psy application (psychologists). */
  applied?: boolean;
  /** Has booked a session (patients). */
  booked?: boolean;
  /** Onboarding: profile pieces in place. */
  photo?: boolean;
  bio?: boolean;
  rate?: boolean;
  slots?: boolean;
  published?: boolean;
}

/** A paragraph, a bullet list, a highlighted note, or a generated block. */
export type Block =
  | string
  | { list: string[] }
  | { note: string }
  | { fees: true }
  | { safety: true };

export interface EmailCopy {
  subject: string;
  preheader: string;
  eyebrow: string;
  title: string;
  /** Use {name} for the first name; the greeting is added automatically. */
  body: Block[];
  cta: string;
}

export interface StepDef {
  /** Hours to wait after the previous email (step 0: after sign-up). */
  delayHours: number;
  /** Page the button opens, without the language prefix. */
  path: string;
  /** Not sent when this holds; the sequence moves to the next step. */
  skipIf?: (f: Flags) => boolean;
}

export interface SequenceDef {
  id: SequenceId;
  steps: StepDef[];
  /** The goal is reached: no further email. */
  convertedIf?: (f: Flags) => boolean;
  /** Co-branded with the League. */
  partner?: "lsspm";
  copy: Record<Lang, EmailCopy[]>;
}
