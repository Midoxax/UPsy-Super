/**
 * Funnel instrumentation for the two flows that produce revenue.
 *
 * WHY THIS EXISTS
 *
 * Before this module, exactly one file in the application emitted an analytics
 * event (`FreeScore.tsx`, three calls). The two flows that actually end in a
 * booking — the matching questionnaire and the booking modal — were completely
 * dark. Both are multi-step wizards, which is the one shape where drop-off is
 * both inevitable and invisible: a visitor who quits on step 3 of 5 looks
 * identical to one who never arrived.
 *
 * That makes every decision about pricing, copy or layout a guess. "Should the
 * questionnaire be shorter?" is unanswerable without knowing which step loses
 * people. This module makes that question answerable.
 *
 * WHY IT FANS OUT TO BOTH SINKS
 *
 * PostHog and GTM are configured independently, and either may be absent:
 * PostHog no-ops without `VITE_POSTHOG_KEY`, GTM no-ops without a container.
 * Sending to both means the funnel is captured by whichever is live, rather
 * than silently recording nothing because the wrong one was configured.
 *
 * WHY IT DEDUPLICATES
 *
 * React re-renders a step on every keystroke and every state change. Emitting
 * on render without a guard reports one visitor on step 2 as forty, which
 * inflates the top of the funnel and understates the drop-off — the precise
 * number the funnel exists to measure. Steps are therefore recorded once per
 * run, and `resetFunnel` starts a new run.
 *
 * WHAT IT MUST NEVER SEND
 *
 * These flows collect how someone feels, what they are struggling with, and
 * free-text notes to a psychologist. PostHog's wrapper scrubs known PII keys,
 * but GTM's dataLayer does not scrub anything. So the rule here is stricter
 * than either sink: only structural facts leave this module — step names,
 * counts, positions, booleans and coarse buckets. Never answers, never notes,
 * never names, never anything a person typed.
 */
import { captureEvent } from "./posthog";
import { pushDataLayer } from "./gtm";

/** The revenue-producing flows. Used as the event `domain`. */
export const FUNNELS = {
  /** The matching questionnaire at /get-matched. */
  match: "match",
  /** The booking modal on a psychologist profile. */
  booking: "booking",
} as const;

export type FunnelName = (typeof FUNNELS)[keyof typeof FUNNELS];

/**
 * Ordered steps per funnel. The order is the funnel definition: analytics
 * tools reconstruct drop-off from position, so this array is the contract,
 * not a display list. Adding a step in the middle changes the funnel shape,
 * which is why the position is derived from here rather than hardcoded at
 * each call site.
 */
export const FUNNEL_STEPS: Record<FunnelName, readonly string[]> = {
  match: ["welcome", "feeling", "needs", "preferences", "searching", "results"],
  booking: ["type", "date", "time", "confirm", "success"],
} as const;

/**
 * Properties safe to attach to a funnel event. Deliberately narrow: anything
 * free-text or clinical is excluded by type, not by reviewer vigilance.
 */
export interface FunnelProps {
  /** How many options a multi-select step has selected. Not which ones. */
  selection_count?: number;
  /** Session modality — a product fact, not a clinical one. */
  session_type?: "online" | "in_person";
  /** Number of results returned, to separate "no matches" from "did not look". */
  result_count?: number;
  /** Whether the visitor was signed in, the most common booking blocker. */
  is_authenticated?: boolean;
  /** Coarse price bucket in MAD. Never a per-person negotiated figure. */
  price_bucket?: string;
  /** Locale, to see whether a language loses people. */
  locale?: string;
}

/** Steps already recorded in the current run, so re-renders do not double count. */
const seen = new Set<string>();

function key(funnel: FunnelName, step: string): string {
  return `${funnel}:${step}`;
}

/**
 * Coarse price buckets. A raw amount is close to a per-visitor identifier once
 * rates differ per psychologist; a bucket answers "does price lose people?"
 * without carrying that risk into a third-party tool.
 */
export function priceBucket(amountMad: number | null | undefined): string | undefined {
  if (typeof amountMad !== "number" || !Number.isFinite(amountMad) || amountMad < 0) {
    return undefined;
  }
  if (amountMad < 300) return "under_300";
  if (amountMad < 500) return "300_499";
  if (amountMad < 800) return "500_799";
  return "800_plus";
}

/**
 * Record that a visitor reached a step. Idempotent within a run.
 *
 * Emitted as `<funnel>.step_viewed` to match the `domain.action`, past-tense
 * convention the server-side event catalogue already enforces, so both event
 * streams read the same way in a warehouse.
 */
export function trackFunnelStep(
  funnel: FunnelName,
  step: string,
  props: FunnelProps = {},
): void {
  const k = key(funnel, step);
  if (seen.has(k)) return;
  seen.add(k);

  const position = FUNNEL_STEPS[funnel].indexOf(step);
  const payload = {
    funnel,
    step,
    // -1 would silently corrupt a funnel chart; surfacing it as undefined makes
    // an unregistered step visible as missing data instead of as step zero.
    step_index: position >= 0 ? position : undefined,
    step_total: FUNNEL_STEPS[funnel].length,
    ...props,
  };

  captureEvent(`${funnel}.step_viewed`, payload);
  pushDataLayer({ event: `${funnel}_step_viewed`, ...payload });
}

/**
 * Record that the funnel produced its outcome — a match list, or a booking.
 * Always emitted, never deduplicated: a second booking is a second sale.
 */
export function trackFunnelCompleted(funnel: FunnelName, props: FunnelProps = {}): void {
  const payload = { funnel, ...props };
  captureEvent(`${funnel}.completed`, payload);
  pushDataLayer({ event: `${funnel}_completed`, ...payload });
}

/**
 * Record that the funnel failed for a reason the product controls.
 *
 * `reason_code` is a closed vocabulary rather than an error message: messages
 * come from upstream services, change without notice, and can carry request
 * detail. A code stays groupable across releases.
 */
export function trackFunnelFailed(
  funnel: FunnelName,
  reasonCode: "not_authenticated" | "no_results" | "request_failed",
  props: FunnelProps = {},
): void {
  const payload = { funnel, reason_code: reasonCode, ...props };
  captureEvent(`${funnel}.failed`, payload);
  pushDataLayer({ event: `${funnel}_failed`, ...payload });
}

/**
 * Start a new run, so a visitor who reopens the modal is counted again.
 * Without this, the second attempt reports no steps at all and the funnel
 * under-counts everyone who tried twice.
 */
export function resetFunnel(funnel: FunnelName): void {
  for (const k of [...seen]) {
    if (k.startsWith(`${funnel}:`)) seen.delete(k);
  }
}
