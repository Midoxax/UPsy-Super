/**
 * Crisis screening risk decision (supabase/functions/_shared/crisis-screening.ts).
 *
 * The edge function's Deno tests are not run in CI, so the decision that
 * matters most clinically is pinned here as well: an unavailable AI
 * classifier must never turn into a "low risk" answer, and a keyword hit
 * must never be downgraded.
 */
import { describe, it, expect } from "vitest";
import {
  keywordScreen,
  mergeRisk,
  resolveRisk,
} from "../../supabase/functions/_shared/crisis-screening";

describe("crisis screening", () => {
  it("flags explicit multilingual high-risk phrases", () => {
    expect(keywordScreen("I want to die tonight")).toBe("high");
    expect(keywordScreen("Je veux me suicider")).toBe("high");
    expect(keywordScreen("أنتحر")).toBe("high");
  });

  it("never downgrades keyword severity when blending", () => {
    expect(mergeRisk("low", "high")).toBe("high");
    expect(mergeRisk("low", "moderate")).toBe("moderate");
    expect(mergeRisk("high", "low")).toBe("high");
  });

  it("reports unavailable, not low, when the classifier is down", () => {
    expect(resolveRisk(null, "low")).toBe("unavailable");
  });

  it("keeps a keyword hit when the classifier is down", () => {
    expect(resolveRisk(null, "moderate")).toBe("moderate");
    expect(resolveRisk(null, "high")).toBe("high");
  });

  it("blends normally when the classifier answers", () => {
    expect(resolveRisk("low", "low")).toBe("low");
    expect(resolveRisk("moderate", "low")).toBe("moderate");
    expect(resolveRisk("low", "moderate")).toBe("moderate");
  });
});
