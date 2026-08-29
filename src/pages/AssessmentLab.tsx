import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import ScrollReveal from "@/components/ScrollReveal";
import MaroonDivider from "@/components/ui/maroon-divider";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import {
  Brain, CheckCircle2, ArrowRight, ArrowLeft, Clock, Shield,
  BarChart3, ChevronRight, AlertTriangle,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";

interface Assessment {
  id: string;
  title: string;
  description: string;
  category: string;
  question_count: number;
  estimated_minutes: number;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: { value: number; label: string }[];
  dimension: string;
  order_index: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  general: "text-u-clinical",
  athlete: "text-primary",
  organization: "text-u-turquoise",
  personality: "text-u-lavender",
};

const AssessmentLab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("assessments").select("*").eq("is_published", true).order("category").then(({ data }) => {
      if (data) setAssessments(data as Assessment[]);
    });
  }, []);

  // Auto-start assessment from URL param (e.g. after auth redirect)
  useEffect(() => {
    const startId = searchParams.get("start");
    if (startId && user && assessments.length > 0 && !selectedAssessment) {
      const found = assessments.find((a) => a.id === startId);
      if (found) {
        startAssessment(found);
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, user, assessments]);

  const startAssessment = async (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    const { data } = await supabase
      .from("assessment_questions")
      .select("*")
      .eq("assessment_id", assessment.id)
      .order("order_index");
    if (data && data.length > 0) {
      setQuestions(data.map((q: any) => ({ ...q, options: q.options || [] })));
      setCurrentQ(0);
      setAnswers({});
      setShowResults(false);
    } else {
      toast({ title: t('assessments.noQuestions'), description: t('assessments.noQuestionsDesc'), variant: "destructive" });
    }
  };

  const selectAnswer = (questionId: string, value: number) => {
    setAnswers((a) => ({ ...a, [questionId]: value }));
  };

  const submitAssessment = async () => {
    if (!user || !selectedAssessment) return;
    setLoading(true);

    const dimensionScores: Record<string, { total: number; count: number }> = {};
    let totalScore = 0;
    questions.forEach((q) => {
      const val = answers[q.id] || 0;
      totalScore += val;
      if (q.dimension) {
        if (!dimensionScores[q.dimension]) dimensionScores[q.dimension] = { total: 0, count: 0 };
        dimensionScores[q.dimension].total += val;
        dimensionScores[q.dimension].count += 1;
      }
    });

    const scores = Object.fromEntries(
      Object.entries(dimensionScores).map(([dim, { total, count }]) => [dim, { score: total, max: count * 3, percent: Math.round((total / (count * 3)) * 100) }])
    );

    const maxPossible = questions.length * 3;
    const percent = Math.round((totalScore / maxPossible) * 100);
    let interpretation = t('assessments.resultMinimal');
    if (percent > 70) interpretation = t('assessments.resultSignificant');
    else if (percent > 40) interpretation = t('assessments.resultModerate');

    const resultData = {
      user_id: user.id,
      assessment_id: selectedAssessment.id,
      answers,
      scores,
      total_score: totalScore,
      interpretation,
    };

    const { error } = await supabase.from("assessment_results").insert(resultData);
    if (error) {
      toast({ title: t('common.error'), description: t('assessments.noQuestionsDesc'), variant: "destructive" });
    } else {
      setResult({ ...resultData, percent });
      setShowResults(true);
    }
    setLoading(false);
  };

  const categoryLabel = (cat: string) => {
    if (cat === "general") return t('assessments.generalMentalHealth');
    if (cat === "athlete") return t('assessments.athletePerformance');
    if (cat === "organization") return t('assessments.organizational');
    if (cat === "personality") return t('assessments.personality') || "Personality & Traits";
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  // Assessment list view
  if (!selectedAssessment) {
    const categories = [...new Set(assessments.map((a) => a.category))];
    return (
      <div className="min-h-screen">
        <section className="hero-neural-bg relative py-16">
          <div className="container-custom relative z-10">
            <ScrollReveal>
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(46,94,153,0.15)", border: "2px solid rgba(46,94,153,0.3)" }}>
                  <Brain className="w-8 h-8 text-u-clinical" />
                </div>
                <h1 className="text-display">{t('assessments.labTitle')}</h1>
                <p className="text-body text-muted-foreground">{t('assessments.labSubtitle')}</p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <MaroonDivider />

        <section className="section-spacing liquid-bg">
          <div className="container-custom space-y-10">
            {categories.map((cat) => (
              <div key={cat}>
                <h2 className="text-h2 mb-6 capitalize flex items-center gap-2">
                  <Brain className={`w-5 h-5 ${CATEGORY_COLORS[cat] || "text-primary"}`} />
                  {categoryLabel(cat)} {t('assessments.assessments')}
                </h2>
                <StaggerContainer staggerDelay={0.06}>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assessments.filter((a) => a.category === cat).map((assessment) => (
                      <StaggerItem key={assessment.id}>
                        <div className="glass-card p-6 h-full flex flex-col group hover:shadow-glass-hover transition-all">
                          <Badge variant="outline" className="self-start text-xs mb-3 capitalize">{assessment.category}</Badge>
                          <h3 className="font-semibold text-foreground text-lg mb-2">{assessment.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 flex-1">{assessment.description}</p>
                          <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {assessment.question_count} {t('common.questions')}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{assessment.estimated_minutes} {t('common.minutes')}</span>
                          </div>
                          <Button variant="primary" size="sm" onClick={() => user ? startAssessment(assessment) : navigate(addLocalePrefix("/auth", locale) + "?redirect=" + encodeURIComponent("/assessments?start=" + assessment.id))} className="w-full">
                            {user ? t('assessments.startAssessment') : t('assessments.signInToStart')}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </StaggerItem>
                    ))}
                  </div>
                </StaggerContainer>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
              {[
                { icon: Shield, label: t('assessments.evidenceBasedTools') },
                { icon: Brain, label: t('assessments.clinicallyValidated') },
                { icon: CheckCircle2, label: t('assessments.confidentialResults') },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-u-clinical" />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Results view
  if (showResults && result) {
    const severity = result.percent > 70 ? "high" : result.percent > 40 ? "moderate" : "low";
    return (
      <div className="min-h-screen">
        <section className="hero-neural-bg relative py-16">
          <div className="container-custom relative z-10">
            <div className="max-w-xl mx-auto text-center space-y-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{
                background: severity === "high" ? "rgba(220,38,38,0.15)" : severity === "moderate" ? "rgba(255,179,0,0.15)" : "rgba(46,184,168,0.15)",
                border: `2px solid ${severity === "high" ? "rgba(220,38,38,0.3)" : severity === "moderate" ? "rgba(255,179,0,0.3)" : "rgba(46,184,168,0.3)"}`,
              }}>
                {severity === "high" ? <AlertTriangle className="w-10 h-10 text-destructive" /> :
                 severity === "moderate" ? <BarChart3 className="w-10 h-10 text-primary" /> :
                 <CheckCircle2 className="w-10 h-10 text-u-turquoise" />}
              </div>
              <h1 className="text-h1">{t('assessments.yourResults')}</h1>
              <p className="text-lg text-muted-foreground">{selectedAssessment.title}</p>

              <div className="glass-card p-6 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('assessments.totalScore')}</span>
                  <span className="text-2xl font-bold text-foreground">{result.total_score} / {questions.length * 3}</span>
                </div>
                <Progress value={result.percent} className="h-3" />
                <p className="text-sm text-muted-foreground leading-relaxed">{result.interpretation}</p>

                {Object.entries(result.scores as Record<string, any>).map(([dim, data]: [string, any]) => (
                  <div key={dim} className="flex items-center justify-between py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <span className="text-sm text-muted-foreground capitalize">{dim}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-u-clinical" style={{ width: `${data.percent}%` }} /></div>
                      <span className="text-sm font-medium text-foreground">{data.percent}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                {severity !== "low" && (
                  <Button variant="primary" size="lg" asChild>
                    <Link to={addLocalePrefix("/psychologists", locale)}>{t('assessments.findPsychologist')}</Link>
                  </Button>
                )}
                <Button variant="secondary" size="lg" asChild>
                  <Link to={addLocalePrefix("/resources", locale)}>{t('assessments.explorePrograms')}</Link>
                </Button>
                <Button variant="ghost" size="lg" onClick={() => { setSelectedAssessment(null); setShowResults(false); }}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> {t('assessments.backToAssessments')}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Question view
  const question = questions[currentQ];
  const progress = ((currentQ + (answers[question?.id] !== undefined ? 1 : 0)) / questions.length) * 100;
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="min-h-screen">
      <SEOHead
        path="/assessment-lab"
        title="Assessment Lab — Clinical Self-Assessments | U.Psy"
        description="Take validated clinical screenings (GAD-7, PHQ-9 and more) on U.Psy and get an immediate, evidence-based snapshot of your mental health."
      />
      <div className="sticky top-16 z-30 py-3" style={{ background: "rgba(26,26,26,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container-custom">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => currentQ > 0 ? setCurrentQ(currentQ - 1) : setSelectedAssessment(null)} className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" /> {t('common.back')}
            </Button>
            <div className="flex-1"><Progress value={progress} className="h-2" /></div>
            <span className="text-xs text-muted-foreground">{currentQ + 1} / {questions.length}</span>
          </div>
        </div>
      </div>

      <section className="hero-neural-bg relative py-16 md:py-24">
        <div className="container-custom relative z-10">
          <div className="max-w-lg mx-auto space-y-6">
            <p className="text-xs text-muted-foreground text-center uppercase tracking-wide">{selectedAssessment.title}</p>
            <h2 className="text-h2 text-center">{question?.question_text}</h2>
            <p className="text-xs text-center text-muted-foreground">{t('assessments.overLastTwoWeeks')}</p>

            <div className="space-y-3">
              {question?.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectAnswer(question.id, opt.value)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-200 ${
                    answers[question.id] === opt.value ? "ring-2 ring-u-clinical bg-u-clinical/10" : "hover:bg-muted/40"
                  }`}
                  style={answers[question.id] === opt.value ? {} : { background: "var(--glass-bg)", border: "var(--glass-border)" }}
                >
                  <span className={`font-medium text-sm ${answers[question.id] === opt.value ? "text-u-clinical" : "text-foreground"}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-center pt-4 gap-3">
              {currentQ < questions.length - 1 ? (
                <Button variant="primary" size="lg" onClick={() => setCurrentQ(currentQ + 1)} disabled={answers[question?.id] === undefined}>
                  {t('common.next')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button variant="primary" size="lg" onClick={submitAssessment} disabled={!allAnswered || loading}>
                  {loading ? t('assessments.calculating') : t('assessments.seeResults')} <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AssessmentLab;
