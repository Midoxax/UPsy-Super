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
  Brain,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Shield,
  BarChart3,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import CrisisModal from "@/components/intake/CrisisModal";
import { INSTRUMENTS_BY_CODE } from "@/lib/psychometrics/instruments";
import {
  hasOfficialText,
  optionsFor,
  scoreInstrument,
  tr,
} from "@/lib/psychometrics/score";
import type { Instrument, Lang } from "@/lib/psychometrics/types";

interface Assessment {
  id: string;
  /** Set for validated instruments scored by src/lib/psychometrics. */
  code?: string | null;
  is_validated?: boolean | null;
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

type Level = "low" | "moderate" | "high";

// Validated cut-offs for the instruments we seed (Kroenke 2001; Spitzer 2006).
// The assessments table has no slug/code column, so match on the title.
const INSTRUMENT_BANDS: {
  match: RegExp;
  bands: { max: number; labelKey: string; level: Level }[];
}[] = [
  {
    match: /PHQ-?9/i,
    bands: [
      { max: 4, labelKey: "assessments.severityMinimal", level: "low" },
      { max: 9, labelKey: "assessments.severityMild", level: "moderate" },
      { max: 14, labelKey: "assessments.severityModerate", level: "high" },
      {
        max: 19,
        labelKey: "assessments.severityModeratelySevere",
        level: "high",
      },
      { max: 27, labelKey: "assessments.severitySevere", level: "high" },
    ],
  },
  {
    match: /GAD-?7/i,
    bands: [
      { max: 4, labelKey: "assessments.severityMinimal", level: "low" },
      { max: 9, labelKey: "assessments.severityMild", level: "moderate" },
      { max: 14, labelKey: "assessments.severityModerate", level: "high" },
      { max: 21, labelKey: "assessments.severitySevere", level: "high" },
    ],
  },
];

const isPhq9 = (a: { title: string } | null) => !!a && /PHQ-?9/i.test(a.title);

const LAB_COPY = {
  en: {
    validated: "Validated instrument",
    selfCheck: "Indicative self-check",
    screening:
      "A screening result, not a diagnosis. Only a clinician can confirm it.",
    sourceLabel: "Source:",
    selfCheckNote:
      "Indicative self-check designed by U.Psy. It is not a validated clinical scale: use it to reflect, not to conclude.",
    noOfficialTranslation:
      "No validated Arabic version is available yet, so the official French wording is shown.",
  },
  fr: {
    validated: "Instrument validé",
    selfCheck: "Auto-évaluation indicative",
    screening:
      "Un résultat de dépistage, pas un diagnostic. Seul un clinicien peut le confirmer.",
    sourceLabel: "Source :",
    selfCheckNote:
      "Auto-évaluation indicative conçue par U.Psy. Ce n'est pas une échelle clinique validée : elle sert à réfléchir, pas à conclure.",
    noOfficialTranslation:
      "Aucune version arabe validée n'est encore disponible : la formulation officielle française est affichée.",
  },
  ar: {
    validated: "أداة مُعتمَدة علمياً",
    selfCheck: "تقييم ذاتي استرشادي",
    screening: "نتيجة فحص أولي وليست تشخيصاً. وحده المختص يمكنه تأكيدها.",
    sourceLabel: "المصدر:",
    selfCheckNote:
      "تقييم ذاتي استرشادي من إعداد U.Psy. ليس مقياساً سريرياً مُعتمَداً: استعمله للتأمل لا للاستنتاج.",
    noOfficialTranslation:
      "لا تتوفر بعد نسخة عربية مُعتمَدة، لذا تُعرض الصيغة الفرنسية الرسمية.",
  },
};

const AssessmentLab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  // The validated instrument being taken, when the assessment has a code.
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const lang: Lang = locale === "fr" || locale === "ar" ? locale : "en";
  const instrumentFor = (a: Assessment | null) =>
    (a?.code && INSTRUMENTS_BY_CODE[a.code]) || null;

