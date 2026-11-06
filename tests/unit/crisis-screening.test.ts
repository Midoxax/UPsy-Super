/**
 * Crisis screening (supabase/functions/_shared/crisis-screening.ts).
 *
 * The edge function's Deno tests are not run in CI, so the keyword screen —
 * the only screen since the AI classifier was removed — is pinned here too.
 */
import { describe, it, expect } from "vitest";
import { keywordScreen } from "../../supabase/functions/_shared/crisis-screening";

describe("crisis screening", () => {
  it("flags explicit multilingual high-risk phrases", () => {
    expect(keywordScreen("I want to die tonight")).toBe("high");
    expect(keywordScreen("Je veux me suicider")).toBe("high");
    expect(keywordScreen("أنتحر")).toBe("high");
    expect(keywordScreen("bghit nmout")).toBe("high");
  });

  it("ignores case and diacritics", () => {
    expect(keywordScreen("JE SUIS DESESPERE")).toBe("moderate");
    expect(keywordScreen("انتحر")).toBe("high");
  });

  it("keeps ordinary distress low", () => {
    expect(keywordScreen("I am stressed about tomorrow's exam")).toBe("low");
  });
});
