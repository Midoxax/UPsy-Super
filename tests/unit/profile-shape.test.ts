import { describe, expect, it } from "vitest";
import {
  PILLAR_ANGLE,
  PROFILE_FLOOR,
  PROFILE_PILLARS,
  axisLength,
  profilePath,
  profileRadius,
  type ProfileScores,
} from "@/lib/profile/profileShape";

const even = (n: number): ProfileScores => ({
  focus: n,
  regulation: n,
  recovery: n,
  meaning: n,
});

describe("profileShape", () => {
  it("maps scores onto the floor..1 range and survives bad input", () => {
    expect(axisLength(0)).toBeCloseTo(PROFILE_FLOOR);
    expect(axisLength(100)).toBeCloseTo(1);
    expect(axisLength(-20)).toBeCloseTo(PROFILE_FLOOR);
    expect(axisLength(250)).toBeCloseTo(1);
    expect(axisLength(Number.NaN)).toBeCloseTo(PROFILE_FLOOR);
  });

  it("draws equal scores as a circle", () => {
    for (let i = 0; i < 360; i += 7) {
      const theta = (i / 180) * Math.PI;
      expect(profileRadius(even(60), theta)).toBeCloseTo(axisLength(60), 10);
    }
  });

  it("passes exactly through each pillar's own axis length", () => {
    const scores: ProfileScores = {
      focus: 90,
      regulation: 20,
      recovery: 55,
      meaning: 0,
    };
    for (const p of PROFILE_PILLARS) {
      expect(profileRadius(scores, PILLAR_ANGLE[p])).toBeCloseTo(
        axisLength(scores[p]),
        10,
      );
    }
  });

  it("never collapses: the lowest profile still has a whole outline", () => {
    for (let i = 0; i < 360; i += 5) {
      const r = profileRadius(even(0), (i / 180) * Math.PI);
      expect(r).toBeGreaterThanOrEqual(PROFILE_FLOOR - 1e-9);
    }
  });

  it("stays between the lowest and highest axis everywhere", () => {
    const scores: ProfileScores = {
      focus: 100,
      regulation: 10,
      recovery: 70,
      meaning: 40,
    };
    for (let i = 0; i < 360; i += 3) {
      const r = profileRadius(scores, (i / 180) * Math.PI);
      expect(r).toBeGreaterThanOrEqual(axisLength(10) - 1e-9);
      expect(r).toBeLessThanOrEqual(axisLength(100) + 1e-9);
    }
  });

  it("builds a closed SVG path with the focus axis pointing up", () => {
    const d = profilePath(
      { focus: 100, regulation: 0, recovery: 0, meaning: 0 },
      100,
      100,
      80,
      4,
    );
    expect(d.startsWith("M")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    // steps=4 samples right, top, left, bottom in that order.
    const pts = [...d.matchAll(/[ML]([\d.-]+) ([\d.-]+)/g)].map((m) => [
      Number(m[1]),
      Number(m[2]),
    ]);
    expect(pts).toHaveLength(4);
    expect(pts[1][1]).toBeCloseTo(100 - 80, 1); // top = full radius, y up
    expect(pts[0][0]).toBeCloseTo(100 + 80 * PROFILE_FLOOR, 1);
  });
});