  useEffect(() => {
    void (async () => {
      const [{ data }, { data: qRows }] = await Promise.all([
        supabase
          .from("assessments")
          .select("*")
          .eq("is_published", true)
          .order("category"),
        supabase.from("assessment_questions").select("assessment_id"),
      ]);
      if (!data) return;
      // Hide published assessments that have no questions yet. Validated
      // instruments carry their items in code, not in the database.
      const withQuestions = new Set((qRows || []).map((q) => q.assessment_id));
      setAssessments(
        (data as Assessment[]).filter(
          (a) => withQuestions.has(a.id) || !!instrumentFor(a),
        ),
      );
    })();
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
    const inst = instrumentFor(assessment);
    setInstrument(inst);
    if (inst) {
      setQuestions(
        inst.items.map((item, i) => ({
          id: item.id,
          question_text: tr(item.text, lang),
          question_type: "single_choice",
          options: optionsFor(inst, item).map((o) => ({
            value: o.value,
            label: tr(o.label, lang),
          })),
          dimension: "",
          order_index: i + 1,
        })),
      );
      setCurrentQ(0);
      setAnswers({});
      setShowResults(false);
      return;
    }
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
      toast({
        title: t("assessments.noQuestions"),
        description: t("assessments.noQuestionsDesc"),
        variant: "destructive",
      });
    }
  };

  const selectAnswer = (questionId: string, value: number) => {
    setAnswers((a) => ({ ...a, [questionId]: value }));
  };

  const submitAssessment = async () => {
    if (!user || !selectedAssessment) return;
    setLoading(true);

    if (instrument) {
      const r = scoreInstrument(instrument, answers);
      if (!r.complete) {
        setLoading(false);
        return;
      }
      const subLabels = Object.fromEntries(
        (instrument.subscales ?? []).map((s) => [s.id, tr(s.label, lang)]),
      );
      const scores = Object.fromEntries(
        Object.entries(r.subscales).map(([id, v]) => [
          id,
          {
            score: v.score,
            max: v.max,
            percent: Math.round((v.score / v.max) * 100),
            band: v.band ? tr(v.band.label, lang) : null,
            label: subLabels[id] ?? id,
          },
        ]),
      );
      const totalScore =
        r.total?.score ??
        Object.values(r.subscales).reduce((n, v) => n + v.score, 0);
      const bandText = [
        r.total?.band ? tr(r.total.band.label, lang) : null,
        ...Object.values(scores)
          .filter((v) => v.band)
          .map((v) => `${v.label}: ${v.band}`),
      ]
        .filter(Boolean)
        .join(" · ");
      const resultData = {
        user_id: user.id,
        assessment_id: selectedAssessment.id,
        answers,
        scores,
        total_score: totalScore,
        interpretation: bandText,
      };
      const { error } = await supabase
        .from("assessment_results")
        .insert(resultData);
      if (error) {
        toast({
          title: t("common.error"),
          description: t("assessments.noQuestionsDesc"),
          variant: "destructive",
        });
      } else {
        const crisis = r.flags.some((f) => f.severity === "crisis");
        setResult({
          ...resultData,
          scores,
          percent: r.total
            ? Math.round((r.total.score / r.total.max) * 100)
            : null,
          max: r.total?.max ?? null,
          level: r.level,
          selfHarmRisk: crisis,
          flags: r.flags.map((f) => tr(f.message, lang)),
        });
        setShowResults(true);
        if (crisis) setCrisisOpen(true);
      }
      setLoading(false);
      return;
    }

    const dimensionScores: Record<string, { total: number; count: number }> =
      {};
    let totalScore = 0;
    questions.forEach((q) => {
      const val = answers[q.id] ?? 0;
      totalScore += val;
      if (q.dimension) {
        if (!dimensionScores[q.dimension])
          dimensionScores[q.dimension] = { total: 0, count: 0 };
        dimensionScores[q.dimension].total += val;
        dimensionScores[q.dimension].count += 1;
      }
    });

    // Each item's maximum comes from its own options: assuming 3 understated
    // the maximum of every 1–5 scale and inflated its percentage.
    const itemMax = (q: Question) =>
      Math.max(0, ...q.options.map((o) => o.value));
    const dimMax: Record<string, number> = {};
    questions.forEach((q) => {
      if (q.dimension)
        dimMax[q.dimension] = (dimMax[q.dimension] ?? 0) + itemMax(q);
    });
    const scores = Object.fromEntries(
      Object.entries(dimensionScores).map(([dim, { total }]) => [
        dim,
        {
          score: total,
          max: dimMax[dim],
          percent: dimMax[dim] ? Math.round((total / dimMax[dim]) * 100) : 0,
        },
      ]),
    );

    const maxPossible = questions.reduce((n, q) => n + itemMax(q), 0) || 1;
    const percent = Math.round((totalScore / maxPossible) * 100);
    let level: Level =
      percent > 70 ? "high" : percent > 40 ? "moderate" : "low";
    let bandLabel: string | null = null;
    const legacy = INSTRUMENT_BANDS.find((i) =>
      i.match.test(selectedAssessment.title),
    );
    if (legacy) {
      const band =
        legacy.bands.find((b) => totalScore <= b.max) ??
        legacy.bands[legacy.bands.length - 1];
      level = band.level;
      bandLabel = t(band.labelKey);
    }
    const levelText =
      level === "high"
        ? t("assessments.resultSignificant")
        : level === "moderate"
          ? t("assessments.resultModerate")
          : t("assessments.resultMinimal");
    const interpretation = bandLabel
      ? `${bandLabel} — ${levelText}`
      : levelText;

    // PHQ-9 item 9 (thoughts of death / self-harm): any answer > 0 shows
    // crisis resources, whatever the total score.
    const item9 = isPhq9(selectedAssessment)
      ? questions.find((q) => q.order_index === 9)
      : undefined;
    const selfHarmRisk = !!item9 && (answers[item9.id] ?? 0) > 0;

    const resultData = {
      user_id: user.id,
      assessment_id: selectedAssessment.id,
      answers,
      scores,
      total_score: totalScore,
      interpretation,
    };

    const { error } = await supabase
      .from("assessment_results")
      .insert(resultData);
    if (error) {
      toast({
        title: t("common.error"),
        description: t("assessments.noQuestionsDesc"),
        variant: "destructive",
      });
    } else {
      setResult({
        ...resultData,
        percent,
        max: maxPossible,
        level,
        selfHarmRisk,
      });
      setShowResults(true);
      if (selfHarmRisk) setCrisisOpen(true);
    }
    setLoading(false);
  };

