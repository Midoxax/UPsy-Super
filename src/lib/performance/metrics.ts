// Performance Center calculations, free of React and Supabase so they can be
// unit-tested. The methods follow the sport-science literature; what they
// cannot say is stated in the copy (a load spike is a flag to discuss, not an
// injury prediction).
//
//  * Session load: duration x session RPE (CR-10), Foster et al. (2001).
//  * Acute load: the last 7 days; chronic load: the weekly average of the
//    last 28 days; their ratio (ACWR) flags sudden changes. Its predictive
//    value is debated (Impellizzeri et al., 2020): it is shown as a trend.
//  * Monotony: mean / SD of daily load over 7 days; strain: weekly load x
//    monotony (Foster, 1998).
//  * Baselines: a value is flagged when it falls more than one SD below the
//    athlete's own 28-day mean, the usual "smallest worthwhile change" logic
//    applied to readiness and HRV (Plews et al., 2013).
//  * Performance profiling: discrepancy = ideal - current (Butler & Hardy,
//    1992).

export const DAY = 86_400_000;

export type SessionRow = {
  session_date: string; // YYYY-MM-DD
  duration_minutes: number;
  rpe: number;
  load?: number | null;
  kind?: string;
};

export type CheckinRow = {
  created_at: string;
  score: number;
  sleep_hours?: number | null;
  soreness?: number | null;
  hrv_ms?: number | null;
  resting_hr?: number | null;
};

/** Local calendar day as YYYY-MM-DD. */
export function isoDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const loadOf = (s: SessionRow) => s.load ?? s.duration_minutes * s.rpe;

const mean = (xs: number[]) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
const sd = (xs: number[]) => {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
};
const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

/** Total load per day for the last `days` days, oldest first, zero-filled. */
export function dailyLoads(
  sessions: SessionRow[],
  days: number,
  now = new Date(),
): { date: string; load: number }[] {
  const byDay = new Map<string, number>();
  for (const s of sessions)
    byDay.set(s.session_date, (byDay.get(s.session_date) ?? 0) + loadOf(s));
  const out: { date: string; load: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = isoDay(d);
    out.push({ date: key, load: byDay.get(key) ?? 0 });
  }
  return out;
}

export type LoadZone = "low" | "optimal" | "caution" | "spike";

export function acwrZone(r: number | null): LoadZone | null {
  if (r == null) return null;
  if (r < 0.8) return "low";
  if (r <= 1.3) return "optimal";
  if (r <= 1.5) return "caution";
  return "spike";
}

export type LoadMetrics = {
  acute: number; // 7-day total
  chronic: number | null; // 28-day weekly average; null without 3 weeks of history
  acwr: number | null;
  zone: LoadZone | null;
  monotony: number | null;
  strain: number | null;
  sessions7: number;
};

export function loadMetrics(
  sessions: SessionRow[],
  now = new Date(),
): LoadMetrics {
  const days28 = dailyLoads(sessions, 28, now);
  const last7 = days28.slice(-7).map((d) => d.load);
  const acute = last7.reduce((a, b) => a + b, 0);
  // Chronic load needs history: the first logged day must be 21+ days ago.
  const first = sessions.reduce<string | null>(
    (m, s) => (m == null || s.session_date < m ? s.session_date : m),
    null,
  );
  const since = first
    ? (new Date(`${isoDay(now)}T12:00:00`).getTime() -
        new Date(`${first}T12:00:00`).getTime()) /
      DAY
    : 0;
  const total28 = days28.reduce((a, d) => a + d.load, 0);
  const chronic = since >= 21 ? total28 / 4 : null;
  const acwr = chronic && chronic > 0 ? round(acute / chronic) : null;
  const s = sd(last7);
  const monotony = acute > 0 && s > 0 ? round(mean(last7) / s) : null;
  const sevenAgo = isoDay(new Date(now.getTime() - 6 * DAY));
  return {
    acute,
    chronic: chronic == null ? null : Math.round(chronic),
    acwr,
    zone: acwrZone(acwr),
    monotony,
    strain: monotony == null ? null : Math.round(acute * monotony),
    sessions7: sessions.filter((x) => x.session_date >= sevenAgo).length,
  };
}

/** Weekly load totals for the last `weeks` weeks (oldest first), each with
 *  the rolling ACWR at the end of that week, for the telemetry chart. */
export function weeklySeries(
  sessions: SessionRow[],
  weeks: number,
  now = new Date(),
): { week: string; load: number; acwr: number | null }[] {
  const out: { week: string; load: number; acwr: number | null }[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const end = new Date(now);
    end.setDate(end.getDate() - 7 * w);
    const m = loadMetrics(
      sessions.filter((s) => s.session_date <= isoDay(end)),
      end,
    );
    out.push({ week: isoDay(end), load: m.acute, acwr: m.acwr });
  }
  return out;
}

export type Baseline = {
  mean: number;
  sd: number;
  n: number;
  today: number | null;
  /** Today relative to the athlete's own normal range. */
  status: "below" | "normal" | "above" | null;
};

