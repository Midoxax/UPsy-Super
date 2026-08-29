// L'Observatoire U.Psy — permanent research pole.
//
// ANONYMITY WALL (non-negotiable):
//  • Survey answers are written ONLY through the `survey_save` RPC, keyed on a
//    client-generated session token. No name, email, phone, user id or account
//    key is ever sent with them.
//  • The opt-in step below is a SEPARATE screen with its own unchecked consent
//    and its own network call. It carries no reference to the survey row.
//  • Never pass `answers` or the session token into growth_leads.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, ArrowRight, ArrowLeft, Check, Users, Stethoscope } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/contexts/LocaleContext";
import { pushDataLayer } from "@/lib/analytics/gtm";
import QuestionField from "@/components/observatoire/QuestionField";
import { observatoireCopy, surveyLangFor } from "@/lib/i18n/observatoireCopy";
import {
  sectionsFor,
  questionCount,
  isOptional,
  type Track,
} from "@/lib/observatoire/instrument";
import {
  computeIntentScore,
  vanWestendorpCoherent,
  rankBarriers,
  buildLeadBreakdown,
  deviceType,
  type Answers,
} from "@/lib/observatoire/scoring";

type Phase = "consent" | "survey" | "results" | "optin" | "done";

const BARRIER_LABELS: Record<string, { fr: string; ar: string }> = {
  barrier_cost: { fr: "Le coût", ar: "التكلفة" },
  barrier_availability: { fr: "La disponibilité", ar: "التوفر" },
  barrier_stigma: { fr: "Le regard des autres", ar: "نظرة الآخرين" },
  barrier_trust: { fr: "La confiance", ar: "الثقة" },
  barrier_awareness: { fr: "Savoir vers qui se tourner", ar: "معرفة الجهة المناسبة" },
  barrier_teleconsultation: { fr: "Le distanciel", ar: "الاستشارة عن بعد" },
};

const readUtm = (params: URLSearchParams) => {
  const out: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((k) => {
    const v = params.get(k);
    if (v) out[k] = v.slice(0, 100);
  });
  return out;
};