  const categoryLabel = (cat: string) => {
    if (cat === "general") return t("assessments.generalMentalHealth");
    if (cat === "athlete") return t("assessments.athletePerformance");
    if (cat === "organization") return t("assessments.organizational");
    if (cat === "personality")
      return t("assessments.personality") || "Personality & Traits";
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
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{
                    background: "rgba(46,94,153,0.15)",
                    border: "2px solid rgba(46,94,153,0.3)",
                  }}
                >
                  <Brain className="w-8 h-8 text-u-clinical" />
                </div>
                <h1 className="text-display">{t("assessments.labTitle")}</h1>
                <p className="text-body text-muted-foreground">
                  {t("assessments.labSubtitle")}
                </p>
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
                  <Brain
                    className={`w-5 h-5 ${CATEGORY_COLORS[cat] || "text-primary"}`}
                  />
                  {categoryLabel(cat)} {t("assessments.assessments")}
                </h2>
                <StaggerContainer staggerDelay={0.06}>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assessments
                      .filter((a) => a.category === cat)
                      .map((assessment) => {
                        const inst = instrumentFor(assessment);
                        return (
                          <StaggerItem key={assessment.id}>
                            <div className="glass-card p-6 h-full flex flex-col group hover:shadow-glass-hover transition-all">
                              <Badge
                                variant="outline"
                                className={`self-start text-xs mb-3 ${inst ? "border-u-clinical/50 text-u-clinical" : ""}`}
                              >
                                {inst
                                  ? LAB_COPY[lang].validated
                                  : LAB_COPY[lang].selfCheck}
                              </Badge>
                              <h3 className="font-semibold text-foreground text-lg mb-2">
                                {inst ? tr(inst.name, lang) : assessment.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-4 flex-1">
                                {inst
                                  ? tr(inst.summary, lang)
                                  : assessment.description}
                              </p>
                              <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <BarChart3 className="w-3 h-3" />{" "}
                                  {inst
                                    ? inst.items.length
                                    : assessment.question_count}{" "}
                                  {t("common.questions")}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> ~
                                  {inst
                                    ? inst.minutes
                                    : assessment.estimated_minutes}{" "}
                                  {t("common.minutes")}
                                </span>
                              </div>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() =>
                                  user
                                    ? startAssessment(assessment)
                                    : navigate(
                                        addLocalePrefix("/auth", locale) +
                                          "?redirect=" +
                                          encodeURIComponent(
                                            "/assessments?start=" +
                                              assessment.id,
                                          ),
                                      )
                                }
                                className="w-full"
                              >
                                {user
                                  ? t("assessments.startAssessment")
                                  : t("assessments.signInToStart")}
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          </StaggerItem>
                        );
                      })}
                  </div>
                </StaggerContainer>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
              {[
                { icon: Shield, label: t("assessments.evidenceBasedTools") },
                {
                  icon: CheckCircle2,
                  label: t("assessments.confidentialResults"),
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-u-clinical" />
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
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
    const severity: Level = result.level;
    return (
      <div className="min-h-screen">
        <CrisisModal open={crisisOpen} onClose={() => setCrisisOpen(false)} />
        <section className="hero-neural-bg relative py-16">
          <div className="container-custom relative z-10">
            <div className="max-w-xl mx-auto text-center space-y-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                style={{
                  background:
                    severity === "high"
                      ? "rgba(220,38,38,0.15)"
                      : severity === "moderate"
                        ? "rgba(255,179,0,0.15)"
                        : "rgba(46,184,168,0.15)",
                  border: `2px solid ${severity === "high" ? "rgba(220,38,38,0.3)" : severity === "moderate" ? "rgba(255,179,0,0.3)" : "rgba(46,184,168,0.3)"}`,
                }}
              >
                {severity === "high" ? (
                  <AlertTriangle className="w-10 h-10 text-destructive" />
                ) : severity === "moderate" ? (
                  <BarChart3 className="w-10 h-10 text-primary" />
                ) : (
                  <CheckCircle2 className="w-10 h-10 text-u-turquoise" />
                )}
              </div>
              <h1 className="text-h1">{t("assessments.yourResults")}</h1>
              <p className="text-lg text-muted-foreground">
                {instrument
                  ? tr(instrument.name, lang)
                  : selectedAssessment.title}
              </p>

              <div className="glass-card p-6 text-left space-y-4">
                {result.max !== null && result.max !== undefined && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {instrument?.total
                          ? tr(instrument.total.label, lang)
                          : t("assessments.totalScore")}
                      </span>
                      <span className="text-2xl font-bold text-foreground">
                        {result.total_score} / {result.max}
                      </span>
                    </div>
                    <Progress value={result.percent} className="h-3" />
                  </>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.interpretation}
                </p>
                {result.selfHarmRisk && (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm space-y-1">
                    <p className="font-medium text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> {t("crisis.title")}
                    </p>
                    <p className="text-muted-foreground">
                      {t("crisis.message")}
                    </p>
                    <p className="font-medium">
                      Police —{" "}
                      <a href="tel:19" className="underline">
                        19
                      </a>{" "}
                      · SAMU —{" "}
                      <a href="tel:141" className="underline">
                        141
                      </a>
                    </p>
                  </div>
                )}

                {Object.entries(result.scores as Record<string, any>).map(
                  ([dim, data]: [string, any]) => (
                    <div
                      key={dim}
                      className="flex items-center justify-between py-2"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <span className="text-sm text-muted-foreground capitalize">
                        {data.label ?? dim}
                        {data.band && (
                          <span className="block text-xs normal-case text-foreground/80">
                            {data.band}
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-u-clinical"
                            style={{ width: `${data.percent}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {data.band
                            ? `${data.score}/${data.max}`
                            : `${data.percent}%`}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>

              <p className="text-xs text-muted-foreground text-left leading-relaxed">
                {instrument
                  ? `${LAB_COPY[lang].screening} ${LAB_COPY[lang].sourceLabel} ${instrument.source}`
                  : LAB_COPY[lang].selfCheckNote}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                {severity !== "low" && (
                  <Button variant="primary" size="lg" asChild>
                    <Link to={addLocalePrefix("/psychologists", locale)}>
                      {t("assessments.findPsychologist")}
                    </Link>
                  </Button>
                )}
                <Button variant="secondary" size="lg" asChild>
                  <Link to={addLocalePrefix("/resources", locale)}>
                    {t("assessments.explorePrograms")}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    setSelectedAssessment(null);
                    setShowResults(false);
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />{" "}
                  {t("assessments.backToAssessments")}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Question view. AUDIT skips questions that do not apply (e.g. a
  // non-drinker is not asked how much they drink).
  const skipped = new Set(instrument?.skip?.(answers) ?? []);
  const visible = questions.filter((q) => !skipped.has(q.id));
  const question = visible[Math.min(currentQ, visible.length - 1)];
  const progress =
    ((currentQ + (answers[question?.id] !== undefined ? 1 : 0)) /
      Math.max(visible.length, 1)) *
    100;
  const allAnswered = visible.every((q) => answers[q.id] !== undefined);

  return (
    <div className="min-h-screen">
      <SEOHead
        path="/assessment-lab"
        title="Assessment Lab — Clinical Self-Assessments | U.Psy"
        description="Take validated clinical screenings (GAD-7, PHQ-9 and more) on U.Psy and get an immediate, evidence-based snapshot of your mental health."
      />
      <div
        className="sticky top-16 z-30 py-3"
        style={{
          background: "rgba(26,26,26,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="container-custom">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                currentQ > 0
                  ? setCurrentQ(currentQ - 1)
                  : setSelectedAssessment(null)
              }
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> {t("common.back")}
            </Button>
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.min(currentQ + 1, visible.length)} / {visible.length}
            </span>
          </div>
        </div>
      </div>

      <section className="hero-neural-bg relative py-16 md:py-24">
        <div className="container-custom relative z-10">
          <div className="max-w-lg mx-auto space-y-6">
            <p className="text-xs text-muted-foreground text-center uppercase tracking-wide">
              {instrument ? instrument.shortName : selectedAssessment.title}
            </p>
            {instrument && (
              <p className="text-sm text-center text-muted-foreground">
                {tr(instrument.instructions, lang)}
              </p>
            )}
            <h2 className="text-h2 text-center">{question?.question_text}</h2>
            {!instrument && (
              <p className="text-xs text-center text-muted-foreground">
                {t("assessments.overLastTwoWeeks")}
              </p>
            )}
            {instrument && !hasOfficialText(instrument, lang) && (
              <p className="text-xs text-center text-muted-foreground">
                {LAB_COPY[lang].noOfficialTranslation}
              </p>
            )}

            <div className="space-y-3">
              {question?.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectAnswer(question.id, opt.value)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-200 ${
                    answers[question.id] === opt.value
                      ? "ring-2 ring-u-clinical bg-u-clinical/10"
                      : "hover:bg-muted/40"
                  }`}
                  style={
                    answers[question.id] === opt.value
                      ? {}
                      : {
                          background: "var(--glass-bg)",
                          border: "var(--glass-border)",
                        }
                  }
                >
                  <span
                    className={`font-medium text-sm ${answers[question.id] === opt.value ? "text-u-clinical" : "text-foreground"}`}
                  >
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-center pt-4 gap-3">
              {currentQ < visible.length - 1 ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setCurrentQ(currentQ + 1)}
                  disabled={answers[question?.id] === undefined}
                >
                  {t("common.next")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={submitAssessment}
                  disabled={!allAnswered || loading}
                >
                  {loading
                    ? t("assessments.calculating")
                    : t("assessments.seeResults")}{" "}
                  <CheckCircle2 className="ml-2 h-4 w-4" />
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