/** Today's value against the 28 days before it (needs 7 earlier readings). */
export function baseline(
  points: { at: string; value: number | null | undefined }[],
  now = new Date(),
): Baseline {
  const today = isoDay(now);
  const from = now.getTime() - 28 * DAY;
  const prior: number[] = [];
  let latestToday: number | null = null;
  for (const p of points) {
    if (p.value == null) continue;
    const day = isoDay(new Date(p.at));
    if (day === today) {
      latestToday ??= p.value; // rows arrive newest first
    } else if (new Date(p.at).getTime() >= from) prior.push(p.value);
  }
  const m = mean(prior);
  const s = sd(prior);
  const status =
    latestToday == null || prior.length < 7
      ? null
      : latestToday < m - s
        ? "below"
        : latestToday > m + s
          ? "above"
          : "normal";
  return {
    mean: Math.round(m * 10) / 10,
    sd: Math.round(s * 10) / 10,
    n: prior.length,
    today: latestToday,
    status,
  };
}

export type Light = "green" | "amber" | "red" | "off";

/** Light colours stay inline: they are this page's own, not the theme's. */
export const LIGHT: Record<Light, string> = {
  green: "#22c55e",
  amber: "#f5a524",
  red: "#ef4444",
  off: "#6b7280",
};

export type Alert = {
  key:
    | "loadSpike"
    | "loadLow"
    | "monotony"
    | "readinessDrop"
    | "hrvDrop"
    | "sleepDebt"
    | "soreness"
    | "raceSoon"
    | "noCheckin";
  level: "red" | "amber" | "info";
  value?: number;
};

export type PitWall = {
  lights: { readiness: Light; load: Light; recovery: Light };
  alerts: Alert[];
  load: LoadMetrics;
  readiness: Baseline;
  hrv: Baseline;
  nextRaceDays: number | null;
};

/** Everything the pit wall shows, from the raw rows. */
export function pitWall(input: {
  checkins: CheckinRow[]; // newest first
  sessions: SessionRow[];
  competitions: { event_date: string }[];
  now?: Date;
}): PitWall {
  const now = input.now ?? new Date();
  const load = loadMetrics(input.sessions, now);
  const readiness = baseline(
    input.checkins.map((c) => ({ at: c.created_at, value: c.score })),
    now,
  );
  const hrv = baseline(
    input.checkins.map((c) => ({ at: c.created_at, value: c.hrv_ms })),
    now,
  );
  const alerts: Alert[] = [];

  if (load.zone === "spike")
    alerts.push({ key: "loadSpike", level: "red", value: load.acwr! });
  else if (load.zone === "caution")
    alerts.push({ key: "loadSpike", level: "amber", value: load.acwr! });
  else if (load.zone === "low")
    alerts.push({ key: "loadLow", level: "info", value: load.acwr! });
  if (load.monotony != null && load.monotony > 2)
    alerts.push({ key: "monotony", level: "amber", value: load.monotony });

  if (readiness.status === "below")
    alerts.push({
      key: "readinessDrop",
      level: "amber",
      value: readiness.today!,
    });
  if (hrv.status === "below")
    alerts.push({ key: "hrvDrop", level: "amber", value: hrv.today! });

  const recent = input.checkins.filter(
    (c) => new Date(c.created_at).getTime() > now.getTime() - 3 * DAY,
  );
  const shortNights = recent.filter(
    (c) => c.sleep_hours != null && c.sleep_hours < 6,
  ).length;
  if (shortNights >= 2)
    alerts.push({ key: "sleepDebt", level: "amber", value: shortNights });
  const todayRow = input.checkins.find(
    (c) => isoDay(new Date(c.created_at)) === isoDay(now),
  );
  if (todayRow?.soreness != null && todayRow.soreness >= 7)
    alerts.push({ key: "soreness", level: "amber", value: todayRow.soreness });
  if (!todayRow) alerts.push({ key: "noCheckin", level: "info" });

  const nextRaceDays = daysToNext(input.competitions, now);
  if (nextRaceDays != null && nextRaceDays <= 3)
    alerts.push({ key: "raceSoon", level: "info", value: nextRaceDays });

  const score = todayRow?.score ?? input.checkins[0]?.score ?? null;
  const readinessLight: Light =
    score == null
      ? "off"
      : score < 50
        ? "red"
        : score < 70 || readiness.status === "below"
          ? "amber"
          : "green";
  const loadLight: Light =
    load.zone == null
      ? "off"
      : load.zone === "spike"
        ? "red"
        : load.zone === "optimal"
          ? load.monotony != null && load.monotony > 2
            ? "amber"
            : "green"
          : "amber";
  const recoveryLight: Light = !todayRow
    ? "off"
    : (todayRow.soreness ?? 0) >= 8 || shortNights >= 3
      ? "red"
      : (todayRow.soreness ?? 0) >= 7 ||
          shortNights >= 2 ||
          hrv.status === "below"
        ? "amber"
        : "green";

  const order = { red: 0, amber: 1, info: 2 };
  alerts.sort((a, b) => order[a.level] - order[b.level]);
  return {
    lights: {
      readiness: readinessLight,
      load: loadLight,
      recovery: recoveryLight,
    },
    alerts,
    load,
    readiness,
    hrv,
    nextRaceDays,
  };
}

