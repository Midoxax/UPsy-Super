import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CalendarRange,
  Clock,
  Cpu,
  Flag,
  Gauge,
  Medal,
  MessageCircle,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useAthleteHub, type Protocol } from "@/hooks/useAthleteHub";
import { usePerformance } from "@/hooks/usePerformance";
import DailyCheckinDialog from "@/components/athlete/DailyCheckinDialog";
import ProtocolRunner from "@/components/athlete/ProtocolRunner";
import JournalPanel from "@/components/athlete/JournalPanel";
import GoalsPanel from "@/components/athlete/GoalsPanel";
import CompetitionsPanel from "@/components/athlete/CompetitionsPanel";
import SharePanel from "@/components/athlete/SharePanel";
import AssessmentsPanel from "@/components/athlete/AssessmentsPanel";
import ProgressReport from "@/components/athlete/ProgressReport";
import StudyPanel from "@/components/athlete/StudyPanel";
import { useHubCopy, protocolText } from "@/components/athlete/copy";
import { usePerfCopy } from "@/lib/performance/copy";
import { isoDay, pitWall } from "@/lib/performance/metrics";
import PitWall, { StatusLight } from "@/components/performance/PitWall";
import Telemetry from "@/components/performance/Telemetry";
import SetupSheet from "@/components/performance/SetupSheet";
import RaceWeekend from "@/components/performance/RaceWeekend";
import SeasonPlanner from "@/components/performance/SeasonPlanner";
import SessionDialog from "@/components/performance/SessionDialog";
import CrewLinks from "@/components/performance/CrewLinks";
import RaceRehearsal from "@/components/performance/RaceRehearsal";

