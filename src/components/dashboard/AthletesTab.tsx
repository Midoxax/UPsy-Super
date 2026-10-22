import { useEffect, useState } from "react";
import {
  Medal,
  Target,
  Trophy,
  Brain,
  BookOpen,
  ClipboardCheck,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Shared = {
  athlete_id: string;
  full_name: string | null;
  scopes: string[];
  shared_at: string;
};

type Overview = {
  scopes: string[];
  checkins?: {
    created_at: string;
    score: number;
    sleep: number;
    stress: number;
  }[];
  goals?: {
    title: string;
    kind: string;
    progress: number;
    status: string;
    target_date: string | null;
  }[];
  competitions?: {
    name: string;
    event_date: string;
    location: string | null;
    result: string | null;
    performance_rating: number | null;
    reflection: string | null;
  }[];
  protocols?: { completed_at: string; title: string; rating: number | null }[];
  reflections?: {
    created_at: string;
    mood_tag: string | null;
    ai_summary: string;
    themes: string[] | null;
  }[];
  assessments?: {
    title: string;
    total_score: number | null;
    interpretation: string | null;
    completed_at: string;
  }[];
};

const d = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });

/** Athletes who chose to share Athlete Hub data with this psychologist. */
export default function AthletesTab() {
  const [list, setList] = useState<Shared[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    supabase.rpc("athletes_shared_with_me").then(({ data }) => {
      const rows = (data as Shared[]) ?? [];
      setList(rows);
      if (rows[0]) setSelected(rows[0].athlete_id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setData(null);
    supabase
      .rpc("athlete_shared_overview", { p_athlete: selected })
      .then(({ data }) => setData((data as Overview) ?? null));
  }, [selected]);

  if (list === null)
    return <Card className="p-6 text-sm text-muted-foreground">Loading…</Card>;
  if (list.length === 0)
    return (
      <Card className="p-6 space-y-2">
        <p className="font-medium flex items-center gap-2">
          <Medal className="w-4 h-4 text-primary" /> No athlete shares data with
          you yet
        </p>
        <p className="text-sm text-muted-foreground">
          Athletes you have a booking with can share check-ins, goals,
          competitions and assessment results from their Athlete Hub (module 7).
          They choose what you see and can stop at any time.
        </p>
      </Card>
    );

  const avg = data?.checkins?.length
    ? Math.round(
        data.checkins.reduce((s, c) => s + c.score, 0) / data.checkins.length,
      )
    : null;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {list.map((a) => (
          <Button
            key={a.athlete_id}
            size="sm"
            variant={selected === a.athlete_id ? "default" : "outline"}
            onClick={() => setSelected(a.athlete_id)}
            className="shrink-0"
          >
            {a.full_name || "Athlete"}
          </Button>
        ))}
      </div>

      {!data ? (
        <Card className="p-6 text-sm text-muted-foreground">Loading…</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.checkins && (
            <Card className="p-5 space-y-2">
              <p className="font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Readiness (90
                days)
              </p>
              <p className="text-3xl font-bold">{avg ?? "—"}</p>
              <p className="text-xs text-muted-foreground">
                Average over {data.checkins.length} check-ins
                {data.checkins[0] &&
                  ` · last ${d(data.checkins[0].created_at)} (${data.checkins[0].score})`}
              </p>
              <div className="flex items-end gap-0.5 h-12" aria-hidden>
                {[...data.checkins]
                  .reverse()
                  .slice(-30)
                  .map((c, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-primary/60"
                      style={{ height: `${c.score}%` }}
                    />
                  ))}
              </div>
            </Card>
          )}
          {data.goals && (
            <Card className="p-5 space-y-2">
              <p className="font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Goals
              </p>
              {data.goals.length === 0 && (
                <p className="text-sm text-muted-foreground">None yet.</p>
              )}
              {data.goals.map((g, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="min-w-0 break-words">
                    {g.title}{" "}
                    <Badge variant="outline" className="text-[10px] ml-1">
                      {g.kind}
                    </Badge>
                  </span>
                  <span className="tabular-nums shrink-0">
                    {g.status === "done" ? "✓" : `${g.progress}%`}
                  </span>
                </div>
              ))}
            </Card>
          )}
          {data.competitions && (
            <Card className="p-5 space-y-3">
              <p className="font-medium flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" /> Competitions
              </p>
              {data.competitions.length === 0 && (
                <p className="text-sm text-muted-foreground">None yet.</p>
              )}
              {data.competitions.map((c, i) => (
                <div key={i} className="text-sm space-y-0.5">
                  <p className="font-medium">
                    {c.name} · {d(c.event_date)}
                    {c.performance_rating != null &&
                      ` · ${c.performance_rating}/10`}
                  </p>
                  {c.result && (
                    <p className="text-muted-foreground">{c.result}</p>
                  )}
                  {c.reflection && (
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {c.reflection}
                    </p>
                  )}
                </div>
              ))}
            </Card>
          )}
          {data.protocols && (
            <Card className="p-5 space-y-2">
              <p className="font-medium flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" /> Protocols (
                {data.protocols.length} in 90 days)
              </p>
              {data.protocols.slice(0, 8).map((p, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  {d(p.completed_at)} · {p.title}
                  {p.rating != null && ` · rated ${p.rating}/5`}
                </p>
              ))}
            </Card>
          )}
          {data.reflections && (
            <Card className="p-5 space-y-3">
              <p className="font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Journal
                reflections (summaries)
              </p>
              {data.reflections.length === 0 && (
                <p className="text-sm text-muted-foreground">None yet.</p>
              )}
              {data.reflections.map((r, i) => (
                <div key={i} className="text-sm">
                  <p className="text-xs text-muted-foreground">
                    {d(r.created_at)}
                    {r.mood_tag && ` · ${r.mood_tag}`}
                  </p>
                  <p>{r.ai_summary}</p>
                </div>
              ))}
            </Card>
          )}
          {data.assessments && (
            <Card className="p-5 space-y-2">
              <p className="font-medium flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-primary" /> Assessments
              </p>
              {data.assessments.length === 0 && (
                <p className="text-sm text-muted-foreground">None yet.</p>
              )}
              {data.assessments.map((a, i) => (
                <p key={i} className="text-sm">
                  {a.title}:{" "}
                  <span className="font-semibold">{a.total_score ?? "—"}</span>{" "}
                  <span className="text-muted-foreground">
                    · {d(a.completed_at)}
                  </span>
                  {a.interpretation && (
                    <span className="block text-muted-foreground">
                      {a.interpretation}
                    </span>
                  )}
                </p>
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