/** Whole days until the next competition today or later (0 = today). */
export function daysToNext(
  competitions: { event_date: string }[],
  now = new Date(),
): number | null {
  const today = isoDay(now);
  const next = competitions
    .map((c) => c.event_date)
    .filter((d) => d >= today)
    .sort()[0];
  if (!next) return null;
  return Math.round(
    (new Date(`${next}T12:00:00`).getTime() -
      new Date(`${today}T12:00:00`).getTime()) /
      DAY,
  );
}

// Performance profile ---------------------------------------------------------

export type Area = "mental" | "physical" | "technical" | "tactical";
export type Quality = {
  label: string;
  area: Area;
  current: number;
  ideal: number;
};

/** Qualities by discrepancy (ideal - current), largest first. */
export function profileGaps(qualities: Quality[]) {
  return qualities
    .map((q) => ({ ...q, gap: Math.max(0, q.ideal - q.current) }))
    .sort((a, b) => b.gap - a.gap || a.current - b.current);
}

/** Change in "current" for qualities present in both snapshots. */
export function profileProgress(latest: Quality[], previous: Quality[]) {
  const before = new Map(previous.map((q) => [q.label.toLowerCase(), q]));
  return latest
    .filter((q) => before.has(q.label.toLowerCase()))
    .map((q) => ({
      label: q.label,
      delta: q.current - before.get(q.label.toLowerCase())!.current,
    }));
}

/** Protocol categories that train each area of the profile. */
export const AREA_PROTOCOLS: Record<Area, string[]> = {
  mental: ["focus", "confidence", "regulation", "stress"],
  physical: ["recovery", "activation"],
  technical: ["performance", "focus"],
  tactical: ["performance", "focus"],
};

// Race day ----------------------------------------------------------------------

export type PreState = {
  cognitive?: number;
  somatic?: number;
  confidence?: number;
  direction?: number; // -3 debilitative .. +3 facilitative
  activation?: number;
};

export type RacePlan = {
  zone_low?: number;
  zone_high?: number;
  routine?: { at: number; label: string; done?: boolean }[];
  if_then?: { if: string; then: string }[];
  cues?: string[];
  focus?: string;
};

/** Where today's activation sits against the athlete's IZOF. */
export function zoneCheck(
  plan: RacePlan,
  state: PreState | null | undefined,
): "below" | "in" | "above" | null {
  const a = state?.activation;
  if (a == null || plan.zone_low == null || plan.zone_high == null) return null;
  if (a < plan.zone_low) return "below";
  if (a > plan.zone_high) return "above";
  return "in";
}

/** Anxiety read with its direction (Jones & Swain): high intensity felt as
 *  helpful is not the same as high intensity felt as harmful. */
export function anxietyRead(
  state: PreState | null | undefined,
): "facilitative" | "neutral" | "debilitative" | null {
  if (state?.direction == null) return null;
  if (state.direction > 0) return "facilitative";
  if (state.direction < 0) return "debilitative";
  return "neutral";
}

/** Routine steps, earliest first (largest "minutes before start" first). */
export function sortedRoutine(plan: RacePlan) {
  return [...(plan.routine ?? [])].sort((a, b) => b.at - a.at);
}

// Race readiness checklist ------------------------------------------------------

export type ReadinessItem =
  "zone" | "routine" | "ifThen" | "cues" | "rehearsed" | "fit";

/**
 * The pre-race checklist for one competition: the plan is complete (zone,
 * a routine of 3+ steps, an if-then plan, cue words), it was rehearsed in
 * the last 7 days (a mental session naming the competition), and today's
 * readiness light is not red.
 */
export function raceChecklist(
  plan: RacePlan | null | undefined,
  opts: {
    name: string;
    sessions: { session_date: string; kind?: string; note?: string | null }[];
    readinessLight: Light;
    now?: Date;
  },
): { item: ReadinessItem; done: boolean }[] {
  const p = plan ?? {};
  const now = opts.now ?? new Date();
  const since = isoDay(new Date(now.getTime() - 7 * DAY));
  const rehearsed = opts.sessions.some(
    (s) =>
      s.kind === "mental" &&
      s.session_date >= since &&
      !!s.note &&
      s.note.toLowerCase().includes(opts.name.toLowerCase()),
  );
  return [
    { item: "zone", done: p.zone_low != null && p.zone_high != null },
    { item: "routine", done: (p.routine?.length ?? 0) >= 3 },
    { item: "ifThen", done: (p.if_then?.length ?? 0) >= 1 },
    { item: "cues", done: (p.cues?.length ?? 0) >= 1 },
    { item: "rehearsed", done: rehearsed },
    {
      item: "fit",
      done: opts.readinessLight !== "red" && opts.readinessLight !== "off",
    },
  ];
}