const TABS = [
  { id: "pit", icon: Gauge },
  { id: "telemetry", icon: Activity },
  { id: "setup", icon: SlidersHorizontal },
  { id: "race", icon: Flag },
  { id: "season", icon: CalendarRange },
  { id: "simulator", icon: Cpu },
  { id: "crew", icon: Users },
] as const;
type Tab = (typeof TABS)[number]["id"];
const isTab = (s: string): s is Tab => TABS.some((t) => t.id === s);

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-h3">{title}</h2>
        {intro && (
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {intro}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

/**
 * The Performance Center (formerly the Athlete Hub): a development hub run
 * like a race team's. Pit wall, telemetry, setup sheet (performance
 * profile), race weekend (plans, pre-race check, debrief), season plan,
 * simulator (mental training) and pit crew (sharing, assessments, report).
 */
const AthleteHub = () => {
  const { user } = useAuth();
  const { locale } = useLocale();
  const c = useHubCopy();
  const pc = usePerfCopy();
  const hub = useAthleteHub();
  const perf = usePerformance();
  const { checkins, protocols, journal, goals, competitions, completions } =
    hub;
  const [tab, setTab] = useState<Tab>("pit");
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null);

  // Deep links: /athlete-hub#telemetry opens that tab.
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.slice(1);
      if (isTab(h)) setTab(h);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const go = (t: Tab) => {
    setTab(t);
    history.pushState(null, "", `#${t}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const wall = useMemo(
    () => pitWall({ checkins, sessions: perf.sessions, competitions }),
    [checkins, perf.sessions, competitions],
  );
  const doneToday =
    !!checkins[0] &&
    isoDay(new Date(checkins[0].created_at)) === isoDay(new Date());
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
          <h1 className="text-h2 mb-2">{pc.signIn}</h1>
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

  const name =
    (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "";
  const lights = wall.lights;

  return (
    <div className="min-h-screen">
      {/* Garage: the athlete, the three lights, the next race. */}
      <section
        className="relative overflow-hidden bg-[#0b0c10] text-white print:hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 85% 0%, rgba(255,179,0,0.18), transparent 45%), radial-gradient(circle at 0% 100%, rgba(109,15,34,0.55), transparent 50%), repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 10px)",
        }}
      >
        <div className="container-custom relative space-y-6 py-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className="border-white/20 bg-white/5 text-white/80"
            >
              <Gauge className="me-1.5 h-3.5 w-3.5 text-primary" />
              {pc.eyebrow}
            </Badge>
            {name && <span className="text-sm text-white/60">{name}</span>}
          </div>
          <div className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3">
              <h1 className="font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
                {pc.title}
              </h1>
              <p className="max-w-xl text-white/70">{pc.subtitle}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {(["readiness", "load", "recovery"] as const).map((k) => (
                <StatusLight
                  key={k}
                  dark
                  label={pc.lights[k]}
                  light={lights[k]}
                  state={pc.lightState[lights[k]]}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <nav
        aria-label={pc.eyebrow}
        className="sticky top-16 z-20 border-b border-border/60 bg-background/90 backdrop-blur print:hidden"
      >
        <div
          role="tablist"
          className="container-custom flex gap-1 overflow-x-auto py-2"
        >
          {TABS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => go(id)}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm transition ${tab === id ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-muted"}`}
            >
              <Icon className="h-4 w-4" />
              {pc.tabs[id]}
            </button>
          ))}
        </div>
      </nav>

      <div className="py-8 sm:py-10">
        <div className="container-custom space-y-12">
          {tab === "pit" && (
            <PitWall
              c={pc}
              wall={wall}
              checkedInToday={doneToday}
              onCheckin={() => setCheckinOpen(true)}
              onLogSession={() => setSessionOpen(true)}
              onGoto={go}
            />
          )}

          {tab === "telemetry" && (
            <Telemetry
              c={pc}
              checkins={checkins}
              sessions={perf.sessions}
              onRemoveSession={(id) => perf.removeSession(id)}
            />
          )}

          {tab === "setup" && (
            <Section title={pc.setupTitle}>
              <SetupSheet
                c={pc}
                profiles={perf.profiles}
                protocols={protocols}
                protocolTitle={(p) => protocolText(c, p).title}
                onOpenProtocol={setActiveProtocol}
                onSave={perf.saveProfile}
              />
            </Section>
          )}

          {tab === "race" && (
            <Section title={pc.raceTitle}>
              <RaceWeekend
                c={pc}
                competitions={competitions}
                onSave={hub.updateCompetition}
              >
                <CompetitionsPanel
                  competitions={competitions}
                  onAdd={hub.addCompetition}
                  onUpdate={hub.updateCompetition}
                  onRemove={hub.removeCompetition}
                />
              </RaceWeekend>
            </Section>
          )}

          {tab === "season" && (
            <Section title={pc.seasonTitle}>
              <SeasonPlanner
                c={pc}
                phases={perf.phases}
                competitions={competitions}
                onAdd={perf.addPhase}
                onRemove={(id) => perf.removePhase(id)}
              />
            </Section>
          )}

          {tab === "simulator" && (
            <>
              <Section title={pc.simulatorTitle} intro={pc.simulatorIntro}>
                <RaceRehearsal
                  c={pc}
                  competitions={competitions}
                  onLog={perf.addSession}
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {protocols.map((p) => {
                    const text = protocolText(c, p);
                    const n = monthCount.get(p.id) ?? 0;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setActiveProtocol(p)}
                        className="glass-card group flex flex-col p-5 text-start transition-all hover:shadow-glass-hover"
                      >
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {c.categories[p.category] ?? p.category}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            <Clock className="mr-1 h-3 w-3" />
                            {p.duration_minutes} {c.minutes}
                          </Badge>
                        </div>
                        <h3 className="mb-2 font-semibold text-foreground transition-colors group-hover:text-primary">
                          {text.title}
                        </h3>
                        <p className="line-clamp-3 text-xs text-muted-foreground">
                          {text.description}
                        </p>
                        {n > 0 && (
                          <p className="mt-3 text-xs font-medium text-primary">
                            {c.doneThisMonth(n)}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Section>
              <Section title={c.modules[3]}>
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <JournalPanel
                    entries={journal}
                    onAdd={hub.addJournalEntry}
                    onSynthesize={hub.synthesizeEntry}
                  />
                  <Link
                    to={addLocalePrefix("/ai-assistant", locale)}
                    className="glass-card group block self-start p-6 transition-all hover:shadow-glass-hover"
                  >
                    <MessageCircle className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                    <p className="font-semibold text-foreground">{c.aiCoach}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.aiCoachDesc}
                    </p>
                  </Link>
                </div>
              </Section>
              <Section title={c.modules[4]}>
                <GoalsPanel
                  goals={goals}
                  onAdd={hub.addGoal}
                  onUpdate={hub.updateGoal}
                />
              </Section>
            </>
          )}

          {tab === "crew" && (
            <>
              <Section title={pc.crewTitle} intro={pc.crewIntro}>
                <SharePanel
                  shares={hub.shares}
                  candidates={hub.candidates}
                  onSet={hub.setShare}
                />
                <CrewLinks
                  c={pc}
                  links={perf.crew}
                  onAdd={perf.addCrewLink}
                  onRevoke={(id) => perf.revokeCrewLink(id)}
                />
              </Section>
              <Section title={c.modules[7]}>
                <AssessmentsPanel assessments={hub.assessments} />
              </Section>
              <section id="study" className="scroll-mt-32">
                <StudyPanel />
              </section>
              <Section title={c.report}>
                <ProgressReport
                  name={name}
                  checkins={checkins}
                  completions={completions}
                  goals={goals}
                  competitions={competitions}
                  journal={journal}
                />
              </Section>
            </>
          )}
        </div>
      </div>

      <DailyCheckinDialog
        open={checkinOpen}
        onOpenChange={setCheckinOpen}
        onSubmit={hub.submitCheckin}
      />
      <SessionDialog
        c={pc}
        open={sessionOpen}
        onOpenChange={setSessionOpen}
        onSave={perf.addSession}
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
