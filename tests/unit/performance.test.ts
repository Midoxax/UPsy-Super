import { describe, expect, it } from "vitest";
import {
  acwrZone,
  anxietyRead,
  baseline,
  dailyLoads,
  daysToNext,
  isoDay,
  loadMetrics,
  pitWall,
  profileGaps,
  profileProgress,
  sortedRoutine,
  weeklySeries,
  zoneCheck,
  type SessionRow,
} from "@/lib/performance/metrics";

const NOW = new Date(2026, 10, 28, 9, 0); // 28 Nov 2026, 09:00 local
const ago = (d: number) => {
  const x = new Date(NOW);
  x.setDate(x.getDate() - d);
  return x;
};
const day = (d: number) => isoDay(ago(d));
/** One session a day for `days` days, `load` each (60 min x rpe). */
const steady = (days: number, rpe: number, from = 0): SessionRow[] =>
  Array.from({ length: days }, (_, i) => ({
    session_date: day(from + i),
    duration_minutes: 60,
    rpe,
  }));

describe("session load", () => {
  it("sums duration x RPE per day, zero-filled, oldest first", () => {
    const d = dailyLoads(
      [
        { session_date: day(0), duration_minutes: 90, rpe: 7 },
        { session_date: day(0), duration_minutes: 30, rpe: 3 },
        { session_date: day(2), duration_minutes: 60, rpe: 5 },
      ],
      3,
      NOW,
    );
    expect(d).toEqual([
      { date: day(2), load: 300 },
      { date: day(1), load: 0 },
      { date: day(0), load: 720 },
    ]);
  });

  it("has no chronic load or ACWR before three weeks of history", () => {
    const m = loadMetrics(steady(14, 5), NOW);
    expect(m.acute).toBe(7 * 300);
    expect(m.chronic).toBeNull();
    expect(m.acwr).toBeNull();
    expect(m.zone).toBeNull();
  });

  it("reads a steady month as optimal", () => {
    const m = loadMetrics(steady(28, 5), NOW);
    expect(m.acute).toBe(2100);
    expect(m.chronic).toBe(2100);
    expect(m.acwr).toBe(1);
    expect(m.zone).toBe("optimal");
  });

  it("flags a spike when the last week doubles", () => {
    const m = loadMetrics([...steady(7, 10), ...steady(21, 3, 7)], NOW);
    // acute 4200; chronic (4200 + 21 x 180) / 4 = 1995
    expect(m.acute).toBe(4200);
    expect(m.chronic).toBe(1995);
    expect(m.acwr).toBeCloseTo(2.11, 2);
    expect(m.zone).toBe("spike");
  });

  it("computes monotony and strain (Foster 1998)", () => {
    const sessions = [
      { session_date: day(0), duration_minutes: 60, rpe: 6 },
      { session_date: day(1), duration_minutes: 60, rpe: 6 },
      { session_date: day(3), duration_minutes: 60, rpe: 6 },
    ];
    const m = loadMetrics(sessions, NOW);
    // daily: 360,360,0,360,0,0,0 -> mean 154.29, sd 192.35
    expect(m.monotony).toBeCloseTo(0.8, 1);
    expect(m.strain).toBe(Math.round(1080 * m.monotony!));
    expect(loadMetrics(steady(7, 5), NOW).monotony).toBeNull(); // no variation
  });

  it("zones the ratio", () => {
    expect(acwrZone(0.7)).toBe("low");
    expect(acwrZone(1.3)).toBe("optimal");
    expect(acwrZone(1.4)).toBe("caution");
    expect(acwrZone(1.6)).toBe("spike");
    expect(acwrZone(null)).toBeNull();
  });

  it("builds a weekly series", () => {
    const w = weeklySeries(steady(35, 5), 4, NOW);
    expect(w).toHaveLength(4);
    expect(w[3]).toEqual({ week: day(0), load: 2100, acwr: 1 });
  });
});

describe("baselines", () => {
  const series = (vals: number[], today?: number) => [
    ...(today == null ? [] : [{ at: NOW.toISOString(), value: today }]),
    ...vals.map((v, i) => ({ at: ago(i + 1).toISOString(), value: v })),
  ];

  it("needs seven earlier readings", () => {
    expect(baseline(series([70, 72, 71], 40), NOW).status).toBeNull();
  });

  it("flags today below the athlete's own range", () => {
    const b = baseline(series([70, 72, 68, 71, 69, 70, 73, 67], 55), NOW);
    expect(b.n).toBe(8);
    expect(b.status).toBe("below");
    expect(
      baseline(series([70, 72, 68, 71, 69, 70, 73, 67], 70), NOW).status,
    ).toBe("normal");
  });

  it("ignores readings older than 28 days and missing values", () => {
    const pts = [
      { at: NOW.toISOString(), value: 60 },
      { at: ago(40).toISOString(), value: 10 },
      { at: ago(2).toISOString(), value: null },
    ];
    const b = baseline(pts, NOW);
    expect(b.n).toBe(0);
    expect(b.today).toBe(60);
  });
});

