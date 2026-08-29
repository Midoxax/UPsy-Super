import { useEffect, useState } from "react";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useLocale } from "@/contexts/LocaleContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { captureEvent } from "@/lib/analytics/posthog";
import { pushDataLayer } from "@/lib/analytics/gtm";
import { Link } from "@/lib/router-compat";

type Pillar = "focus" | "regulation" | "recovery" | "meaning";

const QUESTIONS: Array<{ key: string; pillar: Pillar; invert?: boolean; q: Record<"en" | "fr" | "ar", string> }> = [
  { key: "mood", pillar: "regulation", q: { en: "How is your mood this week?", fr: "Comment est votre humeur cette semaine ?", ar: "كيف هو مزاجك هذا الأسبوع؟" } },
  { key: "sleep", pillar: "recovery", q: { en: "How well are you sleeping?", fr: "Comment dormez-vous ?", ar: "كيف تنام؟" } },
  { key: "stress", pillar: "regulation", invert: true, q: { en: "How stressed do you feel?", fr: "À quel point êtes-vous stressé ?", ar: "ما مدى توترك؟" } },
  { key: "energy", pillar: "recovery", q: { en: "Energy level today?", fr: "Niveau d'énergie aujourd'hui ?", ar: "مستوى طاقتك اليوم؟" } },
  { key: "focus", pillar: "focus", q: { en: "Ability to focus?", fr: "Capacité de concentration ?", ar: "قدرتك على التركيز؟" } },
  { key: "relationships", pillar: "meaning", q: { en: "Quality of close relationships?", fr: "Qualité de vos relations proches ?", ar: "جودة علاقاتك القريبة؟" } },
  { key: "purpose", pillar: "meaning", q: { en: "Sense of purpose?", fr: "Sentiment de sens ?", ar: "الإحساس بالهدف؟" } },
  { key: "anxiety", pillar: "regulation", invert: true, q: { en: "Frequency of anxious thoughts?", fr: "Fréquence des pensées anxieuses ?", ar: "وتيرة الأفكار القلقة؟" } },
  { key: "recovery", pillar: "recovery", q: { en: "Ability to recover from setbacks?", fr: "Capacité à rebondir ?", ar: "القدرة على التعافي؟" } },
  { key: "growth", pillar: "meaning", q: { en: "Feeling of growth lately?", fr: "Sentiment de progression ?", ar: "الإحساس بالنمو؟" } },
  { key: "attention", pillar: "focus", invert: true, q: { en: "How often does your mind wander when you need to concentrate?", fr: "À quelle fréquence votre esprit s'égare-t-il quand vous devez vous concentrer ?", ar: "كم مرة يشرد ذهنك عندما تحتاج للتركيز؟" } },
  { key: "rumination", pillar: "regulation", invert: true, q: { en: "How often do the same worries loop in your head?", fr: "À quelle fréquence les mêmes soucis tournent-ils en boucle ?", ar: "كم مرة تتكرر نفس الهموم في رأسك؟" } },
];

