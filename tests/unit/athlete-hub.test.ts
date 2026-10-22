import { describe, it, expect } from "vitest";
import { checkinStreak, summarize } from "@/components/athlete/stats";

const NOW = new Date("2026-10-22T12:00:00Z");
const daysAgo = (n: number) =>
  new Date(NOW.getTime() - n * 86400000).toISOString();

describe("checkinStreak", () => {
  it("counts consecutive days ending today", () => {
    expect(
      checkinStreak([daysAgo(0), daysAgo(1), daysAgo(2), daysAgo(4)], NOW),
    ).toBe(3);
  });
  it("is not broken before today's check-in", () => {
    expect(checkinStreak([daysAgo(1), daysAgo(2)], NOW)).toBe(2);
  });
  it("is zero after a missed day", () => {
    expect(checkinStreak([daysAgo(2), daysAgo(3)], NOW)).toBe(0);
  });
});

describe("progress report", () => {
  const ci = (n: number, score: number, sleep = 8, stress = 3) => ({
    id: String(n),
    user_id: "u",
    mood: 7,
    sleep,
    stress,
    energy: 7,
    cognitive_load: 4,
    score,
    note: null,
    created_at: daysAgo(n),
  });
  const s = summarize(
    {
      checkins: [ci(1, 80), ci(2, 70), ci(3, 60), ci(40, 50), ci(41, 50)],
      completions: [
        {
          id: "a",
          protocol_id: "p",
          completed_at: daysAgo(5),
          duration_minutes: 6,
          rating: 4,
        },
        {
          id: "b",
          protocol_id: "p",
          completed_at: daysAgo(45),
          duration_minutes: 20,
          rating: null,
        },
      ],
      goals: [
        {
          id: "g1",
          title: "x",
          kind: "process",
          target_date: null,
          progress: 100,
          status: "done",
          created_at: daysAgo(3),
        },
        {
          id: "g2",
          title: "y",
          kind: "mental",
          target_date: null,
          progress: 20,
          status: "active",
          created_at: daysAgo(3),
        },
      ],
      competitions: [],
      journal: [],
    },
    NOW.getTime(),
  );

  it("averages the last 30 days and compares with the 30 before", () => {
    expect(s.checkins).toBe(3);
    expect(s.avg).toBe(70);
    expect(s.change).toBe(20);
  });
  it("counts only this window's protocol minutes", () => {
    expect(s.protocols).toBe(1);
    expect(s.minutes).toBe(6);
  });
  it("treats low stress as a strength", () => {
    // sleep 8 and stress 3 (inverted to 8) tie at the top; mental load 4 -> 7.
    expect(["sleep", "stress"]).toContain(s.best);
    expect(s.goalsDone).toBe(1);
  });
});
