import { useState } from "react";
import { CheckCircle2, Circle, Flag, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { daysToNext, isoDay, sortedRoutine } from "@/lib/performance/metrics";
import { fmtDay, type PerfCopy } from "@/lib/performance/copy";
import type { Competition } from "@/hooks/useAthleteHub";
import RacePlanDialog, { type RaceView } from "./RacePlanDialog";

const hasPlan = (x: Competition) =>
  !!x.race_plan && Object.keys(x.race_plan).length > 0;

function Step({ done, label }: { done: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      {done ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
      ) : (
        <Circle className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      {label}
    </span>
  );
}

/**
 * Race control for every competition: plan before, check at the start,
 * debrief after. Adding a competition stays in the competitions panel below.
 */
export default function RaceWeekend({
  c,
  competitions,
  onSave,
  children,
}: {
  c: PerfCopy;
  competitions: Competition[];
  onSave: (
    id: string,
    patch: Partial<Competition>,
  ) => Promise<{ error: Error | null }>;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState<{ id: string; view: RaceView } | null>(null);
  const today = isoDay(new Date());
  const upcoming = competitions.filter((x) => x.event_date >= today);
  const past = competitions
    .filter((x) => x.event_date < today)
    .reverse()
    .slice(0, 6);
  const current = competitions.find((x) => x.id === open?.id) ?? null;

  const card = (x: Competition, isPast: boolean) => {
    const d = daysToNext([{ event_date: x.event_date }]) ?? -1;
    const diff = isPast
      ? -Math.round(
          (new Date(`${today}T12:00:00`).getTime() -
            new Date(`${x.event_date}T12:00:00`).getTime()) /
            86_400_000,
        )
      : d;
    const plan = x.race_plan ?? {};
    const next = sortedRoutine(plan)[0];
    return (
      <li
        key={x.id}
        className="space-y-3 rounded-2xl border border-border bg-card p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {fmtDay(c, x.event_date)} · {c.days(diff)}
            </p>
            <p className="truncate font-semibold">{x.name}</p>
            {x.location && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {x.location}
              </p>
            )}
          </div>
          <span className="flex shrink-0 gap-0.5" aria-hidden>
            {Array.from({ length: x.importance }).map((_, i) => (
              <Flag key={i} className="h-3.5 w-3.5 text-primary" />
            ))}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Step done={hasPlan(x)} label={c.plan} />
          <Step done={!!x.pre_state} label={c.preRace} />
          <Step done={!!x.debrief} label={c.debrief} />
        </div>
        {!isPast && hasPlan(x) && (
          <p className="text-xs text-muted-foreground">
            {c.zoneTitle}: {plan.zone_low}–{plan.zone_high}
            {plan.cues?.length ? ` · “${plan.cues.join(" · ")}”` : ""}
            {next ? ` · ${next.at} ${c.minutesBefore}: ${next.label}` : ""}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {!isPast && (
            <Button
              size="sm"
              variant={hasPlan(x) ? "outline" : "primary"}
              onClick={() => setOpen({ id: x.id, view: "plan" })}
            >
              {c.plan}
            </Button>
          )}
          {diff <= 1 && diff >= -1 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOpen({ id: x.id, view: "pre" })}
            >
              {c.preRace}
            </Button>
          )}
          {diff <= 0 && (
            <Button
              size="sm"
              variant={x.debrief ? "outline" : "primary"}
              onClick={() => setOpen({ id: x.id, view: "debrief" })}
            >
              {c.debrief}
            </Button>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted-foreground">{c.raceIntro}</p>
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-semibold">{c.upcoming}</h3>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((x) => card(x, false))}
          </ul>
        </section>
      )}
      {past.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-semibold">{c.past}</h3>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {past.map((x) => card(x, true))}
          </ul>
        </section>
      )}
      {children}
      <RacePlanDialog
        c={c}
        competition={open ? current : null}
        view={open?.view ?? "plan"}
        onOpenChange={(o) => !o && setOpen(null)}
        onSave={onSave}
      />
    </div>
  );
}
