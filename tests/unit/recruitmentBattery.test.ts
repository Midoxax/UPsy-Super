import { describe, expect, it } from "vitest";
import {
  ATTENTION,
  IPIP,
  scoreTraits,
  validity,
} from "@/lib/recruitment/battery";

const all = (v: number) =>
  Object.fromEntries(IPIP.map((i) => [i.id, v])) as Record<string, number>;

describe("recruitment battery scoring", () => {
  it("reverse-keys items: agreeing with every item is not a high score everywhere", () => {
    const t = scoreTraits(all(5));
    // Honesty-humility: all four items are reversed, so 5 everywhere = 1.
    expect(t.H.mean).toBe(1);
    // Extraversion: two positive, two reversed = 3.
    expect(t.E.mean).toBe(3);
  });

  it("a consistent, attentive profile passes validity", () => {
    const a: Record<string, number> = {};
    for (const i of IPIP) a[i.id] = i.reverse ? 2 : 4;
    for (const x of ATTENTION) a[x.id] = 4;
    const v = validity(a, "2026-11-23T10:00:00Z", "2026-11-23T10:25:00Z");
    expect(v.attentionFailed).toBe(0);
    expect(v.inconsistency).toBe(0);
    expect(v.caution).toBe(false);
  });

  it("flags straight-lining, failed checks and a rushed completion", () => {
    const v = validity(all(5), "2026-11-23T10:00:00Z", "2026-11-23T10:03:00Z");
    expect(v.straightLining).toBe(true);
    expect(v.attentionFailed).toBe(3);
    expect(v.tooFast).toBe(true);
    expect(v.inconsistency).toBeGreaterThanOrEqual(2);
    expect(v.caution).toBe(true);
  });
});
