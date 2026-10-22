// Pure Athlete Hub calculations, kept free of React and Supabase so they
// can be unit-tested directly.
import type {
  Checkin,
  Competition,
  Completion,
  Goal,
  JournalEntry,
} from "@/hooks/useAthleteHub";

export type StatsInput = {
  checkins: Checkin[];
  completions: Completion[];
  goals: Goal[];
  competitions: Competition[];
  journal: JournalEntry[];
};

// Local calendar day: a 00:30 check-in in Casablanca counts for that day.
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/** Consecutive days with a check-in, ending today (or yesterday, so the
 *  streak isn't shown as broken before today's check-in). */
export function checkinStreak(dates: string[], now = new Date()): number {
  const days = new Set(dates.map((d) => dayKey(new Date(d))));
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(cursor))) {
    n++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}

export const DAY = 86400000;
const FACTORS = [
  "mood",
  "sleep",
  "stress",
  "energy",
  "cognitive_load",
] as const;
// Stress and mental load count against readiness; flip them so "higher is
// better" holds for every factor when picking the strongest and weakest.
const good = (k: (typeof FACTORS)[number], v: number) =>
  k === "stress" || k === "cognitive_load" ? 11 - v : v;

export function summarize(p: StatsInput, now = Date.now()) {
  const inWindow = (iso: string, from: number, to: number) => {
    const t = new Date(iso).getTime();
    return t > now - from * DAY && t <= now - to * DAY;
  };
  const cur = p.checkins.filter((c) => inWindow(c.created_at, 30, 0));
  const prev = p.checkins.filter((c) => inWindow(c.created_at, 60, 30));
  const avg = (xs: number[]) =>
    xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null;
  const avgCur = avg(cur.map((c) => c.score));
  const avgPrev = avg(prev.map((c) => c.score));
  const factors = FACTORS.map((k) => ({
    k,
    v: cur.length ? cur.reduce((s, c) => s + good(k, c[k]), 0) / cur.length : 0,
  })).sort((a, b) => b.v - a.v);
  const done = p.completions.filter((c) => inWindow(c.completed_at, 30, 0));
  return {
    checkins: cur.length,
    avg: avgCur,
    change: avgCur != null && avgPrev != null ? avgCur - avgPrev : null,
    protocols: done.length,
    minutes: done.reduce((s, c) => s + (c.duration_minutes ?? 0), 0),
    goalsDone: p.goals.filter((g) => g.status === "done").length,
    goalsActive: p.goals.filter((g) => g.status === "active").length,
    comps: p.competitions.filter((c) =>
      inWindow(c.event_date + "T12:00:00", 30, 0),
    ).length,
    journal: p.journal.filter((j) => inWindow(j.created_at, 30, 0)).length,
    best: cur.length >= 3 ? factors[0].k : null,
    weak: cur.length >= 3 ? factors[factors.length - 1].k : null,
  };
}
