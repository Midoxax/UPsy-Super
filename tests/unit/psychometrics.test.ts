/**
 * Scoring of the validated instruments against their manuals.
 * Each case is a hand-computed example of a rule the manual states.
 */
import { describe, it, expect } from "vitest";
import {
  INSTRUMENTS,
  INSTRUMENTS_BY_CODE,
} from "@/lib/psychometrics/instruments";
import { scoreInstrument, optionsFor } from "@/lib/psychometrics/score";
import type { Answers, Instrument } from "@/lib/psychometrics/types";

const all = (inst: Instrument, v: number): Answers =>
  Object.fromEntries(inst.items.map((i) => [i.id, v]));
const I = INSTRUMENTS_BY_CODE;

describe("instrument definitions", () => {
  it("have the published item counts and unique ids", () => {
    const counts = Object.fromEntries(
      INSTRUMENTS.map((i) => [i.code, i.items.length]),
    );
    expect(counts).toEqual({
      phq9: 9,
      gad7: 7,
      who5: 5,
      dass21: 21,
      pcl5: 20,
      audit: 10,
      k6: 6,
    });
    for (const inst of INSTRUMENTS)
      expect(new Set(inst.items.map((i) => i.id)).size).toBe(inst.items.length);
  });

  it("give every item an English and a French text, and every band range is contiguous", () => {
    for (const inst of INSTRUMENTS) {
      for (const item of inst.items) {
        expect(item.text.en.length).toBeGreaterThan(3);
        expect(item.text.fr?.length ?? 0).toBeGreaterThan(3);
      }
      const bandSets = [
        inst.total?.bands,
        ...(inst.subscales ?? []).map((s) => s.bands),
      ];
      for (const bands of bandSets) {
        if (!bands) continue;
        expect(bands[0].min).toBe(0);
        for (let k = 1; k < bands.length; k++)
          expect(bands[k].min).toBe(bands[k - 1].max + 1);
      }
    }
  });

  it("DASS-21 subscales partition the 21 items", () => {
    const items = I.dass21.subscales!.flatMap((s) => s.items);
    expect(new Set(items).size).toBe(21);
  });
});

describe("PHQ-9", () => {
  it("sums 0–27 and uses the 5/10/15/20 cut-points", () => {
    const r = scoreInstrument(I.phq9, {
      ...all(I.phq9, 1),
      phq9_9: 0,
      phq9_1: 2,
    });
    expect(r.total!.score).toBe(9);
    expect(r.total!.band!.label.en).toBe("Mild");
    expect(scoreInstrument(I.phq9, all(I.phq9, 3)).total!.band!.label.en).toBe(
      "Severe",
    );
    const ten = scoreInstrument(I.phq9, {
      ...all(I.phq9, 1),
      phq9_1: 2,
      phq9_9: 0,
      phq9_2: 2,
    });
    expect(ten.total!.score).toBe(10);
    expect(ten.total!.band!.label.en).toBe("Moderate");
  });

  it("flags item 9 as a crisis whatever the total, even mid-form", () => {
    const r = scoreInstrument(I.phq9, { phq9_9: 1 });
    expect(r.complete).toBe(false);
    expect(r.flags.map((f) => f.severity)).toEqual(["crisis"]);
    expect(r.level).toBe("high");
  });

  it("refuses to band an incomplete form", () => {
    const r = scoreInstrument(I.phq9, { phq9_1: 3 });
    expect(r.complete).toBe(false);
    expect(r.missing).toHaveLength(8);
    expect(r.total!.band).toBeNull();
  });

  it("rejects answers that are not one of the item's options", () => {
    const r = scoreInstrument(I.phq9, { ...all(I.phq9, 0), phq9_1: 7 });
    expect(r.complete).toBe(false);
    expect(r.missing).toEqual(["phq9_1"]);
  });
});

describe("GAD-7", () => {
  it("bands 0–21 at 5/10/15", () => {
    expect(scoreInstrument(I.gad7, all(I.gad7, 0)).total!.band!.label.en).toBe(
      "Minimal",
    );
    const r = scoreInstrument(I.gad7, { ...all(I.gad7, 2), gad7_7: 1 }); // 13
    expect(r.total!.score).toBe(13);
    expect(r.total!.band!.label.en).toBe("Moderate");
  });
});

