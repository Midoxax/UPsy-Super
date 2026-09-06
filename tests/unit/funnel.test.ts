/**
 * Funnel instrumentation invariants.
 *
 * These hold the two properties that fail silently in production: a funnel
 * that double-counts (making drop-off look better than it is), and a payload
 * that carries clinical free text into a third-party analytics tool.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const captureEvent = vi.fn();
const pushDataLayer = vi.fn();

vi.mock("@/lib/analytics/posthog", () => ({
  captureEvent: (...args: unknown[]) => captureEvent(...args),
}));
vi.mock("@/lib/analytics/gtm", () => ({
  pushDataLayer: (...args: unknown[]) => pushDataLayer(...args),
}));

import {
  FUNNELS,
  FUNNEL_STEPS,
  trackFunnelStep,
  trackFunnelCompleted,
  trackFunnelFailed,
  resetFunnel,
  priceBucket,
} from "@/lib/analytics/funnel";

beforeEach(() => {
  captureEvent.mockClear();
  pushDataLayer.mockClear();
  resetFunnel(FUNNELS.match);
  resetFunnel(FUNNELS.booking);
});

describe("step deduplication", () => {
  it("records a step once however many times a render fires it", () => {
    // React re-renders a wizard step on every keystroke. Without the guard,
    // one visitor on the needs step reports as dozens, which inflates the top
    // of the funnel and hides the drop-off the funnel exists to measure.
    trackFunnelStep(FUNNELS.match, "needs");
    trackFunnelStep(FUNNELS.match, "needs");
    trackFunnelStep(FUNNELS.match, "needs");

    expect(captureEvent).toHaveBeenCalledTimes(1);
    expect(pushDataLayer).toHaveBeenCalledTimes(1);
  });

  it("counts a step again after the funnel is reset", () => {
    // Reopening the booking modal is a second attempt by the same person, and
    // the retry is the interesting one. It must not be swallowed as a dupe.
    trackFunnelStep(FUNNELS.booking, "date");
    resetFunnel(FUNNELS.booking);
    trackFunnelStep(FUNNELS.booking, "date");

    expect(captureEvent).toHaveBeenCalledTimes(2);
  });

  it("resets one funnel without clearing the other", () => {
    trackFunnelStep(FUNNELS.match, "feeling");
    trackFunnelStep(FUNNELS.booking, "type");
    captureEvent.mockClear();

    resetFunnel(FUNNELS.booking);
    trackFunnelStep(FUNNELS.match, "feeling"); // still deduped
    trackFunnelStep(FUNNELS.booking, "type"); // reset, so counted

    expect(captureEvent).toHaveBeenCalledTimes(1);
    expect(captureEvent.mock.calls[0][0]).toBe("booking.step_viewed");
  });

  it("never deduplicates a completion, because a second booking is a second sale", () => {
    trackFunnelCompleted(FUNNELS.booking);
    trackFunnelCompleted(FUNNELS.booking);
    expect(captureEvent).toHaveBeenCalledTimes(2);
  });
});

describe("event shape", () => {
  it("uses the domain.action past-tense convention the event catalogue enforces", () => {
    trackFunnelStep(FUNNELS.match, "welcome");
    trackFunnelCompleted(FUNNELS.match);
    trackFunnelFailed(FUNNELS.match, "no_results");

    const names = captureEvent.mock.calls.map((c) => c[0]);
    expect(names).toEqual(["match.step_viewed", "match.completed", "match.failed"]);
    for (const n of names) {
      expect(n).toMatch(/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/);
    }
  });

  it("carries the position so drop-off can be reconstructed", () => {
    trackFunnelStep(FUNNELS.booking, "confirm");
    const payload = captureEvent.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.step_index).toBe(FUNNEL_STEPS.booking.indexOf("confirm"));
    expect(payload.step_total).toBe(FUNNEL_STEPS.booking.length);
  });

  it("reports an unregistered step as missing rather than as step zero", () => {
    // -1 would render as the first step in a funnel chart and quietly corrupt
    // it; undefined shows up as missing data, which is visible.
    trackFunnelStep(FUNNELS.booking, "not_a_real_step");
    const payload = captureEvent.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.step_index).toBeUndefined();
  });

  it("sends the same event to both sinks, since either may be unconfigured", () => {
    trackFunnelStep(FUNNELS.match, "results");
    expect(captureEvent).toHaveBeenCalledTimes(1);
    expect(pushDataLayer).toHaveBeenCalledTimes(1);
  });
});

describe("price bucketing", () => {
  it("buckets rather than passing a rate that identifies a psychologist", () => {
    expect(priceBucket(250)).toBe("under_300");
    expect(priceBucket(400)).toBe("300_499");
    expect(priceBucket(600)).toBe("500_799");
    expect(priceBucket(1200)).toBe("800_plus");
  });

  it("returns undefined for absent or nonsensical amounts", () => {
    expect(priceBucket(undefined)).toBeUndefined();
    expect(priceBucket(null)).toBeUndefined();
    expect(priceBucket(Number.NaN)).toBeUndefined();
    expect(priceBucket(-5)).toBeUndefined();
  });
});

describe("payload safety", () => {
  it("emits only structural keys, never anything a person typed", () => {
    // GTM's dataLayer does not scrub, so this module must not hand it free
    // text. These flows collect how someone feels and notes to a clinician.
    const allowed = new Set([
      "funnel",
      "step",
      "step_index",
      "step_total",
      "reason_code",
      "selection_count",
      "session_type",
      "result_count",
      "is_authenticated",
      "price_bucket",
      "locale",
    ]);

    trackFunnelStep(FUNNELS.match, "needs", { selection_count: 3, locale: "fr" });
    trackFunnelCompleted(FUNNELS.match, { result_count: 4, session_type: "online" });
    trackFunnelFailed(FUNNELS.booking, "not_authenticated", { is_authenticated: false });

    for (const [, payload] of captureEvent.mock.calls as [string, Record<string, unknown>][]) {
      for (const k of Object.keys(payload)) {
        expect(allowed.has(k), `unexpected key "${k}" in funnel payload`).toBe(true);
      }
    }
  });

  it("uses a closed reason vocabulary instead of upstream error text", () => {
    // Error messages come from services that change without notice and can
    // carry request detail; a code stays groupable across releases.
    trackFunnelFailed(FUNNELS.booking, "request_failed");
    const payload = captureEvent.mock.calls[0][1] as Record<string, unknown>;
    expect(["not_authenticated", "no_results", "request_failed"]).toContain(payload.reason_code);
  });
});
