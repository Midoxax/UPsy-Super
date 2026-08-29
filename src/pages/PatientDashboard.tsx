import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ScrollReveal from "@/components/ScrollReveal";
import MaroonDivider from "@/components/ui/maroon-divider";
import {
  Heart, Brain, Calendar, TrendingUp, Smile, Frown, Meh,
  BarChart3, BookOpen, Plus, ChevronRight, Zap, Moon, Sun, Award,
  FileText, PenSquare, User, CreditCard,
} from "lucide-react";
import { ListChecks, LogOut, ShieldCheck } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import UpcomingSessionsCard from "@/components/dashboard/UpcomingSessionsCard";
import PendingInvitationsCard from "@/components/dashboard/PendingInvitationsCard";
import AnamnesisCard from "@/components/dashboard/AnamnesisCard";
import CertificatesTab from "@/components/dashboard/CertificatesTab";
import JournalTab from "@/components/dashboard/JournalTab";
import DocumentsTab from "@/components/dashboard/DocumentsTab";
import { ClientBillingTab } from "@/components/dashboard/ClientBillingTab";
import TodaysStateCard from "@/components/dashboard/TodaysStateCard";
import MentalPerformanceScore from "@/components/dashboard/MentalPerformanceScore";
import SessionsTimeline from "@/components/dashboard/SessionsTimeline";
import RecommendationsRail from "@/components/dashboard/RecommendationsRail";
import CrisisModal from "@/components/dashboard/CrisisModal";
import { GamificationPanel } from "@/components/GamificationPanel";
import ReferralCard from "@/components/dashboard/ReferralCard";
import ContinueLearningCard from "@/components/dashboard/ContinueLearningCard";
import HomeworkTab from "@/components/dashboard/HomeworkTab";
import ClientProgressTab from "@/components/dashboard/ClientProgressTab";
import DischargeTab from "@/components/dashboard/DischargeTab";
import DataPrivacyTab from "@/components/dashboard/DataPrivacyTab";
import DailyChallengeCard from "@/components/dashboard/DailyChallengeCard";
import LeaderboardCard from "@/components/dashboard/LeaderboardCard";
import { useAwardXp } from "@/hooks/useGamification";
import { useNudges } from "@/hooks/useNudges";
import { useCrisisScreening } from "@/hooks/useCrisisScreening";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";

interface MoodEntry {
  id: string;
  mood_score: number;
  energy_level: number | null;
  stress_level: number | null;
  notes: string | null;
  recorded_at: string;
}

const PatientDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLocale();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [moodScore, setMoodScore] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(0);
  const [stressLevel, setStressLevel] = useState(0);
  const [notes, setNotes] = useState("");
  const [assessmentResults, setAssessmentResults] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  useNudges();
  const crisis = useCrisisScreening();
  const awardXp = useAwardXp();

  const MOOD_ICONS = [
    { score: 1, icon: Frown, label: t('mood.veryLow'), color: "text-destructive" },
    { score: 2, icon: Frown, label: t('mood.low'), color: "text-orange-400" },
    { score: 3, icon: Meh, label: t('mood.neutral'), color: "text-muted-foreground" },
    { score: 4, icon: Smile, label: t('mood.good'), color: "text-u-turquoise" },
    { score: 5, icon: Smile, label: t('mood.great'), color: "text-primary" },
  ];

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    const [moodRes, assessRes, enrollRes] = await Promise.all([
      supabase.from("mood_entries").select("*").eq("user_id", user!.id).order("recorded_at", { ascending: false }).limit(30),
      supabase.from("assessment_results").select("*, assessment:assessments(title, category)").eq("user_id", user!.id).order("completed_at", { ascending: false }).limit(5),
      supabase.from("course_enrollments").select("*, course:courses(title, category, duration_hours)").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5),
    ]);
    if (moodRes.data) setEntries(moodRes.data as MoodEntry[]);
    if (assessRes.data) setAssessmentResults(assessRes.data);
    if (enrollRes.data) setEnrollments(enrollRes.data);
  };

  const submitMood = async () => {
    if (!user || moodScore === 0) return;
    const { error } = await supabase.from("mood_entries").insert({
      user_id: user.id,
      mood_score: moodScore,
      energy_level: energyLevel || null,
      stress_level: stressLevel || null,
      notes: notes || null,
    });
    if (error) {
      toast({ title: "Error", description: "Failed to save mood entry", variant: "destructive" });
    } else {
      awardXp.mutate({ action: "mood_log", xp: 10 });
      setShowForm(false);
      setMoodScore(0);
      setEnergyLevel(0);
      setStressLevel(0);
      setNotes("");
      loadData();
    }
  };

  const chartData = [...entries].reverse().map((e) => ({
    date: new Date(e.recorded_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
    mood: e.mood_score,
    energy: e.energy_level || 0,
    stress: e.stress_level || 0,
  }));

  const avgMood = entries.length > 0 ? (entries.reduce((s, e) => s + e.mood_score, 0) / entries.length).toFixed(1) : "—";
  const avgStress = entries.filter((e) => e.stress_level).length > 0
    ? (entries.filter((e) => e.stress_level).reduce((s, e) => s + (e.stress_level || 0), 0) / entries.filter((e) => e.stress_level).length).toFixed(1)
    : "—";

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-md">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-h2 mb-2">{t('auth.signInRequired')}</h2>
          <p className="text-muted-foreground mb-6">{t('auth.signInRequiredDesc')}</p>
          <SocialAuthButtons className="mb-4 text-left" />
          <Button variant="primary" asChild className="w-full"><Link to="/auth">{t('auth.signIn')}</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <CrisisModal open={crisis.open} onOpenChange={crisis.setOpen} riskLevel={crisis.risk} />

      {/* Hero */}
      <section className="hero-neural-bg relative py-8">
        <div className="container-custom relative z-10">
          <ScrollReveal>
            <div className="space-y-2">
              <h1 className="text-h1">{t('dashboard.welcomeBack')}</h1>
              <p className="text-muted-foreground">{t('dashboard.welcomeSubtitle')}</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <MaroonDivider />

      <section className="section-spacing liquid-bg">
        <div className="container-custom">
          <div id="patient-tabs-top" className="scroll-mt-20" />
          <Tabs
            defaultValue="overview"
            className="space-y-6"
            onValueChange={() => {
              requestAnimationFrame(() => {
                document
                  .getElementById("patient-tabs-top")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              });
            }}
          >
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="overview" className="gap-1.5">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="journal" className="gap-1.5">
                <PenSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Journal</span>
              </TabsTrigger>
              <TabsTrigger value="assessments" className="gap-1.5">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Assessments</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-1.5">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Documents</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-1.5">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
              <TabsTrigger value="certificates" className="gap-1.5">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">Certificates</span>
              </TabsTrigger>
              <TabsTrigger value="homework" className="gap-1.5">
                <ListChecks className="h-4 w-4" />
                <span className="hidden sm:inline">Homework</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="gap-1.5">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Progress</span>
              </TabsTrigger>
              <TabsTrigger value="discharge" className="gap-1.5">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Records</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Phase 3: Today's state + MPS */}
              <div className="grid lg:grid-cols-2 gap-6">
                <TodaysStateCard onLogged={() => setRefreshKey((k) => k + 1)} />
                <MentalPerformanceScore refreshKey={refreshKey} />
              </div>

              {/* Phase 3: Sessions timeline + recommendations */}
              <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
                <SessionsTimeline />
                <RecommendationsRail />
              </div>

              {/* Phase 3: Gamification (discreet) + Referral loop */}
              <div className="grid lg:grid-cols-2 gap-6">
                <DailyChallengeCard />
                <ReferralCard />
              </div>
              <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
                <GamificationPanel />
                <LeaderboardCard />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: t('dashboard.avgMood'), value: avgMood, icon: Smile, accent: "text-primary" },
                  { label: t('dashboard.avgStress'), value: avgStress, icon: Zap, accent: "text-destructive" },
                  { label: t('dashboard.entries'), value: entries.length.toString(), icon: BarChart3, accent: "text-accent" },
                  { label: t('dashboard.assessments'), value: assessmentResults.length.toString(), icon: Brain, accent: "text-primary" },
                ].map((stat) => (
                  <div key={stat.label} className="glass-card p-5 text-center">
                    <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.accent}`} />
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Mood Tracker + Chart */}
              <div className="grid lg:grid-cols-[1fr_380px] gap-6">
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-h3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      {t('dashboard.moodTrends')}
                    </h2>
                    <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      {t('dashboard.logMood')}
                    </Button>
                  </div>
                  {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(42,100%,50%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(42,100%,50%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(0,0%,45%)" }} />
                        <YAxis domain={[1, 5]} tick={{ fontSize: 11, fill: "hsl(0,0%,45%)" }} />
                        <Tooltip contentStyle={{ background: "hsl(0,0%,13%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                        <Area type="monotone" dataKey="mood" stroke="hsl(42,100%,50%)" fill="url(#moodGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                      {t('dashboard.logMinEntries')}
                    </div>
                  )}
                </div>

                {/* Log Mood Form */}
                <div className="glass-card p-6 space-y-5">
                  <h3 className="text-h3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    {showForm ? t('dashboard.howFeeling') : t('dashboard.quickCheckIn')}
                  </h3>

                  {!showForm ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">{t('dashboard.tapToLog')}</p>
                      <div className="flex justify-between">
                        {MOOD_ICONS.map((m) => (
                          <button
                            key={m.score}
                            className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:bg-muted/30"
                            onClick={() => { setMoodScore(m.score); setShowForm(true); }}
                          >
                            <m.icon className={`w-8 h-8 ${m.color}`} />
                            <span className="text-[10px] text-muted-foreground">{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        {MOOD_ICONS.map((m) => (
                          <button
                            key={m.score}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${moodScore === m.score ? "ring-2 ring-primary bg-primary/10" : "opacity-40"}`}
                            onClick={() => setMoodScore(m.score)}
                          >
                            <m.icon className={`w-7 h-7 ${m.color}`} />
                          </button>
                        ))}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Sun className="w-3 h-3" /> {t('dashboard.energyLevel')}</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((v) => (
                            <button key={v} className={`flex-1 h-8 rounded-lg text-xs font-medium transition-all ${energyLevel === v ? "bg-accent text-accent-foreground" : "bg-muted/30 text-muted-foreground"}`}
                              onClick={() => setEnergyLevel(v)}>{v}</button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Zap className="w-3 h-3" /> {t('dashboard.stressLevel')}</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((v) => (
                            <button key={v} className={`flex-1 h-8 rounded-lg text-xs font-medium transition-all ${stressLevel === v ? "bg-destructive text-destructive-foreground" : "bg-muted/30 text-muted-foreground"}`}
                              onClick={() => setStressLevel(v)}>{v}</button>
                          ))}
                        </div>
                      </div>

                      <textarea placeholder="Notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-xl bg-muted/30 border border-border px-3 py-2 text-sm" />
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="flex-1">{t('dashboard.cancel')}</Button>
                        <Button variant="primary" size="sm" onClick={submitMood} disabled={moodScore === 0} className="flex-1">{t('dashboard.save')}</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Sessions */}
              <UpcomingSessionsCard />

              {/* Pending session invitations from psychologists */}
              <PendingInvitationsCard />

              {/* Clinical Intake */}
              <AnamnesisCard />

              {/* Continue learning */}
              <ContinueLearningCard path="mental-health" />

              {/* Assessments + Courses */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-h3 flex items-center gap-2"><Brain className="w-5 h-5 text-primary" /> {t('dashboard.assessments')}</h3>
                    <Button variant="ghost" size="sm" asChild><Link to="/assessments">{t('dashboard.viewAll')} <ChevronRight className="ml-1 h-3 w-3" /></Link></Button>
                  </div>
                  {assessmentResults.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground mb-4">{t('dashboard.noAssessments')}</p>
                      <Button variant="secondary" size="sm" asChild><Link to="/assessments">{t('dashboard.takeAssessment')}</Link></Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assessmentResults.map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                          <div>
                            <p className="text-sm font-medium text-foreground">{r.assessment?.title}</p>
                            <p className="text-xs text-muted-foreground">{new Date(r.completed_at).toLocaleDateString()}</p>
                          </div>
                          {r.total_score !== null && (
                            <span className="text-lg font-bold text-primary">{r.total_score}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-h3 flex items-center gap-2"><BookOpen className="w-5 h-5 text-accent" /> {t('dashboard.courses')}</h3>
                    <Button variant="ghost" size="sm" asChild><Link to="/resources">{t('dashboard.browse')} <ChevronRight className="ml-1 h-3 w-3" /></Link></Button>
                  </div>
                  {enrollments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground mb-4">{t('dashboard.noCourses')}</p>
                      <Button variant="secondary" size="sm" asChild><Link to="/resources">{t('dashboard.exploreCourses')}</Link></Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {enrollments.map((e: any) => (
                        <div key={e.id} className="p-3 rounded-xl bg-muted/20">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-foreground">{e.course?.title}</p>
                            <span className="text-xs text-primary font-medium">{Math.round(e.progress_percent || 0)}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${e.progress_percent || 0}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: t('dashboard.takeAssessmentAction'), icon: Brain, href: "/assessments", accent: "text-primary" },
                  { label: t('dashboard.aiAssistant'), icon: Heart, href: "/ai-assistant", accent: "text-accent" },
                  { label: t('dashboard.findPsychologist'), icon: Calendar, href: "/psychologists", accent: "text-primary" },
                  { label: t('dashboard.myCertificates'), icon: Award, href: "#", accent: "text-primary" },
                ].map((action) => (
                  <Link key={action.label} to={action.href} className="glass-card p-5 text-center group hover:shadow-glass-hover transition-all">
                    <action.icon className={`w-7 h-7 mx-auto mb-2 ${action.accent} group-hover:scale-110 transition-transform`} />
                    <p className="text-sm font-medium text-foreground">{action.label}</p>
                  </Link>
                ))}
              </div>
            </TabsContent>

            {/* Journal Tab */}
            <TabsContent value="journal">
              <JournalTab />
            </TabsContent>

            {/* Assessments Tab */}
            <TabsContent value="assessments" className="space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-h3 flex items-center gap-2"><Brain className="w-5 h-5 text-primary" /> Assessment History</h2>
                  <Button variant="primary" size="sm" asChild><Link to="/assessments">Take Assessment</Link></Button>
                </div>
                {assessmentResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-muted-foreground">No assessments completed yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assessmentResults.map((r: any) => (
                      <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/20">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{r.assessment?.title}</p>
                          <p className="text-xs text-muted-foreground">{new Date(r.completed_at).toLocaleDateString()} · {r.assessment?.category}</p>
                          {r.interpretation && <p className="text-xs text-muted-foreground mt-1">{r.interpretation}</p>}
                        </div>
                        {r.total_score !== null && (
                          <div className="text-center">
                            <span className="text-2xl font-bold text-primary">{r.total_score}</span>
                            <p className="text-[10px] text-muted-foreground">Score</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <DocumentsTab />
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing">
              <ClientBillingTab />
            </TabsContent>

            {/* Certificates Tab */}
            <TabsContent value="certificates">
              <CertificatesTab />
            </TabsContent>

            <TabsContent value="homework">
              <HomeworkTab role="client" />
            </TabsContent>

            <TabsContent value="progress">
              <ClientProgressTab role="client" />
            </TabsContent>

            <TabsContent value="discharge">
              <DischargeTab role="client" />
            </TabsContent>

            <TabsContent value="privacy">
              <DataPrivacyTab />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default PatientDashboard;
