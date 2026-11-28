import { Activity, CalendarRange, Flag, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  anxietyRead,
  baseline,
  loadMetrics,
  profileGaps,
  zoneCheck,
  type PreState,
  type Quality,
  type RacePlan,
  type SessionRow,
} from "@/lib/performance/metrics";
import { fmtDay, usePerfCopy } from "@/lib/performance/copy";

type Shared = {
  checkins?: {
    created_at: string;
    score: number;
    hrv_ms?: number | null;
    sleep_hours?: number | null;
  }[];
  sessions?: SessionRow[];
  profiles?: { created_at: string; qualities: Quality[] }[];
  season?: {
    name: string;
    kind: string;
    starts_on: string;
    ends_on: string;
    focus: string | null;
  }[];
  competitions?: {
    name: string;
    event_date: string;
    race_plan?: RacePlan | null;
    pre_state?: PreState | null;
    debrief?: Record<string, string | number> | null;
  }[];
};

/**
 * What a psychologist sees of an athlete's Performance Center, limited to
 * the scopes the athlete shared (athlete_shared_overview): load, readiness
 * against baseline, profile priorities, season, race plans and debriefs.
 */
export default function SharedPerformance({ data }: { data: Shared }) {
  const c = usePerfCopy();
  const load = data.sessions ? loadMetrics(data.sessions) : null;
  const ready = data.checkins
    ? baseline(data.checkins.map((x) => ({ at: x.created_at, value: x.score })))
    : null;
  const profile = data.profiles?.[0];
  const gaps = profile ? profileGaps(profile.qualities).slice(0, 5) : [];
  const planned = (data.competitions ?? []).filter(
    (x) =>
      (x.race_plan && Object.keys(x.race_plan).length) ||
      x.pre_state ||
      x.debrief,
  );
  const fmt = (n: number | null | undefined, d = 0) =>
    n == null ? "—" : n.toFixed(d);

  return (
    <>
      {(load || (ready && ready.n >= 7)) && (
        <Card className="space-y-3 p-5">
          <p className="flex items-center gap-2 font-medium">
            <Activity className="h-4 w-4 text-primary" /> {c.tabs.telemetry}
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {load && (
              <>
                <p>
                  <span className="block text-xs text-muted-foreground">
                    {c.stats.acute}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {load.acute} {c.au}
                  </span>
                </p>
                <p>
                  <span className="block text-xs text-muted-foreground">
                    {c.stats.acwr}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {fmt(load.acwr, 2)}
                    {load.zone && ` · ${c.zones[load.zone]}`}
                  </span>
                </p>
                <p>
                  <span className="block text-xs text-muted-foreground">
                    {c.stats.monotony}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {fmt(load.monotony, 2)}
                  </span>
                </p>
              </>
            )}
            {ready && ready.n >= 7 && (
              <p>
                <span className="block text-xs text-muted-foreground">
                  {c.stats.baseline}
                </span>
                <span className="font-semibold tabular-nums">
                  {ready.mean} ± {ready.sd}
                </span>
              </p>
            )}
          </div>
          {load && (
            <p className="text-xs text-muted-foreground">{c.acwrCaveat}</p>
          )}
        </Card>
      )}

      {profile && (
        <Card className="space-y-2 p-5">
          <p className="flex items-center gap-2 font-medium">
            <SlidersHorizontal className="h-4 w-4 text-primary" />{" "}
            {c.setupTitle}
            <span className="text-xs font-normal text-muted-foreground">
              · {fmtDay(c, profile.created_at)}
            </span>
          </p>
          {gaps.map((g) => (
            <p key={g.label} className="text-sm">
              {g.label}{" "}
              <span className="text-muted-foreground">
                ({c.areas[g.area]}) · {g.current} → {g.ideal} · {c.gap(g.gap)}
              </span>
            </p>
          ))}
        </Card>
      )}

      {data.season && data.season.length > 0 && (
        <Card className="space-y-2 p-5">
          <p className="flex items-center gap-2 font-medium">
            <CalendarRange className="h-4 w-4 text-primary" /> {c.seasonTitle}
          </p>
          {data.season.map((p, i) => (
            <p key={i} className="text-sm">
              {fmtDay(c, p.starts_on)} → {fmtDay(c, p.ends_on)} · {p.name}{" "}
              <span className="text-muted-foreground">
                ({c.phaseKinds[p.kind]}){p.focus && ` · ${p.focus}`}
              </span>
            </p>
          ))}
        </Card>
      )}

      {planned.length > 0 && (
        <Card className="space-y-3 p-5">
          <p className="flex items-center gap-2 font-medium">
            <Flag className="h-4 w-4 text-primary" /> {c.raceTitle}
          </p>
          {planned.map((x, i) => {
            const plan = x.race_plan ?? {};
            const z = zoneCheck(plan, x.pre_state);
            const dir = anxietyRead(x.pre_state);
            return (
              <div key={i} className="space-y-1 text-sm">
                <p className="font-medium">
                  {x.name} · {fmtDay(c, x.event_date)}
                </p>
                {plan.zone_low != null && (
                  <p className="text-muted-foreground">
                    {c.zoneTitle}: {plan.zone_low}–{plan.zone_high}
                    {plan.cues?.length ? ` · “${plan.cues.join(" · ")}”` : ""}
                  </p>
                )}
                {(plan.if_then ?? []).map((it, j) => (
                  <p key={j} className="text-muted-foreground">
                    {c.ifPh} {it.if} → {it.then}
                  </p>
                ))}
                {x.pre_state && (
                  <p>
                    {c.preRace}: {c.cognitive} {x.pre_state.cognitive},{" "}
                    {c.somatic} {x.pre_state.somatic}, {c.confidence}{" "}
                    {x.pre_state.confidence}
                    {z && ` · ${c.zoneRead[z]}`}
                    {dir && ` · ${c.directionRead[dir]}`}
                  </p>
                )}
                {x.debrief &&
                  Object.entries(c.debriefFields)
                    .filter(([k]) => x.debrief?.[k])
                    .map(([k, label]) => (
                      <p key={k}>
                        <span className="text-muted-foreground">{label}</span>{" "}
                        {String(x.debrief?.[k])}
                      </p>
                    ))}
              </div>
            );
          })}
        </Card>
      )}
    </>
  );
}
