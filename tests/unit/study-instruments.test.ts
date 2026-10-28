import { describe, expect, it } from "vitest";
import {
  INSTRUMENTS,
  dueInstruments,
  nextPeriodStart,
  periodStart,
  safetyFlag,
  score,
} from "@/lib/study/instruments";

describe("study instruments", () => {
  it("every item is translated and option counts match the scale", () => {
    for (const ins of INSTRUMENTS) {
      if (ins.kind !== "likert") continue;
      for (const t of [...ins.items, ...ins.options, ins.stem, ins.title])
        for (const l of ["en", "fr", "ar"] as const)
          expect(t[l].trim(), `${ins.id} ${l}`).not.toBe("");
    }
    // Same counts as the study_responses check constraint.
    const counts = Object.fromEntries(
      INSTRUMENTS.map((i) => [i.id, i.kind === "likert" ? i.items.length : 3]),
    );
    expect(counts).toEqual({ who5: 5, pss10: 10, abq: 15, mti: 8, sleep: 3 });
  });

  it("scores WHO-5 as a percentage", () => {
    expect(score("who5", [5, 5, 5, 5, 5]).score).toBe(100);
    expect(score("who5", [1, 1, 2, 1, 2])).toEqual({
      score: 28,
      subscores: { raw: 7 },
    });
  });

  it("reverses PSS-10 items 4, 5, 7 and 8", () => {
    // All answered 4: reversed items count 0, the six others count 4.
    expect(score("pss10", Array(10).fill(4)).score).toBe(24);
    expect(score("pss10", [0, 0, 0, 4, 4, 0, 4, 4, 0, 0]).score).toBe(0);
  });

  it("scores ABQ subscales with items 1 and 14 reversed", () => {
    const s = score("abq", [5, 3, 1, 3, 1, 1, 1, 3, 1, 3, 1, 3, 1, 5, 1]);
    expect(s.subscores).toEqual({
      exhaustion: 3,
      reduced_accomplishment: 1,
      devaluation: 1,
    });
    expect(s.score).toBe(1.67);
  });

  it("scores sleep as the quality item, keeping hours", () => {
    expect(score("sleep", [7.5, 6, 2])).toEqual({
      score: 6,
      subscores: { hours: 7.5, trouble_nights: 2 },
    });
  });

  it("counts windows from the enrolment day", () => {
    const t0 = "2026-10-01T15:00:00Z";
    expect(periodStart(t0, 7, new Date("2026-10-07T23:00:00Z"))).toBe(
      "2026-10-01",
    );
    expect(periodStart(t0, 7, new Date("2026-10-08T01:00:00Z"))).toBe(
      "2026-10-08",
    );
    expect(nextPeriodStart(t0, 28, new Date("2026-10-08T01:00:00Z"))).toBe(
      "2026-10-29",
    );
  });

  it("everything is due at baseline, then only what has a new window", () => {
    const t0 = "2026-10-01T09:00:00Z";
    const day0 = new Date("2026-10-01T10:00:00Z");
    expect(dueInstruments(t0, [], day0)).toHaveLength(5);
    const baseline = INSTRUMENTS.map((i) => ({
      instrument: i.id,
      period_start: "2026-10-01",
    }));
    expect(dueInstruments(t0, baseline, day0)).toEqual([]);
    expect(dueInstruments(t0, baseline, new Date("2026-10-08"))).toEqual([
      "sleep",
    ]);
    expect(dueInstruments(t0, baseline, new Date("2026-10-15"))).toEqual([
      "sleep",
      "who5",
    ]);
  });

  it("flags low well-being and high stress", () => {
    expect(safetyFlag("who5", score("who5", [1, 1, 2, 1, 2]))).toBe("urgent");
    expect(safetyFlag("who5", score("who5", [2, 2, 2, 3, 3]))).toBe("notice");
    expect(safetyFlag("who5", score("who5", [4, 4, 4, 4, 4]))).toBeNull();
    expect(safetyFlag("pss10", { score: 27, subscores: {} })).toBe("notice");
    expect(safetyFlag("mti", { score: 8, subscores: {} })).toBeNull();
  });
});
