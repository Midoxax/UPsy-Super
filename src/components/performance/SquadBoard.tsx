import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Flag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  pitWall,
  LIGHT,
  type CheckinRow,
  type SessionRow,
} from "@/lib/performance/metrics";
import type { PerfCopy } from "@/lib/performance/copy";

import type { SquadMember as Member } from "@/hooks/usePerformance";
type View = {
  athlete: string;
  checkins?: CheckinRow[];
  sessions?: SessionRow[];
  competitions?: { name: string; event_date: string }[];
};

/**
 * The coach's pit wall for the squad: one card per athlete with the three
 * lights, readiness, the load ratio and the next competition, each read
 * through the athlete's own crew link (read-only, per their scopes).
 */
export default function SquadBoard({
  c,
  members,
}: {
  c: PerfCopy;
  members: Member[];
}) {
  const { locale } = useLocale();
  const { data: views = [] } = useQuery({
    queryKey: ["crew-squad-views", members.map((m) => m.token).join()],
    queryFn: async () =>
      Promise.all(
        members.map(
          async (m) =>
            ((await supabase.rpc("crew_view", { _token: m.token })).data ??
              null) as View | null,
        ),
      ),
    enabled: members.length > 0,
  });

  return (
    <div className="space-y-4">
      <p className="flex max-w-3xl gap-2 text-sm text-muted-foreground">
        <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        {c.squadIntro}
      </p>
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {members.map((m, i) => {
          const v = views[i];
          const wall = v
            ? pitWall({
                checkins: v.checkins ?? [],
                sessions: v.sessions ?? [],
                competitions: v.competitions ?? [],
              })
            : null;
          return (
            <li
              key={m.token}
              className="space-y-4 rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{m.athlete || "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.crewRoles[m.role] ?? m.role}
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link to={addLocalePrefix(`/crew/${m.token}`, locale)}>
                    <ExternalLink className="h-4 w-4" />
                    {c.squadOpen}
                  </Link>
                </Button>
              </div>
              {wall && (
                <>
                  <ul className="space-y-1.5 text-sm">
                    {(["readiness", "load", "recovery"] as const).map((k) => (
                      <li key={k} className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ background: LIGHT[wall.lights[k]] }}
                        />
                        <span className="text-muted-foreground">
                          {c.lights[k]}
                        </span>
                        <span className="font-semibold">
                          {c.lightState[wall.lights[k]]}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {wall.readiness.today != null && (
                      <span>
                        {c.stats.readiness}{" "}
                        <b className="tabular-nums">{wall.readiness.today}</b>
                      </span>
                    )}
                    {wall.load.acwr != null && (
                      <span>
                        {c.stats.acwr}{" "}
                        <b className="tabular-nums">
                          {wall.load.acwr.toFixed(2)}
                        </b>
                      </span>
                    )}
                    {wall.nextRaceDays != null && (
                      <span className="flex items-center gap-1">
                        <Flag className="h-3.5 w-3.5 text-primary" />
                        {c.countdown(wall.nextRaceDays)}
                      </span>
                    )}
                  </div>
                  {wall.alerts
                    .filter((a) => a.level !== "info")
                    .slice(0, 2)
                    .map((a) => (
                      <p key={a.key} className="text-xs text-muted-foreground">
                        {c.alerts[a.key]?.(a.value ?? 0)}
                      </p>
                    ))}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
