import { useState, useMemo } from "react";
import { Link } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScrollReveal from "@/components/ScrollReveal";
import MaroonDivider from "@/components/ui/maroon-divider";
import {
  Brain, TrendingUp, Medal, Dumbbell, BarChart3, Sparkles, Clock, MessageCircle,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useAthleteHub, type Protocol } from "@/hooks/useAthleteHub";
import ReadinessRing from "@/components/athlete/ReadinessRing";
import DailyCheckinDialog from "@/components/athlete/DailyCheckinDialog";
import ProtocolRunner from "@/components/athlete/ProtocolRunner";
import JournalPanel from "@/components/athlete/JournalPanel";

const AthleteHub = () => {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const { checkins, protocols, journal, latestScore, submitCheckin, logProtocol, addJournalEntry, synthesizeEntry } = useAthleteHub();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null);

  const trend = useMemo(
    () => [...checkins].reverse().map((c, i) => ({
      i, score: c.score,
      date: new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    })),
    [checkins]
  );

  const avg7 = useMemo(() => {
    const recent = checkins.slice(0, 7);
    if (recent.length === 0) return null;
    return Math.round(recent.reduce((s, c) => s + c.score, 0) / recent.length);
  }, [checkins]);

  const lastCheckinToday = useMemo(() => {
    const c = checkins[0];
    if (!c) return false;
    const d = new Date(c.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }, [checkins]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-md">
          <Medal className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-h2 mb-2">{t('athleteHubPage.signInRequired')}</h2>
          <p className="text-muted-foreground mb-6">{t('athleteHubPage.signInDesc')}</p>
          <Button variant="primary" asChild><Link to={addLocalePrefix("/auth", locale)}>{t('athleteHubPage.signIn')}</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-neural-bg relative py-12">
        <div className="container-custom relative z-10">
          <ScrollReveal>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Dumbbell className="w-6 h-6 text-primary" />
                  <Badge className="bg-primary/10 text-primary border-primary/20">{t('athleteHubPage.badge')}</Badge>
                </div>
                <h1 className="text-h1">{t('athleteHubPage.title')}</h1>
                <p className="text-muted-foreground mt-2">{t('athleteHubPage.subtitle')}</p>
              </div>
              <Button variant="primary" size="lg" onClick={() => setCheckinOpen(true)}>
                <Sparkles className="w-4 h-4 mr-2" />
                {lastCheckinToday ? "Update today's check-in" : "Daily check-in"}
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <MaroonDivider />

      <section className="section-spacing liquid-bg">
        <div className="container-custom space-y-8">
          {/* Readiness Ring + Trend */}
          <div className="grid lg:grid-cols-[340px_1fr] gap-6">
            <div className="glass-card p-6 flex flex-col items-center justify-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Current readiness</p>
              <ReadinessRing score={latestScore} />
              <div className="grid grid-cols-2 gap-6 w-full mt-6 pt-6 border-t border-border/30">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{avg7 ?? "—"}</p>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">7-day avg</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{checkins.length}</p>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">Check-ins</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-h3 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Readiness trend</h3>
                <Badge variant="outline">Last {trend.length || 0} days</Badge>
              </div>
              {trend.length < 2 ? (
                <div className="flex flex-col items-center justify-center h-[260px] text-center">
                  <p className="text-sm text-muted-foreground mb-3">Add a few check-ins to see your trend curve.</p>
                  <Button variant="outline" onClick={() => setCheckinOpen(true)}>Start a check-in</Button>
                </div>
              ) : (
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Protocols */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h2 flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                Protocols library
              </h2>
              <Badge variant="outline">{protocols.length} guided sessions</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {protocols.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveProtocol(p)}
                  className="glass-card p-6 text-left group hover:shadow-glass-hover transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="capitalize text-[10px]">{p.category}</Badge>
                    <Badge variant="outline" className="text-[10px]"><Clock className="w-3 h-3 mr-1" />{p.duration_minutes}m</Badge>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Journal + AI Coach CTA */}
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
            <JournalPanel entries={journal} onAdd={addJournalEntry} onSynthesize={synthesizeEntry} />

            <div className="space-y-4">
              <Link
                to={addLocalePrefix("/ai-assistant", locale)}
                className="glass-card p-6 text-left block group hover:shadow-glass-hover transition-all"
              >
                <MessageCircle className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-foreground">Talk to Nour AI Coach</p>
                <p className="text-xs text-muted-foreground mt-1">Get a quick reflection prompt or decompression script based on today's score.</p>
              </Link>
              <Link
                to={addLocalePrefix("/assessments", locale)}
                className="glass-card p-6 text-left block group hover:shadow-glass-hover transition-all"
              >
                <BarChart3 className="w-8 h-8 text-u-clinical mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-foreground">{t('athleteHubPage.takeAssessment')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('athleteHubPage.takeAssessmentDesc')}</p>
              </Link>
              <Link
                to={addLocalePrefix("/psychologists", locale)}
                className="glass-card p-6 text-left block group hover:shadow-glass-hover transition-all"
              >
                <Brain className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-foreground">{t('athleteHubPage.findSportPsych')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('athleteHubPage.findSportPsychDesc')}</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <DailyCheckinDialog open={checkinOpen} onOpenChange={setCheckinOpen} onSubmit={submitCheckin} />
      <ProtocolRunner protocol={activeProtocol} onOpenChange={(o) => { if (!o) setActiveProtocol(null); }} onComplete={logProtocol} />
    </div>
  );
};

export default AthleteHub;
