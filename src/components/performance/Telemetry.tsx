import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  baseline,
  dailyLoads,
  isoDay,
  loadMetrics,
  LIGHT,
  type CheckinRow,
} from "@/lib/performance/metrics";
import { fmtDay, type PerfCopy } from "@/lib/performance/copy";
import type { Session } from "@/hooks/usePerformance";

const axis = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };
const tooltip = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
  },
  labelStyle: { color: "hsl(var(--foreground))" },
};

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold">{title}</h3>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Readiness against the personal band, load with its ratio, recovery. */
export default function Telemetry({
  c,
  checkins,
  sessions,
  onRemoveSession,
}: {
  c: PerfCopy;
  checkins: CheckinRow[];
  sessions: Session[];
  onRemoveSession: (id: string) => void;
}) {
  // Readiness: last 42 days, one point per day (the latest check-in).
  const readiness = useMemo(() => {
    const byDay = new Map<string, CheckinRow>();
    for (const ci of checkins) {
      const d = isoDay(new Date(ci.created_at));
      if (!byDay.has(d)) byDay.set(d, ci);
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-42)
      .map(([d, ci]) => ({
        date: fmtDay(c, d),
        score: ci.score,
        sleep: ci.sleep_hours ?? null,
        hrv: ci.hrv_ms ?? null,
        soreness: ci.soreness ?? null,
      }));
  }, [checkins, c]);
  const band = useMemo(
    () =>
      baseline(
        checkins.map((x) => ({ at: x.created_at, value: x.score })),
        new Date(),
      ),
    [checkins],
  );

  // Load: 28 days of bars, with the ratio as it stood each day.
  const load = useMemo(() => {
    const days = dailyLoads(sessions, 28);
    return days.map((d) => {
      const end = new Date(`${d.date}T12:00:00`);
      const m = loadMetrics(
        sessions.filter((s) => s.session_date <= d.date),
        end,
      );
      return { date: fmtDay(c, d.date), load: d.load, acwr: m.acwr };
    });
  }, [sessions, c]);
  const hasTelemetry = readiness.some(
    (r) => r.sleep != null || r.hrv != null || r.soreness != null,
  );

  return (
    <div className="space-y-6">
      <Panel title={c.readinessTrace} hint={c.readinessTraceHint}>
        {readiness.length < 2 ? (
          <p className="text-sm text-muted-foreground">{c.noTelemetry}</p>
        ) : (
          <div style={{ height: 240 }} dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={readiness}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={axis}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={16}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={axis}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip {...tooltip} />
                {band.n >= 7 && (
                  <ReferenceArea
                    y1={Math.max(0, band.mean - band.sd)}
                    y2={Math.min(100, band.mean + band.sd)}
                    fill="hsl(var(--primary))"
                    fillOpacity={0.12}
                    ifOverflow="hidden"
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="score"
                  name={c.stats.readiness}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ r: 2.5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <Panel title={c.loadTrace} hint={c.loadTraceHint}>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{c.noSessions}</p>
        ) : (
          <>
            <div style={{ height: 260 }} dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={load}
                  margin={{ top: 8, right: 0, left: -16, bottom: 0 }}
                >
                  <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={axis}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={16}
                  />
                  <YAxis
                    yAxisId="load"
                    tick={axis}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="ratio"
                    orientation="right"
                    domain={[0, 2]}
                    tick={axis}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip {...tooltip} />
                  <ReferenceArea
                    yAxisId="ratio"
                    y1={0.8}
                    y2={1.3}
                    fill={LIGHT.green}
                    fillOpacity={0.08}
                  />
                  <ReferenceLine
                    yAxisId="ratio"
                    y={1.5}
                    stroke={LIGHT.red}
                    strokeDasharray="4 4"
                  />
                  <Bar
                    yAxisId="load"
                    dataKey="load"
                    name={c.au}
                    fill="hsl(var(--secondary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="ratio"
                    type="monotone"
                    dataKey="acwr"
                    name={c.stats.acwr}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{c.acwrCaveat}</p>
          </>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={c.recoveryTrace}>
          {!hasTelemetry ? (
            <p className="text-sm text-muted-foreground">{c.noTelemetry}</p>
          ) : (
            <div className="h-[220px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={readiness}
                  margin={{ top: 8, right: 0, left: -16, bottom: 0 }}
                >
                  <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={axis}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={16}
                  />
                  <YAxis
                    yAxisId="h"
                    domain={[0, 12]}
                    tick={axis}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="ms"
                    orientation="right"
                    tick={axis}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip {...tooltip} />
                  <ReferenceLine
                    yAxisId="h"
                    y={7}
                    stroke={LIGHT.green}
                    strokeDasharray="4 4"
                  />
                  <Bar
                    yAxisId="h"
                    dataKey="sleep"
                    name={c.sleepHours}
                    fill="hsl(var(--primary))"
                    fillOpacity={0.55}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="ms"
                    type="monotone"
                    dataKey="hrv"
                    name={c.hrvMs}
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel title={c.recentSessions}>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{c.noSessions}</p>
          ) : (
            <ul className="divide-y divide-border">
              {sessions.slice(0, 8).map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-2 text-sm">
                  <span className="w-16 shrink-0 text-muted-foreground">
                    {fmtDay(c, s.session_date)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {c.kinds[s.kind] ?? s.kind} · {s.duration_minutes} min · RPE{" "}
                    {s.rpe}
                  </span>
                  <span className="font-semibold tabular-nums" dir="ltr">
                    {s.load ?? s.duration_minutes * s.rpe}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={c.delete}
                    onClick={() => onRemoveSession(s.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