export default function FreeScore() {
  const { locale } = useLocale();
  const lang = (locale.startsWith("fr") ? "fr" : locale.startsWith("ar") ? "ar" : "en") as "en" | "fr" | "ar";
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [pillarScores, setPillarScores] = useState<Record<Pillar, number> | null>(null);

  const total = QUESTIONS.length;
  const isFormStep = step >= total;
  const progress = Math.min((step / (total + 1)) * 100, 100);

  // Fire quiz_start once on mount.
  useEffect(() => {
    pushDataLayer({
      event: "quiz_start",
      quiz_id: "mental_performance_score",
      total_questions: total,
      locale: lang,
      page_path: "/free-score",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = {
    en: {
      title: "Free Mental Performance Score",
      subtitle: "10 questions • 2 minutes • Personalized result",
      next: "Next",
      back: "Back",
      almost: "Almost done",
      enterEmail: "Where should we send your result?",
      name: "Your name (optional)",
      email: "Email",
      consent: "I agree to receive my result and occasional wellbeing tips. I can unsubscribe anytime.",
      submit: "Get my score",
      yourScore: "Your Mental Performance Score",
      ctaMatch: "Find your psychologist",
      footnote: "Indicative only — does not replace a clinical assessment.",
      legal: "In accordance with Moroccan Law 09-08, your data is processed confidentially.",
      values: ["Very low", "Low", "Moderate", "High", "Very high"],
    },
    fr: {
      title: "Score de Performance Mentale gratuit",
      subtitle: "10 questions • 2 minutes • Résultat personnalisé",
      next: "Suivant",
      back: "Retour",
      almost: "Presque terminé",
      enterEmail: "Où envoyer votre résultat ?",
      name: "Votre prénom (optionnel)",
      email: "Email",
      consent: "J'accepte de recevoir mon résultat et des conseils ponctuels. Désinscription à tout moment.",
      submit: "Obtenir mon score",
      yourScore: "Votre Score de Performance Mentale",
      ctaMatch: "Trouver mon psychologue",
      footnote: "Indicatif seulement — ne remplace pas une évaluation clinique.",
      legal: "Conformément à la loi 09-08, vos données sont traitées confidentiellement.",
      values: ["Très bas", "Bas", "Modéré", "Élevé", "Très élevé"],
    },
    ar: {
      title: "نتيجة الأداء النفسي المجانية",
      subtitle: "10 أسئلة • دقيقتان • نتيجة شخصية",
      next: "التالي",
      back: "السابق",
      almost: "اقتربنا",
      enterEmail: "أين نرسل نتيجتك؟",
      name: "اسمك (اختياري)",
      email: "البريد الإلكتروني",
      consent: "أوافق على تلقي نتيجتي ونصائح عرضية للعافية. يمكنني إلغاء الاشتراك في أي وقت.",
      submit: "احصل على نتيجتي",
      yourScore: "نتيجة أدائك النفسي",
      ctaMatch: "اعثر على معالجك",
      footnote: "إرشادي فقط — لا يحل محل التقييم السريري.",
      legal: "وفقًا للقانون 09-08، تتم معالجة بياناتك بسرية.",
      values: ["منخفض جدًا", "منخفض", "متوسط", "مرتفع", "مرتفع جدًا"],
    },
  }[lang];

  const submit = async () => {
    if (!email || !consent) {
      toast.error(lang === "fr" ? "Email et consentement requis" : "Email and consent required");
      return;
    }
    setSubmitting(true);
    // Compute overall + per-pillar (invert reverse-scored items)
    const scored: Record<string, number> = {};
    QUESTIONS.forEach((q) => {
      const v = answers[q.key] ?? 3;
      scored[q.key] = q.invert ? 6 - v : v;
    });
    const sum = Object.values(scored).reduce((a, b) => a + b, 0);
    const computed = Math.round((sum / (total * 5)) * 100);
    const byPillar: Record<Pillar, { sum: number; n: number }> = {
      focus: { sum: 0, n: 0 }, regulation: { sum: 0, n: 0 }, recovery: { sum: 0, n: 0 }, meaning: { sum: 0, n: 0 },
    };
    QUESTIONS.forEach((q) => { byPillar[q.pillar].sum += scored[q.key]; byPillar[q.pillar].n += 1; });
    const pillars = Object.fromEntries(
      (Object.keys(byPillar) as Pillar[]).map((p) => [p, Math.round((byPillar[p].sum / (byPillar[p].n * 5)) * 100)])
    ) as Record<Pillar, number>;
    try {
      const { error } = await supabase.from("growth_leads").insert({
        email: email.toLowerCase().trim(),
        full_name: name.trim() || null,
        source: "free_score",
        score_total: computed,
        score_breakdown: { answers, pillars },
        locale: lang,
        consent_marketing: consent,
        nurture_stage: "d0",
      });
      if (error) throw error;

      // Same person, one CRM identity across every funnel.
      await supabase.rpc("crm_upsert_contact", {
        _email: email.toLowerCase().trim(),
        _full_name: name.trim() || undefined,
        _locale: lang,
        _contact_type: "client",
        _source: "free_score",
        _activity_kind: "quiz_completed",
        _activity_subject: `Mental Performance Score — ${computed}/100`,
        _activity_metadata: { pillars } as never,
        _consent_purpose: "newsletter",
        _consent_granted: consent,
        _consent_evidence: {
          form: "free_score",
          url: "/free-score",
          ts: new Date().toISOString(),
          wording_version: "free-score-v1",
        } as never,
      });

      captureEvent("free_score_completed", { score: computed, ...pillars });
      pushDataLayer({
        event: "quiz_submit",
        quiz_id: "mental_performance_score",
        score_total: computed,
        focus: pillars.focus,
        regulation: pillars.regulation,
        recovery: pillars.recovery,
        meaning: pillars.meaning,
        weakest_pillar: (Object.entries(pillars) as [Pillar, number][]).sort((a, b) => a[1] - b[1])[0][0],
        consent_marketing: consent,
        locale: lang,
        page_path: "/free-score",
      });
      setScore(computed);
      setPillarScores(pillars);

      // Fire-and-forget confirmation email with pillar summary and next steps.
      const weakest = (Object.entries(pillars) as [Pillar, number][])
        .sort((a, b) => a[1] - b[1])[0][0];
      const pillarQuery: Record<Pillar, string> = {
        focus: "attention",
        regulation: "anxiety",
        recovery: "sleep",
        meaning: "relationships",
      };
      const origin = typeof window !== "undefined" ? window.location.origin : "https://upsy.ma";
      supabase.functions
        .invoke("send-transactional-email", {
          body: {
            templateName: "quiz-results",
            recipientEmail: email.toLowerCase().trim(),
            idempotencyKey: `quiz-results-${email.toLowerCase().trim()}-${computed}`,
            templateData: {
              name: name.trim() || undefined,
              score: computed,
              pillars,
              weakestPillar: weakest,
              lang,
              bookingUrl: `${origin}/get-matched?source=free-score`,
              matchUrl: `${origin}/psychologists?pillar=${weakest}&q=${encodeURIComponent(pillarQuery[weakest])}&source=free-score-email`,
              resultsUrl: `${origin}/free-score`,
            },
          },
        })
        .catch((err) => console.warn("quiz-results email enqueue failed", err));
    } catch (e: any) {
      toast.error(e.message ?? "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (score !== null && pillarScores !== null) {
    const pillarLabels: Record<Pillar, Record<"en" | "fr" | "ar", string>> = {
      focus: { en: "Focus", fr: "Concentration", ar: "التركيز" },
      regulation: { en: "Emotional regulation", fr: "Régulation émotionnelle", ar: "التنظيم العاطفي" },
      recovery: { en: "Recovery & energy", fr: "Récupération & énergie", ar: "التعافي والطاقة" },
      meaning: { en: "Meaning & connection", fr: "Sens & connexion", ar: "المعنى والتواصل" },
    };
    const weakest = (Object.entries(pillarScores) as [Pillar, number][]).sort((a, b) => a[1] - b[1])[0];
    const pillarQuery: Record<Pillar, string> = {
      focus: "attention",
      regulation: "anxiety",
      recovery: "sleep",
      meaning: "relationships",
    };
    const matchHref = (p: Pillar) => `/psychologists?pillar=${p}&q=${encodeURIComponent(pillarQuery[p])}&source=free-score`;
    const ctaMatchLabel = lang === "fr" ? "Voir vos psychologues correspondants" : lang === "ar" ? "شاهد الأخصائيين المناسبين" : "See your matched psychologists";
    const recoCopy: Record<Pillar, Record<"en" | "fr" | "ar", string>> = {
      focus: {
        en: "Your weakest pillar is Focus. A performance psychologist can build you a daily attention protocol in 4–6 sessions.",
        fr: "Votre pilier le plus faible est la Concentration. Un psychologue de la performance peut construire un protocole d'attention en 4-6 séances.",
        ar: "أضعف ركيزة لديك هي التركيز. يمكن لطبيب نفسي متخصص في الأداء بناء بروتوكول يومي في 4-6 جلسات.",
      },
      regulation: {
        en: "Emotional regulation is your growth edge. CBT + ACT protocols reduce rumination and reactivity within 6–8 weeks.",
        fr: "La régulation émotionnelle est votre marge de progression. Les protocoles TCC + ACT réduisent la rumination en 6-8 semaines.",
        ar: "التنظيم العاطفي هو مجال تطورك. تُقلل بروتوكولات CBT + ACT من الاجترار خلال 6-8 أسابيع.",
      },
      recovery: {
        en: "Recovery is running low. Start with CBT-I for sleep and a nervous-system down-regulation protocol.",
        fr: "La récupération est faible. Commencez par le TCC-I pour le sommeil et un protocole de régulation nerveuse.",
        ar: "التعافي منخفض. ابدأ ببروتوكول CBT-I للنوم وتنظيم الجهاز العصبي.",
      },
      meaning: {
        en: "Meaning & connection is your lowest pillar. Values-based work (ACT) and relational sessions shift this fast.",
        fr: "Sens & connexion est votre pilier le plus bas. Le travail basé sur les valeurs (ACT) change cela rapidement.",
        ar: "المعنى والتواصل هو أدنى ركيزة. العمل القائم على القيم (ACT) يُغير ذلك بسرعة.",
      },
    };
    const band =
      score >= 75 ? { en: "Strong", fr: "Solide", ar: "قوي" } :
      score >= 55 ? { en: "Balanced", fr: "Équilibré", ar: "متوازن" } :
      score >= 35 ? { en: "Strained", fr: "Tendu", ar: "متوتر" } :
                    { en: "At risk", fr: "À risque", ar: "في خطر" };
    return (
      <>
        <SEOHead path="/free-score" title={`${t.yourScore} — U.Psy`} description={t.subtitle} />
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
          <Card className="max-w-2xl w-full glass-card">
            <CardHeader>
              <CardTitle className="text-center font-display text-2xl">{t.yourScore}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center space-y-3">
                <div className="text-7xl font-mono tabular-nums font-bold text-primary font-display">{score}</div>
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{band[lang]}</p>
                <Progress value={score} className="h-3" />
              </div>

              <div className="space-y-3">
                <h3 className="font-display text-lg">
                  {lang === "fr" ? "Répartition par pilier" : lang === "ar" ? "التفصيل حسب الركيزة" : "Breakdown by pillar"}
                </h3>
                {(Object.keys(pillarScores) as Pillar[]).map((p) => (
                  <Link
                    key={p}
                    to={matchHref(p)}
                    onClick={() => captureEvent("free_score_pillar_click", { pillar: p, score: pillarScores[p] })}
                    className="block space-y-1 rounded-md px-2 py-1 -mx-2 hover:bg-muted/40 transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                  >
                    <div className="flex justify-between text-sm items-center">
                      <span className="flex items-center gap-2">
                        {pillarLabels[p][lang]}
                        {p === weakest[0] && (
                          <span className="text-[10px] uppercase tracking-widest text-primary">
                            {lang === "fr" ? "Prioritaire" : lang === "ar" ? "أولوية" : "Priority"}
                          </span>
                        )}
                      </span>
                      <span className="font-mono tabular-nums">{pillarScores[p]}</span>
                    </div>
                    <Progress value={pillarScores[p]} className="h-1.5" />
                    <div className="text-[11px] text-muted-foreground">
                      {lang === "fr" ? "Voir les psychologues →" : lang === "ar" ? "عرض الأخصائيين ←" : "See matched psychologists →"}
                    </div>
                  </Link>
                ))}
              </div>

              <div className="rounded-u-card border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-primary mb-2">
                  {lang === "fr" ? "Votre prochaine étape" : lang === "ar" ? "خطوتك التالية" : "Your next step"}
                </p>
                <p className="text-sm leading-relaxed">{recoCopy[weakest[0]][lang]}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button asChild size="lg">
                  <Link
                    to={matchHref(weakest[0])}
                    onClick={() => captureEvent("free_score_cta_match", { pillar: weakest[0], score })}
                  >
                    {ctaMatchLabel}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/get-matched">{t.ctaMatch}</Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">{t.footnote}</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead path="/free-score" title={`${t.title} — U.Psy`} description={t.subtitle} />
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <Card className="max-w-xl w-full glass-card">
          <CardHeader>
            <CardTitle className="font-display text-2xl">{t.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            <Progress value={progress} className="h-2 mt-3" />
          </CardHeader>
          <CardContent className="space-y-6">
            {!isFormStep ? (
              <>
                <h3 className="text-lg font-medium">{QUESTIONS[step].q[lang]}</h3>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Button
                      key={v}
                      variant={answers[QUESTIONS[step].key] === v ? "default" : "outline"}
                      onClick={() => {
                        setAnswers({ ...answers, [QUESTIONS[step].key]: v });
                        pushDataLayer({
                          event: "quiz_answer",
                          quiz_id: "mental_performance_score",
                          question_key: QUESTIONS[step].key,
                          question_pillar: QUESTIONS[step].pillar,
                          question_index: step + 1,
                          total_questions: total,
                          value: v,
                          locale: lang,
                          page_path: "/free-score",
                        });
                        setTimeout(() => setStep(step + 1), 200);
                      }}
                    >
                      {v}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {t.values[0]} → {t.values[4]}
                </p>
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                    {t.back}
                  </Button>
                  <span className="text-xs text-muted-foreground self-center">
                    {step + 1} / {total}
                  </span>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium">{t.enterEmail}</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">{t.name}</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="email">{t.email}</Label>
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="flex items-start gap-2 pt-2">
                    <Checkbox id="consent" checked={consent} onCheckedChange={(c) => setConsent(c === true)} />
                    <Label htmlFor="consent" className="text-xs leading-relaxed">
                      {t.consent}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.legal}</p>
                </div>
                <Button onClick={submit} disabled={submitting} className="w-full" size="lg">
                  {submitting ? "…" : t.submit}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