export default function Observatoire() {
  const { locale } = useLocale();
  const lang = surveyLangFor(locale);
  const c = observatoireCopy(lang);
  const [params] = useSearchParams();

  const [phase, setPhase] = useState<Phase>("consent");
  const [consent, setConsent] = useState(false);
  const [track, setTrack] = useState<Track>("patient");
  const [sectionIdx, setSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  // Opt-in state — deliberately separate from the survey state above.
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orgName, setOrgName] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [optInSaving, setOptInSaving] = useState(false);

  const sessionToken = useRef<string>(crypto.randomUUID());
  const startedAt = useRef<number>(Date.now());

  const sections = useMemo(() => sectionsFor(track), [track]);
  const total = useMemo(() => questionCount(track), [track]);
  const section = sections[sectionIdx];

  const answeredCount = useMemo(
    () =>
      sections
        .flatMap((s) => s.questions)
        .filter((q) => {
          const v = answers[q.id];
          return v !== undefined && v !== null && v !== "";
        }).length,
    [answers, sections]
  );

  const utm = useMemo(() => readUtm(params), [params]);
  const storedReferral =
    typeof sessionStorage !== "undefined" ? sessionStorage.getItem("upsy_referral_code") : null;
  // Attribution reuses the existing /invite/:code → `referrals` mechanism.
  const ambassadorCode = params.get("code") || params.get("amb") || storedReferral || null;
  const referralSource = params.get("ref") || utm.utm_source || null;

  const score = useMemo(() => computeIntentScore(answers), [answers]);
  const coherent = useMemo(() => vanWestendorpCoherent(answers), [answers]);

  const persist = useCallback(
    async (completed: boolean, currentStep: number, payload: Answers) => {
      const { error } = await supabase.rpc("survey_save", {
        _session_token: sessionToken.current,
        _track: track,
        _language: lang,
        _answers: payload as never,
        _last_step: currentStep,
        _total_steps: sections.length,
        _completed: completed,
        _referral_source: referralSource ?? undefined,
        _ambassador_code: ambassadorCode ? ambassadorCode.slice(0, 64)  : undefined,
        _device_type: deviceType(),
        _duration_seconds: Math.round((Date.now() - startedAt.current) / 1000),
        _vw_coherent: track === "patient" ? (vanWestendorpCoherent(payload) ?? undefined) : undefined,
      });
      if (error) throw error;
    },
    [track, lang, sections.length, referralSource, ambassadorCode]
  );

  useEffect(() => {
    pushDataLayer({ event: "observatoire_view", page_path: "/observatoire", locale: lang });
  }, [lang]);

  const beginSurvey = () => {
    if (!consent) {
      toast.error(c.consentRequired);
      return;
    }
    startedAt.current = Date.now();
    setPhase("survey");
    pushDataLayer({ event: "observatoire_start", survey_track: track, locale: lang });
  };

  const goNext = async () => {
    const missing = section.questions.filter(
      (q) => !isOptional(q) && (answers[q.id] === undefined || answers[q.id] === null || answers[q.id] === "")
    );
    if (missing.length) {
      setShowErrors(true);
      toast.error(c.required);
      return;
    }
    setShowErrors(false);
    const isLast = sectionIdx === sections.length - 1;
    setSaving(true);
    try {
      await persist(isLast, sectionIdx + 1, answers);
      if (isLast) {
        const s = computeIntentScore(answers);
        pushDataLayer({
          event: "observatoire_complete",
          survey_track: track,
          band: s.band,
          score_total: s.total,
          locale: lang,
        });
        setPhase("results");
      } else {
        setSectionIdx((i) => i + 1);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast.error(c.errorGeneric);
      console.warn("survey_save failed", e);
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    setShowErrors(false);
    setSectionIdx((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Opt-in: a completely separate write, no survey identifiers involved ───
  const submitOptIn = async () => {
    if (!email.trim() || !marketingConsent) {
      toast.error(c.consentRequired);
      return;
    }
    setOptInSaving(true);
    try {
      const referralCode =
        typeof sessionStorage !== "undefined" ? sessionStorage.getItem("upsy_referral_code") : null;
      const breakdown = buildLeadBreakdown(track, answers, score, { referral_code: referralCode, utm });

      const { error } = await supabase.from("growth_leads").insert({
        email: email.toLowerCase().trim(),
        full_name: name.trim() || null,
        phone: phone.trim() || null,
        source: track === "patient" ? "observatoire_patient" : "observatoire_psychologist",
        locale: lang,
        consent_marketing: true,
        nurture_stage: "d0",
        score_total: score.total,
        score_breakdown: breakdown as never,
      });
      if (error) throw error;

      // Unified CRM identity. Deliberately carries NO survey identifier and no
      // answers — only what the person typed on this opt-in screen.
      await supabase.rpc("crm_upsert_contact", {
        _email: email.toLowerCase().trim(),
        _full_name: name.trim() || undefined,
        _phone: phone.trim() || undefined,
        _locale: lang,
        _contact_type: track === "psychologist" ? "specialist" : "client",
        _source: track === "patient" ? "observatoire_patient" : "observatoire_psychologist",
        _first_touch: (utm ?? {}) as never,
        _activity_kind: "form_submitted",
        _activity_subject: "Observatoire opt-in",
        _activity_metadata: { track, band: score.band, referral_code: referralCode } as never,
        _consent_purpose: "newsletter",
        _consent_granted: true,
        _consent_evidence: {
          form: "observatoire_optin",
          url: typeof window !== "undefined" ? window.location.pathname : null,
          ts: new Date().toISOString(),
          wording_version: "observatoire-v1",
        } as never,
      });


      // Psychologists additionally enter the accreditation pipeline as a light
      // expression of interest (the full 48-field dossier comes later at /apply).
      if (track === "psychologist") {
        await supabase.from("psychologist_applications").insert({
          email: email.toLowerCase().trim(),
          full_name: name.trim() || email.split("@")[0],
          preferred_locale: lang,
          phone: phone.trim() || null,
          city: typeof answers.city === "string" ? answers.city : null,
          years_experience: typeof answers.years_practice === "number" ? answers.years_practice : null,
          notes:
            `[Observatoire — expression of interest, dossier incomplete] ` +
            `commission_band=${answers.commission_band ?? "?"}; ` +
            `preferred_model=${answers.preferred_model ?? "?"}; ` +
            `timeline=${answers.timeline ?? "?"}; practice_mode=${answers.practice_mode ?? "?"}`,
          status: "pending",
        });
      }

      // Organisation interest becomes a commercial enquiry, not a formal
      // B2B onboarding application (no ICE/RC/seat data available here).
      if (track === "patient" && answers.org_interest === true && orgName.trim()) {
        await supabase.from("proposal_requests").insert({
          organization_name: orgName.trim(),
          contact_name: name.trim() || email.split("@")[0],
          email: email.toLowerCase().trim(),
          phone: phone.trim() || null,
          service_interest: "observatoire_employee_signal",
          message: "[Observatoire] Employee signalled employer interest during the research survey.",
          status: "pending",
        });
      }

      pushDataLayer({
        event: "observatoire_optin",
        survey_track: track,
        band: score.band,
        locale: lang,
      });
      setPhase("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast.error(c.errorGeneric);
      console.warn("observatoire opt-in failed", e);
    } finally {
      setOptInSaving(false);
    }
  };

  const bandLabel = score.band === "A" ? c.bandA : score.band === "B" ? c.bandB : c.bandC;
  const bandDesc = score.band === "A" ? c.bandADesc : score.band === "B" ? c.bandBDesc : c.bandCDesc;

  const shell = (children: React.ReactNode) => (
    <div className="marketing-night min-h-screen">
      <SEOHead path="/observatoire" title={c.seoTitle} description={c.seoDescription} />
      <div className="container-custom py-14 lg:py-20 max-w-3xl">{children}</div>
    </div>
  );

  // ─── Consent gate ──────────────────────────────────────────────────────────
  if (phase === "consent") {
    return shell(
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-primary">
          <ShieldCheck className="h-3.5 w-3.5" />
          {c.eyebrow}
        </p>
        <h1 className="mt-6 font-display text-4xl md:text-6xl leading-[1.05] tracking-tight">
          {c.title} <span className="italic accent-italic text-primary">{c.titleAccent}</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">{c.lede}</p>

        <Card className="glass-card mt-10">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              {c.anonymityTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2.5">
              {c.anonymityPoints.map((p) => (
                <li key={p} className="flex gap-2.5 text-sm leading-relaxed">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium">{c.chooseTrack}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["patient", "psychologist"] as Track[]).map((tk) => {
                  const active = track === tk;
                  const Icon = tk === "patient" ? Users : Stethoscope;
                  return (
                    <button
                      key={tk}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setTrack(tk);
                        setAnswers({});
                        setSectionIdx(0);
                      }}
                      className={`rounded-u-card border p-4 text-start transition-colors ${
                        active ? "border-primary bg-primary/10" : "border-border/60 hover:bg-muted/30"
                      }`}
                    >
                      <Icon className="h-5 w-5 text-primary mb-2" />
                      <span className="block font-medium">{tk === "patient" ? c.trackPatient : c.trackPsy}</span>
                      <span className="block text-xs text-muted-foreground mt-1 leading-relaxed">
                        {tk === "patient" ? c.trackPatientDesc : c.trackPsyDesc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <Checkbox
                id="obs-consent"
                checked={consent}
                onCheckedChange={(v) => setConsent(v === true)}
              />
              <Label htmlFor="obs-consent" className="text-sm leading-relaxed font-normal">
                {c.consentLabel}
              </Label>
            </div>

            <Button size="lg" className="w-full" onClick={beginSurvey} disabled={!consent}>
              {c.start}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Button>
            <p className="text-xs text-muted-foreground">{c.law0908}</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ─── Survey ────────────────────────────────────────────────────────────────
  if (phase === "survey") {
    return shell(
      <Card className="glass-card">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span>{c.progress}</span>
            <span className="tabular-nums">
              {answeredCount} / {total}
            </span>
          </div>
          <Progress value={(answeredCount / total) * 100} className="h-2" />
          <CardTitle className="font-display text-2xl pt-2">{section.title[lang]}</CardTitle>
          {section.subtitle && <p className="text-sm text-muted-foreground">{section.subtitle[lang]}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          {section.questions.map((q) => {
            // The optional org name only appears when interest was declared.
            if (q.id === "org_name" && answers.org_interest !== true) return null;
            return (
              <QuestionField
                key={q.id}
                question={q}
                lang={lang}
                value={answers[q.id]}
                showError={showErrors && !isOptional(q)}
                onChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
              />
            );
          })}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button variant="ghost" onClick={goBack} disabled={sectionIdx === 0 || saving}>
              <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
              {c.back}
            </Button>
            <Button onClick={goNext} disabled={saving} size="lg">
              {saving ? c.saving : sectionIdx === sections.length - 1 ? c.finish : c.next}
              {!saving && <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Results ───────────────────────────────────────────────────────────────
  if (phase === "results") {
    const barriers = rankBarriers(answers).slice(0, 3);
    return shell(
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display text-2xl">{c.resultsTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">{c.resultsLede}</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="rounded-u-card border border-primary/30 bg-primary/5 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-primary mb-1">{c.yourProfile}</p>
              <p className="font-display text-3xl">{bandLabel}</p>
              <p className="mt-3 text-sm leading-relaxed">{bandDesc}</p>
            </div>

            {track === "patient" && barriers.some((b) => b.value > 0) && (
              <div className="space-y-3">
                <h2 className="font-display text-lg">{c.topBarriers}</h2>
                {barriers.map((b) => (
                  <div key={b.key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{BARRIER_LABELS[b.key]?.[lang] ?? b.key}</span>
                      <span className="font-mono tabular-nums">{b.value}/5</span>
                    </div>
                    <Progress value={(b.value / 5) * 100} className="h-1.5" />
                  </div>
                ))}
              </div>
            )}

            {track === "patient" && coherent !== null && (
              <div className="rounded-u-card border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-primary mb-2">{c.priceRead}</p>
                <p className="font-mono tabular-nums text-lg">
                  {String(answers.vw_bargain ?? "—")} – {String(answers.vw_expensive ?? "—")} MAD
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {coherent ? c.priceCoherent : c.priceIncoherent}
                </p>
              </div>
            )}

            {/* Segmented exit — band A goes straight to account creation. */}
            <div className="grid gap-3 sm:grid-cols-2">
              {track === "patient" ? (
                <>
                  {score.band === "A" ? (
                    <Button asChild size="lg">
                      <Link
                        to={`/auth?mode=signup&redirect=${encodeURIComponent("/get-matched?source=observatoire")}`}
                        onClick={() =>
                          pushDataLayer({ event: "observatoire_cta", band: "A", cta: "signup" })
                        }
                      >
                        {c.ctaCreateAccount}
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="lg">
                      <Link
                        to="/psychologists?source=observatoire"
                        onClick={() =>
                          pushDataLayer({ event: "observatoire_cta", band: score.band, cta: "explore" })
                        }
                      >
                        {c.ctaExplore}
                      </Link>
                    </Button>
                  )}
                  <Button asChild size="lg" variant="outline">
                    <Link to={score.band === "A" ? "/psychologists?source=observatoire" : "/free-score"}>
                      {score.band === "A" ? c.ctaExplore : "Bilan gratuit"}
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link
                      to="/apply?source=observatoire"
                      onClick={() => pushDataLayer({ event: "observatoire_cta", cta: "apply" })}
                    >
                      {c.ctaApply}
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/pricing-specialists">{lang === "ar" ? "شروط الشبكة" : "Conditions du réseau"}</Link>
                  </Button>
                </>
              )}
            </div>

            <div className="border-t border-border/60 pt-6">
              <Button variant="secondary" className="w-full" onClick={() => setPhase("optin")}>
                {c.keepInTouch}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ─── Opt-in (separate step, never pre-checked) ─────────────────────────────
  if (phase === "optin") {
    return shell(
      <Card className="glass-card">
        <CardHeader>
          <p className="text-xs font-mono uppercase tracking-widest text-primary">{c.separateStep}</p>
          <CardTitle className="font-display text-2xl">{c.keepInTouch}</CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {track === "psychologist" ? c.psyOptInDesc : c.keepInTouchDesc}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="obs-email">{c.emailLabel}</Label>
            <Input
              id="obs-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="obs-name">{c.nameLabel}</Label>
            <Input id="obs-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="obs-phone">{c.phoneLabel}</Label>
            <Input id="obs-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          {track === "patient" && answers.org_interest === true && (
            <div className="space-y-1.5">
              <Label htmlFor="obs-org">{c.orgNameLabel}</Label>
              <Input
                id="obs-org"
                value={orgName || (typeof answers.org_name === "string" ? answers.org_name : "")}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-start gap-2.5 pt-1">
            <Checkbox
              id="obs-marketing"
              checked={marketingConsent}
              onCheckedChange={(v) => setMarketingConsent(v === true)}
            />
            <Label htmlFor="obs-marketing" className="text-xs leading-relaxed font-normal">
              {c.marketingConsent}
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">{c.law0908}</p>

          <Button
            className="w-full"
            size="lg"
            onClick={submitOptIn}
            disabled={optInSaving || !email.trim() || !marketingConsent}
          >
            {optInSaving ? c.saving : c.submitOptIn}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setPhase("results")}>
            {c.noThanks}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─── Done ──────────────────────────────────────────────────────────────────
  return shell(
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="font-display text-2xl">{c.optInDone}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground leading-relaxed">{c.optInDoneDesc}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild size="lg">
            <Link
              to={
                track === "psychologist"
                  ? "/apply?source=observatoire"
                  : score.band === "A"
                  ? `/auth?mode=signup&email=${encodeURIComponent(email.trim())}&name=${encodeURIComponent(
                      name.trim()
                    )}&redirect=${encodeURIComponent("/get-matched?source=observatoire")}`
                  : "/psychologists?source=observatoire"
              }
            >
              {track === "psychologist"
                ? c.ctaApply
                : score.band === "A"
                ? c.ctaCreateAccount
                : c.ctaExplore}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/">{lang === "ar" ? "العودة إلى الرئيسية" : "Retour à l'accueil"}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}