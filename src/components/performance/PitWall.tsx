import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Flag,
  Gauge,
  Info,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LIGHT,
  type Light,
  type PitWall as Wall,
} from "@/lib/performance/metrics";
import type { PerfCopy } from "@/lib/performance/copy";
import WeeklyReportToggle from "./WeeklyReportToggle";

export function StatusLight({
  label,
  light,
  state,
  dark = false,
}: {
  label: string;
  light: Light;
  state: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${dark ? "border-white/10 bg-white/5" : "border-border bg-card"}`}
    >
      <span
        aria-hidden
        className="relative flex h-4 w-4 shrink-0 rounded-full"
        style={{
          background: LIGHT[light],
          boxShadow: light === "off" ? "none" : `0 0 14px ${LIGHT[light]}`,
        }}
      >
        {light === "red" && (
          <span
            className="absolute inset-0 animate-ping rounded-full opacity-60"
            style={{ background: LIGHT.red }}
          />
        )}
      </span>
      <div className="min-w-0">
        <p
          className={`text-[11px] uppercase tracking-widest ${dark ? "text-white/60" : "text-muted-foreground"}`}
        >
          {label}
        </p>
        <p className="font-semibold leading-tight">{state}</p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums" dir="ltr">
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

/**
 * The command screen: three lights, the countdown to the next competition,
 * the race engineer's notes (alerts) and the key numbers.
 */
export default function PitWall({
  c,
  wall,
  checkedInToday,
  onCheckin,
  onLogSession,
  onGoto,
}: {
  c: PerfCopy;
  wall: Wall;
  checkedInToday: boolean;
  onCheckin: () => void;
  onLogSession: () => void;
  onGoto: (tab: "race" | "telemetry") => void;
}) {
  const { load, readiness, hrv } = wall;
  const levelIcon = {
    red: <AlertTriangle className="h-4 w-4" style={{ color: LIGHT.red }} />,
    amber: <AlertTriangle className="h-4 w-4" style={{ color: LIGHT.amber }} />,
    info: <Info className="h-4 w-4 text-muted-foreground" />,
  };
  const nf = (n: number | null | undefined) =>
    n == null ? "—" : new Intl.NumberFormat("fr-FR").format(n);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Countdown */}
        <button
          type="button"
          onClick={() => onGoto("race")}
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-start transition hover:border-primary"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Flag className="h-6 w-6 text-primary" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {c.tabs.race}
            </p>
            {wall.nextRaceDays == null ? (
              <p className="font-semibold">{c.noRace}</p>
            ) : (
              <p className="font-semibold">
                <span
                  className="me-1 font-display text-3xl tabular-nums text-primary"
                  dir="ltr"
                >
                  {c.countdown(wall.nextRaceDays)}
                </span>
                {c.nextRace(wall.nextRaceDays)}
              </p>
            )}
          </div>
        </button>

        {/* Quick actions */}
        <div className="flex flex-col justify-center gap-2 rounded-2xl border border-border bg-card p-5">
          <Button
            variant={checkedInToday ? "outline" : "primary"}
            onClick={onCheckin}
          >
            {checkedInToday ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {checkedInToday ? c.checkinDone : c.checkin}
          </Button>
          <Button variant="outline" onClick={onLogSession}>
            <Plus className="h-4 w-4" />
            {c.logSession}
          </Button>
        </div>

        {/* Readiness vs baseline */}
        <button
          type="button"
          onClick={() => onGoto("telemetry")}
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-start transition hover:border-primary"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Gauge className="h-6 w-6 text-primary" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {c.stats.readiness}
            </p>
            <p className="font-display text-3xl tabular-nums" dir="ltr">
              {readiness.today ?? "—"}
            </p>
            {readiness.n >= 7 && (
              <p className="text-xs text-muted-foreground">
                {c.stats.baseline}: {readiness.mean} ± {readiness.sd}
              </p>
            )}
          </div>
        </button>
      </div>

      {/* Engineer's notes */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <Activity className="h-4 w-4 text-primary" />
          {c.alertsTitle}
        </h3>
        {wall.alerts.filter((a) => a.level !== "info").length === 0 && (
          <p className="mb-2 flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4" style={{ color: LIGHT.green }} />
            {c.allClear}
          </p>
        )}
        <ul className="space-y-2">
          {wall.alerts.map((a) => (
            <li key={a.key} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 shrink-0">{levelIcon[a.level]}</span>
              <span>{c.alerts[a.key]?.(a.value ?? 0)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label={c.stats.acute} value={nf(load.acute)} sub={c.au} />
        <Stat label={c.stats.chronic} value={nf(load.chronic)} sub={c.au} />
        <Stat
          label={c.stats.acwr}
          value={load.acwr == null ? "—" : load.acwr.toFixed(2)}
          sub={load.zone ? c.zones[load.zone] : undefined}
        />
        <Stat
          label={c.stats.monotony}
          value={load.monotony == null ? "—" : load.monotony.toFixed(2)}
        />
        <Stat label={c.stats.sessions} value={String(load.sessions7)} />
        <Stat
          label={c.stats.hrv}
          value={hrv.today == null ? "—" : `${hrv.today}`}
          sub={hrv.n >= 7 ? `${c.stats.baseline}: ${hrv.mean}` : "ms"}
        />
      </div>

      <WeeklyReportToggle c={c} />

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {c.disclaimer}
      </p>
    </div>
  );
}
