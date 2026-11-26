/**
 * The follow-up sequences and how one email of them is rendered.
 * Sent by the nurture-emails function (20261126120000_nurture_sequences.sql).
 */
import {
  BRAND,
  button,
  callout,
  details,
  escapeHtml,
  renderEmail,
  rich,
  toText,
} from "../email/layout.ts";
import { COMMON } from "./common.ts";
import { FREE_SCORE } from "./freeScore.ts";
import { LSSPM } from "./lsspm.ts";
import { ONBOARDING } from "./onboarding.ts";
import { SPECIALIST } from "./specialist.ts";
import {
  type Block,
  type Flags,
  type Lang,
  LANG_CODES,
  LANGS,
  type SequenceDef,
  type SequenceId,
} from "./types.ts";

export * from "./types.ts";
export { COMMON };

export const SEQUENCES: Record<SequenceId, SequenceDef> = {
  lsspm: LSSPM,
  specialist: SPECIALIST,
  free_score: FREE_SCORE,
  onboarding: ONBOARDING,
};

/** The next step to send from `from` on, skipping steps already done;
 *  null when the sequence is over. */
export function nextStep(
  seq: SequenceDef,
  from: number,
  flags: Flags,
): number | null {
  for (let i = from; i < seq.steps.length; i++) {
    if (!seq.steps[i].skipIf?.(flags)) return i;
  }
  return null;
}

/** Fee rows for the League's fees block, from league_membership_plans. */
export interface FeeRow {
  label_fr: string;
  label_en: string | null;
  label_ar: string | null;
  amount_mad: number | null;
}

const SITE = "https://upsy.ma";

export function ctaUrl(seq: SequenceDef, step: number, lang: Lang): string {
  const path = seq.steps[step].path;
  const sep = path.includes("?") ? "&" : "?";
  return `${SITE}/${LANGS[lang].site}${path}${sep}utm_source=nurture&utm_medium=email&utm_campaign=${seq.id}&utm_content=step${step + 1}`;
}

const firstName = (full: string | null | undefined) => {
  const n = (full ?? "").trim().split(/\s+/)[0] ?? "";
  return n.length >= 2 && n.length <= 30 ? n : null;
};

function feeLabel(r: FeeRow, lang: Lang) {
  const l = LANGS[lang].layout;
  return (
    (l === "ar" ? r.label_ar : l === "en" ? r.label_en : null) ?? r.label_fr
  );
}

export function renderNurture(o: {
  seq: SequenceDef;
  step: number;
  /** The language to write in (see sendLang). */
  lang: Lang;
  fullName?: string | null;
  unsubscribeUrl: string;
  /** Other languages the recipient can switch to. */
  languageLinks?: { lang: Lang; url: string }[];
  fees?: FeeRow[];
}): { subject: string; html: string; text: string } {
  const { seq, step, lang } = o;
  const c = seq.copy[lang][step];
  const t = COMMON[lang];
  const locale = LANGS[lang].layout;
  const rtl = locale === "ar";

  const block = (b: Block): string => {
    if (typeof b === "string") return rich(escapeHtml(b), locale);
    if ("list" in b) {
      const items = b.list
        .map((x) => `<li style="margin:0 0 8px;">${escapeHtml(x)}</li>`)
        .join("");
      return `<ul style="margin:0 0 18px;padding-${rtl ? "right" : "left"}:22px;font-family:${rtl ? BRAND.arabic : BRAND.sans};font-size:15px;line-height:1.6;color:${BRAND.body};text-align:${rtl ? "right" : "left"};">${items}</ul>`;
    }
    if ("note" in b) return callout(escapeHtml(b.note), locale);
    if ("safety" in b) return callout(escapeHtml(t.safety), locale, "action");
    if ("fees" in b) {
      const rows = (o.fees ?? []).map(
        (r) =>
          [
            feeLabel(r, lang),
            r.amount_mad == null ? "—" : `${Number(r.amount_mad)} ${t.perYear}`,
          ] as [string, string],
      );
      if (rows.length === 0) return "";
      return `${details(rows, locale)}${rich(`<span style="font-size:13px;color:${BRAND.muted};">${escapeHtml(t.feesNote)}</span>`, locale)}`;
    }
    return "";
  };

  const body = [
    rich(escapeHtml(t.hello(firstName(o.fullName))), locale),
    ...c.body.map(block),
    button(c.cta, ctaUrl(seq, step, lang), locale),
    rich(
      `${escapeHtml(t.signoff)}<br>${escapeHtml(seq.partner === "lsspm" ? t.teamLeague : t.team)}`,
      locale,
    ),
    rich(
      `<span style="font-size:13px;color:${BRAND.muted};">${escapeHtml(t.questions)}</span>`,
      locale,
    ),
  ].join("");

  const links = (o.languageLinks ?? [])
    .filter((l) => l.lang !== lang)
    .map(
      (l) =>
        `<a href="${escapeHtml(l.url)}" lang="${l.lang}" style="color:${BRAND.muted};text-decoration:underline;">${escapeHtml(LANGS[l.lang].name)}</a>`,
    )
    .join(" &middot; ");

  const html = renderEmail({
    locale,
    lang,
    preheader: c.preheader,
    eyebrow: c.eyebrow,
    title: c.title,
    body,
    unsubscribeUrl: o.unsubscribeUrl,
    footerNote: t.why,
    footer: t.footer,
    footerExtra: links ? `${escapeHtml(t.readIn)} ${links}` : undefined,
    partner: seq.partner,
  });
  return { subject: c.subject, html, text: toText(html) };
}

/** Every language with a complete copy (used by the tests). */
export const ALL_LANGS = LANG_CODES;