describe("pit wall", () => {
  const checkin = (d: number, score: number, extra = {}) => ({
    created_at: ago(d).toISOString(),
    score,
    ...extra,
  });

  it("is all off for a new athlete, asking for a check-in", () => {
    const p = pitWall({
      checkins: [],
      sessions: [],
      competitions: [],
      now: NOW,
    });
    expect(p.lights).toEqual({
      readiness: "off",
      load: "off",
      recovery: "off",
    });
    expect(p.alerts.map((a) => a.key)).toEqual(["noCheckin"]);
  });

  it("goes red on a load spike and sorts red first", () => {
    const p = pitWall({
      checkins: [
        checkin(0, 80, { sleep_hours: 5 }),
        checkin(1, 78, { sleep_hours: 5.5 }),
      ],
      sessions: [...steady(7, 10), ...steady(21, 3, 7)],
      competitions: [{ event_date: day(-2) }],
      now: NOW,
    });
    expect(p.lights.load).toBe("red");
    expect(p.lights.readiness).toBe("green");
    expect(p.lights.recovery).toBe("amber");
    expect(p.alerts[0]).toMatchObject({ key: "loadSpike", level: "red" });
    expect(p.alerts.map((a) => a.key)).toEqual(
      expect.arrayContaining(["sleepDebt", "raceSoon"]),
    );
    expect(p.nextRaceDays).toBe(2);
  });

  it("reads readiness amber when below the athlete's baseline", () => {
    const history = [70, 72, 68, 71, 69, 70, 73, 67].map((s, i) =>
      checkin(i + 1, s),
    );
    const p = pitWall({
      checkins: [checkin(0, 72 - 12), ...history],
      sessions: [],
      competitions: [],
      now: NOW,
    });
    expect(p.lights.readiness).toBe("amber");
    expect(p.alerts.map((a) => a.key)).toContain("readinessDrop");
  });
});

describe("profile and race day", () => {
  it("ranks qualities by discrepancy", () => {
    const g = profileGaps([
      { label: "Focus", area: "mental", current: 5, ideal: 9 },
      { label: "Speed", area: "physical", current: 8, ideal: 9 },
      { label: "Serve", area: "technical", current: 4, ideal: 8 },
    ]);
    expect(g.map((q) => [q.label, q.gap])).toEqual([
      ["Serve", 4],
      ["Focus", 4],
      ["Speed", 1],
    ]);
  });

  it("tracks progress between snapshots by label", () => {
    expect(
      profileProgress(
        [{ label: "Focus", area: "mental", current: 7, ideal: 9 }],
        [{ label: "focus", area: "mental", current: 5, ideal: 9 }],
      ),
    ).toEqual([{ label: "Focus", delta: 2 }]);
  });

  it("checks activation against the IZOF and reads direction", () => {
    const plan = { zone_low: 5, zone_high: 7 };
    expect(zoneCheck(plan, { activation: 4 })).toBe("below");
    expect(zoneCheck(plan, { activation: 6 })).toBe("in");
    expect(zoneCheck(plan, { activation: 9 })).toBe("above");
    expect(zoneCheck({}, { activation: 6 })).toBeNull();
    expect(anxietyRead({ direction: 2 })).toBe("facilitative");
    expect(anxietyRead({ direction: -1 })).toBe("debilitative");
    expect(anxietyRead({})).toBeNull();
  });

  it("orders the routine from the earliest step", () => {
    expect(
      sortedRoutine({
        routine: [
          { at: 10, label: "Cue words" },
          { at: 90, label: "Arrive" },
          { at: 45, label: "Warm-up" },
        ],
      }).map((r) => r.label),
    ).toEqual(["Arrive", "Warm-up", "Cue words"]);
  });

  it("counts days to the next competition", () => {
    expect(
      daysToNext([{ event_date: day(3) }, { event_date: day(-5) }], NOW),
    ).toBe(5);
    expect(daysToNext([{ event_date: day(0) }], NOW)).toBe(0);
    expect(daysToNext([], NOW)).toBeNull();
  });
});