describe("WHO-5", () => {
  it("scores 'all of the time' as 5 and multiplies the raw score by 4", () => {
    const top = optionsFor(I.who5, I.who5.items[0])[0];
    expect(top.value).toBe(5);
    const r = scoreInstrument(I.who5, all(I.who5, 3)); // raw 15 → 60
    expect(r.total!.raw).toBe(15);
    expect(r.total!.score).toBe(60);
    expect(r.total!.max).toBe(100);
    expect(r.level).toBe("low");
  });

  it("reads ≤ 28 as very low and 29–50 as low well-being", () => {
    expect(scoreInstrument(I.who5, all(I.who5, 1)).total!.score).toBe(20);
    expect(scoreInstrument(I.who5, all(I.who5, 1)).level).toBe("high");
    expect(scoreInstrument(I.who5, all(I.who5, 2)).level).toBe("moderate"); // 40
  });
});

describe("DASS-21", () => {
  it("doubles each subscale and applies the manual's bands", () => {
    // Depression items all 2 → raw 14, ×2 = 28 → extremely severe.
    const a = all(I.dass21, 0);
    for (const id of I.dass21.subscales![0].items) a[id] = 2;
    const r = scoreInstrument(I.dass21, a);
    expect(r.subscales.depression.raw).toBe(14);
    expect(r.subscales.depression.score).toBe(28);
    expect(r.subscales.depression.band!.label.en).toBe("Extremely severe");
    expect(r.subscales.anxiety.band!.label.en).toBe("Normal range");
    expect(r.total).toBeNull();
  });

  it("puts anxiety 8 in mild and stress 18 in mild", () => {
    const a = all(I.dass21, 0);
    a.dass21_2 = 3;
    a.dass21_4 = 1; // anxiety raw 4 → 8
    a.dass21_1 = 3;
    a.dass21_6 = 3;
    a.dass21_8 = 3; // stress raw 9 → 18
    const r = scoreInstrument(I.dass21, a);
    expect(r.subscales.anxiety.score).toBe(8);
    expect(r.subscales.anxiety.band!.label.en).toBe("Mild");
    expect(r.subscales.stress.score).toBe(18);
    expect(r.subscales.stress.band!.label.en).toBe("Mild");
  });
});

describe("PCL-5", () => {
  it("sums 0–80 with the 31 screening threshold and the four DSM-5 clusters", () => {
    expect(scoreInstrument(I.pcl5, all(I.pcl5, 1)).total!.score).toBe(20);
    expect(scoreInstrument(I.pcl5, all(I.pcl5, 1)).level).toBe("low");
    const r = scoreInstrument(I.pcl5, {
      ...all(I.pcl5, 1),
      pcl5_1: 4,
      pcl5_2: 4,
      pcl5_3: 4,
      pcl5_4: 4,
    }); // 32
    expect(r.total!.score).toBe(32);
    expect(r.level).toBe("high");
    expect(r.subscales.intrusion.raw).toBe(17);
    expect(r.subscales.avoidance.max).toBe(8);
  });
});

describe("AUDIT", () => {
  it("skips Q2–8 for a non-drinker but still asks Q9–10", () => {
    const r = scoreInstrument(I.audit, { audit_1: 0, audit_9: 2, audit_10: 0 });
    expect(r.complete).toBe(true);
    expect(r.total!.score).toBe(2);
    expect(r.total!.band!.label.en).toMatch(/Zone I/);
  });

  it("skips Q4–8 when Q2 and Q3 are both 0", () => {
    const r = scoreInstrument(I.audit, {
      audit_1: 1,
      audit_2: 0,
      audit_3: 0,
      audit_9: 0,
      audit_10: 0,
    });
    expect(r.complete).toBe(true);
    expect(r.total!.score).toBe(1);
  });

  it("scores Q9–10 as 0/2/4 and reaches zone IV at 20", () => {
    const a = { ...all(I.audit, 2), audit_9: 4, audit_10: 0 }; // 8×2 + 4 = 20
    const r = scoreInstrument(I.audit, a);
    expect(r.total!.score).toBe(20);
    expect(r.total!.band!.label.en).toMatch(/Zone IV/);
    expect(scoreInstrument(I.audit, { ...a, audit_10: 1 }).complete).toBe(
      false,
    );
  });
});

describe("K6", () => {
  it("scores 'all of the time' 4 and uses ≥ 13 for serious distress", () => {
    expect(optionsFor(I.k6, I.k6.items[0])[0].value).toBe(4);
    expect(scoreInstrument(I.k6, all(I.k6, 2)).total!.score).toBe(12);
    expect(scoreInstrument(I.k6, all(I.k6, 2)).level).toBe("moderate");
    expect(scoreInstrument(I.k6, { ...all(I.k6, 2), k6_1: 3 }).level).toBe(
      "high",
    );
  });
});
