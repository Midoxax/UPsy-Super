/**
 * The free self-score must not leak a visitor's answers or results.
 *
 * Its events go to a tag manager that can feed advertising tools and to
 * product analytics. This suite holds the rule that only progress, completion
 * and the overall band leave the page: no answer, no score, no pillar.
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
  ALLOWED_KEYS,
  freeScoreBand,
  trackQuizAnswer,
  trackQuizStart,
  trackQuizSubmit,
  trackResultClick,
} from "@/lib/analytics/freeScore";

beforeEach(() => {
  captureEvent.mockClear();
  pushDataLayer.mockClear();
});

/** Every payload sent to either tool during a full run of the quiz. */
function runWholeQuiz(total: number): Record<string, unknown>[] {
  trackQuizStart(12, "fr");
  for (let i = 1; i <= 12; i++) trackQuizAnswer(i, 12, "fr");
  trackQuizSubmit(total, true, "fr");
  trackResultClick("pillar", total);
  trackResultClick("match", total);
  return [
    ...pushDataLayer.mock.calls.map((c) => c[0] as Record<string, unknown>),
    ...captureEvent.mock.calls.map((c) => c[1] as Record<string, unknown>),
  ];
}

describe("free self-score analytics", () => {
  it("sends only allow-listed property names", () => {
    for (const payload of runWholeQuiz(41)) {
      for (const key of Object.keys(payload)) {
        expect(ALLOWED_KEYS).toContain(key);
      }
    }
  });

  it("never sends an answer, a score or a pillar", () => {
    const forbidden =
      /value|answer|score|pillar|focus|regulation|recovery|meaning|weakest|question_key/i;
    for (const payload of runWholeQuiz(41)) {
      for (const key of Object.keys(payload)) {
        expect(key).not.toMatch(forbidden);
      }
    }
  });

  it("sends no number that could be the result", () => {
    // 41 is the total used here; question_index and total_questions are the
    // only numbers allowed, and neither can equal it.
    for (const payload of runWholeQuiz(41)) {
      expect(Object.values(payload)).not.toContain(41);
    }
  });

  it("gives the tag manager no result at all, not even the band", () => {
    runWholeQuiz(41);
    for (const [payload] of pushDataLayer.mock.calls) {
      expect(payload).not.toHaveProperty("band");
    }
  });

  it("reports the band to product analytics on completion", () => {
    trackQuizSubmit(80, false, "en");
    expect(captureEvent).toHaveBeenCalledWith("free_score_completed", {
      band: "strong",
      locale: "en",
    });
  });

  it("uses the same band thresholds as the results screen", () => {
    expect(freeScoreBand(75)).toBe("strong");
    expect(freeScoreBand(74)).toBe("balanced");
    expect(freeScoreBand(55)).toBe("balanced");
    expect(freeScoreBand(54)).toBe("strained");
    expect(freeScoreBand(35)).toBe("strained");
    expect(freeScoreBand(34)).toBe("heavy_load");
    expect(freeScoreBand(0)).toBe("heavy_load");
  });
});
