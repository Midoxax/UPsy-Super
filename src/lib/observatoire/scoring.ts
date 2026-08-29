// Scoring for L'Observatoire U.Psy.
//
// ANONYMITY RULE: the values produced here are the ONLY survey-derived data
// permitted to cross into the CRM (`growth_leads`). Everything is an explicit
// allow-list — never spread the raw answers object into a lead row.

import type { Track } from "./instrument";

export type Band = "A" | "B" | "C";

/** Platform reference floor for a 50-minute session, in MAD. */
export const SESSION_PRICE_FLOOR_MAD = 300;

export type Answers = Record<string, string | number | boolean | null | undefined>;

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

/**
 * Van Westendorp coherence: too_cheap < bargain < expensive < too_expensive.
 */
export const vanWestendorpCoherent = (a: Answers): boolean | null => {
  const tc = num(a.vw_too_cheap);
  const b = num(a.vw_bargain);
  const e = num(a.vw_expensive);
  const te = num(a.vw_too_expensive);
  if (tc === null || b === null || e === null || te === null) return null;
  return tc <= b && b <= e && e <= te;
};

const TIMELINE_POINTS: Record<string, number> = {
  now: 35,
  "3_months": 22,
  later: 8,
  unsure: 4,
};

export interface IntentScore {
  total: number;
  band: Band;
  parts: { timeline: number; intention: number; nps: number; wtp: number };
}

/**
 * Intent score 0-100. Weighted: timeline 35, intention 25, NPS 20, WTP 20.
 * Note this is a *purchase-intent* scale — deliberately not comparable with
 * the wellbeing score produced by /free-score. Always read alongside `source`.
 */
export const computeIntentScore = (a: Answers): IntentScore => {
  const timeline = TIMELINE_POINTS[String(a.timeline ?? "")] ?? 0;

  const intentionRaw = num(a.intention);
  const intention = intentionRaw ? Math.round(((intentionRaw - 1) / 4) * 25) : 0;

  const npsRaw = num(a.nps);
  const nps = npsRaw !== null ? Math.round((npsRaw / 10) * 20) : 0;

  const coherent = vanWestendorpCoherent(a);
  const acceptable = num(a.vw_expensive);
  let wtp = 0;
  if (coherent === true) {
    wtp = acceptable !== null && acceptable >= SESSION_PRICE_FLOOR_MAD ? 20 : 10;
  }

  const total = Math.max(0, Math.min(100, timeline + intention + nps + wtp));
  const band: Band = total >= 70 ? "A" : total >= 40 ? "B" : "C";
  return { total, band, parts: { timeline, intention, nps, wtp } };
};

/** Mean of the six patient barrier items, ranked strongest first. */
export const rankBarriers = (a: Answers): { key: string; value: number }[] =>
  [
    "barrier_cost",
    "barrier_availability",
    "barrier_stigma",
    "barrier_trust",
    "barrier_awareness",
    "barrier_teleconsultation",
  ]
    .map((key) => ({ key, value: num(a[key]) ?? 0 }))
    .sort((x, y) => y.value - x.value);

/**
 * The ONLY payload allowed into `growth_leads.score_breakdown`.
 * Explicit allow-list — no free text, no survey_responses id, no session token.
 */
export const buildLeadBreakdown = (
  track: Track,
  a: Answers,
  score: IntentScore,
  extra: { referral_code?: string | null; utm?: Record<string, string> } = {}
): Record<string, unknown> => {
  const base: Record<string, unknown> = {
    track,
    band: score.band,
    intent_parts: score.parts,
    timeline: a.timeline ?? null,
  };

  if (track === "patient") {
    base.intention = num(a.intention);
    base.nps = num(a.nps);
    base.payment_model = a.payment_model ?? null;
    base.wtp = {
      too_cheap: num(a.vw_too_cheap),
      bargain: num(a.vw_bargain),
      expensive: num(a.vw_expensive),
      too_expensive: num(a.vw_too_expensive),
      coherent: vanWestendorpCoherent(a),
    };
    base.top_barriers = rankBarriers(a).slice(0, 3).map((b) => b.key);
    base.org_interest = a.org_interest === true;
  } else {
    // Deliberately NO psychologist demographics (years of practice, practice
    // mode, city): low cardinality makes them re-identifying in a small market.
    base.commission_band = a.commission_band ?? null;
    base.preferred_model = a.preferred_model ?? null;
  }

  if (extra.referral_code) base.referral_code = extra.referral_code;
  if (extra.utm && Object.keys(extra.utm).length) base.utm = extra.utm;
  return base;
};

export const deviceType = (): string => {
  if (typeof window === "undefined") return "unknown";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
};