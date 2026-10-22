import { useState, useMemo, type ReactNode } from "react";
import { Link } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Medal,
  Dumbbell,
  Sparkles,
  Clock,
  MessageCircle,
  Flame,
  CheckCircle2,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useAthleteHub, type Protocol } from "@/hooks/useAthleteHub";
import ReadinessRing, {
  readinessTier,
} from "@/components/athlete/ReadinessRing";
import DailyCheckinDialog from "@/components/athlete/DailyCheckinDialog";
import ProtocolRunner from "@/components/athlete/ProtocolRunner";
import JournalPanel from "@/components/athlete/JournalPanel";
import GoalsPanel from "@/components/athlete/GoalsPanel";
import CompetitionsPanel from "@/components/athlete/CompetitionsPanel";
import SharePanel from "@/components/athlete/SharePanel";
import AssessmentsPanel from "@/components/athlete/AssessmentsPanel";
import ProgressReport from "@/components/athlete/ProgressReport";
import { useHubCopy, protocolText, fmtDate } from "@/components/athlete/copy";
import { checkinStreak } from "@/components/athlete/stats";

function Module({
  n,
  title,
  aside,
  children,
}: {
  n: number;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={`m${n}`} className="scroll-mt-32 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-h3 flex items-center gap-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
            {n}
          </span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

const AthleteHub = () => {
  const { user } = useAuth();
  const { locale } = useLocale();
  const c = useHubCopy();
  const hub = useAthleteHub();
  const {
    checkins,
    protocols,
    journal,
    goals,
    competitions,
    completions,
    assessments,
    shares,
    candidates,
    latestScore,
  } = hub;
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null);

  const trend = useMemo(
    () =>
      [...checkins].reverse().map((ci) => ({
        score: ci.score,
        date: fmtDate(c, ci.created_at),
      })),
    [checkins, c],
  );

  const avg7 = useMemo(() => {
    const recent = checkins.slice(0, 7);
    if (recent.length === 0) return null;
    return Math.round(recent.reduce((s, x) => s + x.score, 0) / recent.length);
  }, [checkins]);

  const doneToday =
    !!checkins[0] &&
    new Date(checkins[0].created_at).toDateString() ===
      new Date().toDateString();
  const streak = useMemo(
    () => checkinStreak(checkins.map((x) => x.created_at)),
    [checkins],
  );
  const monthCount = useMemo(() => {
    const since = Date.now() - 30 * 86400000;
    const m = new Map<string, number>();
    for (const x of completions)
      if (new Date(x.completed_at).getTime() > since)
        m.set(x.protocol_id, (m.get(x.protocol_id) ?? 0) + 1);
    return m;
  }, [completions]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 sm:p-12 text-center max-w-md">
          <Medal className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-h2 mb-2">{c.signInTitle}</h1>
          <p className="text-muted-foreground mb-6">{c.signInDesc}</p>
          <Button variant="primary" asChild>
            <Link to={addLocalePrefix("/auth?redirect=/athlete-hub", locale)}>
              {c.signIn}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const tier = latestScore == null ? null : readinessTier(latestScore);
  const name =
    (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "";

  return (
    <div className="min-h-screen">
      <section className="hero-neural-bg relative py-8 sm:py-12 print:hidden">
        <div className="container-custom relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {c.badge}
            </Badge>
          </div>
          <h1 className="text-h1">{c.title}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">{c.subtitle}</p>
        </div>
      </section>

      {/* Module index 1-9: scrolls sideways on phones, wraps on desktop. */}
      <nav
        aria-label={c.title}
        className="sticky top-16 z-20 border-y border-border/40 bg-background/90 backdrop-blur print:hidden"
      >
        <ol className="container-custom flex gap-2 overflow-x-auto py-2 sm:flex-wrap">
          {c.modules.map((label, i) => (
            <li key={label} className="shrink-0">
              <a
                href={`#m${i + 1}`}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border/60 px-3 text-sm text-foreground hover:border-primary hover:text-primary"
              >
                <span className="text-xs font-bold text-primary">{i + 1}</span>
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="py-8 sm:py-12 liquid-bg">
        <div className="container-custom space-y-12">
          {/* 1. Check-in */}
          <Module n={1} title={c.modules[0]}>
            <div className="glass-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-medium text-foreground flex items-center gap-2">
                  {doneToday ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  )}
                  {doneToday ? c.checkinDoneToday : c.checkinNotYet}
                </p>
                {streak > 0 && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    {streak} {c.streak}
                  </p>
                )}
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => setCheckinOpen(true)}
              >
                <Sparkles className="w-4 h-4" />
                {doneToday ? c.checkinUpdate : c.checkinCta}
              </Button>
            </div>
          </Module>

          {/* 2. Readiness */}
          <Module n={2} title={c.modules[1]}>
            <div className="grid lg:grid-cols-[320px_1fr] gap-6">
              <div className="glass-card p-6 flex flex-col items-center justify-center">
                <ReadinessRing score={latestScore} size={200} />
                {tier && (
                  <p className="text-sm text-center text-muted-foreground mt-4">
                    {c.tierAdvice[tier]}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-6 w-full mt-6 pt-6 border-t border-border/30">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {avg7 ?? "—"}
                    </p>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
                      {c.avg7}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {checkins.length}
                    </p>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
                      {c.checkins}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 sm:p-6 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                  <h3 className="font-semibold text-foreground">{c.trend}</h3>
                  <Badge variant="outline">{c.lastN(trend.length)}</Badge>
                </div>
                {trend.length < 2 ? (
                  <div className="flex flex-col items-center justify-center h-[220px] text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      {c.trendEmpty}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setCheckinOpen(true)}
                    >
                      {c.checkinCta}
                    </Button>
                  </div>
                ) : (
                  <div className="h-[220px]" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trend}
                        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="date"
                          tick={{
                            fontSize: 11,
                            fill: "hsl(var(--muted-foreground))",
                          }}
                          tickLine={false}
                          axisLine={false}
                          minTickGap={16}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{
                            fontSize: 11,
                            fill: "hsl(var(--muted-foreground))",
                          }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 12,
                          }}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </Module>

          {/* 3. Protocols */}
          <Module
            n={3}
            title={c.modules[2]}
            aside={
              <Badge variant="outline">{c.sessions(protocols.length)}</Badge>
            }
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {protocols.map((p) => {
                const text = protocolText(c, p);
                const n = monthCount.get(p.id) ?? 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveProtocol(p)}
                    className="glass-card p-5 text-start group hover:shadow-glass-hover transition-all flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">
                        {c.categories[p.category] ?? p.category}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        <Clock className="w-3 h-3 mr-1" />
                        {p.duration_minutes} {c.minutes}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {text.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {text.description}
                    </p>
                    {n > 0 && (
                      <p className="text-xs text-primary mt-3 font-medium">
                        {c.doneThisMonth(n)}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </Module>

          {/* 4. Journal */}
          <Module n={4} title={c.modules[3]}>
            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
              <JournalPanel
                entries={journal}
                onAdd={hub.addJournalEntry}
                onSynthesize={hub.synthesizeEntry}
              />
              <Link
                to={addLocalePrefix("/ai-assistant", locale)}
                className="glass-card p-6 block group hover:shadow-glass-hover transition-all self-start"
              >
                <MessageCircle className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-foreground">{c.aiCoach}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {c.aiCoachDesc}
                </p>
              </Link>
            </div>
          </Module>

          {/* 5. Goals */}
          <Module n={5} title={c.modules[4]}>
            <GoalsPanel
              goals={goals}
              onAdd={hub.addGoal}
              onUpdate={hub.updateGoal}
            />
          </Module>

          {/* 6. Competitions */}
          <Module n={6} title={c.modules[5]}>
            <CompetitionsPanel
              competitions={competitions}
              onAdd={hub.addCompetition}
              onUpdate={hub.updateCompetition}
              onRemove={hub.removeCompetition}
            />
          </Module>

          {/* 7. Psychologist */}
          <Module n={7} title={c.share}>
            <SharePanel
              shares={shares}
              candidates={candidates}
              onSet={hub.setShare}
            />
          </Module>

          {/* 8. Assessments */}
          <Module n={8} title={c.modules[7]}>
            <AssessmentsPanel assessments={assessments} />
          </Module>

          {/* 9. Report */}
          <Module n={9} title={c.report}>
            <ProgressReport
              name={name}
              checkins={checkins}
              completions={completions}
              goals={goals}
              competitions={competitions}
              journal={journal}
            />
          </Module>
        </div>
      </div>

      <DailyCheckinDialog
        open={checkinOpen}
        onOpenChange={setCheckinOpen}
        onSubmit={hub.submitCheckin}
      />
      <ProtocolRunner
        protocol={activeProtocol}
        onOpenChange={(o) => {
          if (!o) setActiveProtocol(null);
        }}
        onComplete={hub.logProtocol}
      />
    </div>
  );
};

export default AthleteHub;
