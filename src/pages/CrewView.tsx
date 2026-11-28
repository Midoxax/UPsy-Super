import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Flag, Gauge, Loader2, MapPin } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "@/lib/router-compat";
import { fmtDay, usePerfCopy } from "@/lib/performance/copy";
import {
  daysToNext,
  isoDay,
  pitWall,
  sortedRoutine,
  type CheckinRow,
  type RacePlan,
} from "@/lib/performance/metrics";
import { StatusLight } from "@/components/performance/PitWall";
import Telemetry from "@/components/performance/Telemetry";
import type { Session } from "@/hooks/usePerformance";

type CrewData = {
  label: string;
  role: string;
  athlete: string;
  scopes: string[];
  checkins?: CheckinRow[];
  sessions?: Session[];
  competitions?: ({
    name: string;
    event_date: string;
    location: string | null;
    importance: number;
  } & Pick<RacePlan, "zone_low" | "zone_high" | "routine" | "cues">)[];
  season?: {
    name: string;
    kind: string;
    starts_on: string;
    ends_on: string;
    focus: string | null;
  }[];
};

/**
 * What a coach, physio or parent sees through a crew link (crew_view):
 * read-only, limited to what the athlete ticked, never clinical content.
 */
export default function CrewView() {
  const c = usePerfCopy();
  const { token = "" } = useParams<{ token: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["crew-view", token],
    queryFn: async () =>
      ((await supabase.rpc("crew_view", { _token: token })).data ??
        null) as CrewData | null,
    retry: false,
  });

  const wall = useMemo(
    () =>
      data
        ? pitWall({
            checkins: data.checkins ?? [],
            sessions: data.sessions ?? [],
            competitions: data.competitions ?? [],
          })
        : null,
    [data],
  );

  const today = isoDay(new Date());
  const upcoming = (data?.competitions ?? []).filter(
    (x) => x.event_date >= today,
  );

  return (
    <>
      <SEOHead path={`/crew/${token}`} title={c.crewPageTitle("")} />
      <section
        className="relative overflow-hidden bg-[#0b0c10] text-white"
        style={{
          backgroundImage:
            "radial-gradient(circle at 85% 0%, rgba(255,179,0,0.18), transparent 45%), radial-gradient(circle at 0% 100%, rgba(109,15,34,0.55), transparent 50%)",
        }}
      >
        <div className="container-custom space-y-6 py-10 sm:py-14">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Gauge className="h-4 w-4" />
            {c.eyebrow}
          </p>
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : !data ? (
            <p className="max-w-xl text-lg text-white/80">{c.crewInvalid}</p>
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="font-display text-4xl leading-tight md:text-5xl">
                  {c.crewPageTitle(data.athlete)}
                </h1>
                <p className="max-w-2xl text-white/70">
                  {c.crewPageIntro(data.label)}
                </p>
              </div>
              {wall && (
                <div className="grid gap-2 sm:grid-cols-3">
                  {data.checkins && (
                    <StatusLight
                      dark
                      label={c.lights.readiness}
                      light={wall.lights.readiness}
                      state={`${c.lightState[wall.lights.readiness]}${wall.readiness.today != null ? ` · ${wall.readiness.today}` : ""}`}
                    />
                  )}
                  {data.sessions && (
                    <StatusLight
                      dark
                      label={c.lights.load}
                      light={wall.lights.load}
                      state={c.lightState[wall.lights.load]}
                    />
                  )}
                  {data.checkins && (
                    <StatusLight
                      dark
                      label={c.lights.recovery}
                      light={wall.lights.recovery}
                      state={c.lightState[wall.lights.recovery]}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {data && (
        <main className="container-custom space-y-8 py-10">
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-h3">{c.upcoming}</h2>
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {upcoming.map((x, i) => {
                  const next = daysToNext([x]) ?? 0;
                  const routine = sortedRoutine(x);
                  return (
                    <li
                      key={i}
                      className="space-y-2 rounded-2xl border border-border bg-card p-5"
                    >
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                        {fmtDay(c, x.event_date)} · {c.days(next)}
                      </p>
                      <p className="flex items-center gap-2 font-semibold">
                        <Flag className="h-4 w-4 text-primary" />
                        {x.name}
                      </p>
                      {x.location && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {x.location}
                        </p>
                      )}
                      {x.zone_low != null && (
                        <p className="text-sm">
                          {c.zoneTitle}: {x.zone_low}–{x.zone_high}
                          {x.cues?.length ? ` · “${x.cues.join(" · ")}”` : ""}
                        </p>
                      )}
                      {routine.length > 0 && (
                        <ul className="space-y-0.5 text-sm text-muted-foreground">
                          {routine.map((r, j) => (
                            <li key={j}>
                              <span className="tabular-nums" dir="ltr">
                                {r.at}
                              </span>{" "}
                              {c.minutesBefore} · {r.label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {(data.checkins || data.sessions) && (
            <Telemetry
              c={c}
              checkins={data.checkins ?? []}
              sessions={data.sessions ?? []}
            />
          )}

          {data.season && data.season.length > 0 && (
            <section className="space-y-2 rounded-2xl border border-border bg-card p-5">
              <h2 className="font-semibold">{c.seasonTitle}</h2>
              {data.season.map((p, i) => (
                <p key={i} className="text-sm">
                  {fmtDay(c, p.starts_on)} → {fmtDay(c, p.ends_on)} · {p.name}{" "}
                  <span className="text-muted-foreground">
                    ({c.phaseKinds[p.kind]}){p.focus && ` · ${p.focus}`}
                  </span>
                </p>
              ))}
            </section>
          )}

          <p className="text-xs text-muted-foreground">{c.disclaimer}</p>
        </main>
      )}
    </>
  );
}
