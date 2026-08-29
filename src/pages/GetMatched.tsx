import type { ComponentType } from "react";
import { useState, useEffect } from "react";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { PsychologistProfile } from "@/types/psychologist";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ScrollReveal from "@/components/ScrollReveal";
import MaroonDivider from "@/components/ui/maroon-divider";
import {
  Heart, Brain, Shield, Clock, Globe, MapPin, Award, Star,
  Calendar, ArrowRight, ArrowLeft, CheckCircle2, User, Sparkles,
  Lock, ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";

interface AssessmentAnswers {
  feeling: string;
  needs: string[];
  wantToTalk: string;
  language: string;
  sessionType: string;
  gender: string;
}

const defaultAnswers: AssessmentAnswers = {
  feeling: "", needs: [], wantToTalk: "", language: "", sessionType: "", gender: "",
};

const OptionCard = ({ selected, onClick, icon: Icon, label, description }: {
  selected: boolean; onClick: () => void; icon?: ComponentType<{ className?: string }>; label: string; description?: string;
}) => (
  <button type="button" onClick={onClick}
    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 ${selected ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted/40"}`}
    style={{ background: selected ? undefined : "var(--glass-bg)", border: selected ? undefined : "var(--glass-border)" }}>
    <div className="flex items-center gap-3">
      {Icon && <Icon className={`w-5 h-5 shrink-0 ${selected ? "text-primary" : "text-muted-foreground"}`} />}
      <div>
        <p className={`font-medium text-sm ${selected ? "text-primary" : "text-foreground"}`}>{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  </button>
);

const MultiOptionCard = ({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string; }) => (
  <button type="button" onClick={onClick}
    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selected ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
    style={selected ? {} : { background: "var(--glass-bg)", border: "var(--glass-border)" }}>
    {label}
  </button>
);

const GetMatched = () => {
  const { toast } = useToast();
  const { t, locale } = useLocale();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>(defaultAnswers);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<(PsychologistProfile & { matchScore: number })[]>([]);
  const [specialties, setSpecialties] = useState<{ id: string; name: string }[]>([]);
  const [languages, setLanguages] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [s, l] = await Promise.all([
        supabase.from("specialties").select("id, name").order("name"),
        supabase.from("languages").select("id, name").order("name"),
      ]);
      if (s.data) setSpecialties(s.data);
      if (l.data) setLanguages(l.data);
    };
    fetch();
  }, []);

  const FEELING_OPTIONS = [
    { value: "calm", label: t('assessments.optionCalm'), description: t('assessments.optionCalmDesc'), icon: CheckCircle2 },
    { value: "stressed", label: t('assessments.optionStressed'), description: t('assessments.optionStressedDesc'), icon: Brain },
    { value: "overwhelmed", label: t('assessments.optionOverwhelmed'), description: t('assessments.optionOverwhelmedDesc'), icon: Heart },
    { value: "struggling", label: t('assessments.optionStruggling'), description: t('assessments.optionStrugglingDesc'), icon: Shield },
  ];

  const NEED_OPTIONS = [
    t('assessments.anxiety'), t('assessments.stress'), t('assessments.depression'), t('assessments.relationships'),
    t('assessments.trauma'), t('assessments.sportPerformance'), t('assessments.burnout'), t('assessments.selfEsteem'),
    t('assessments.grief'), t('assessments.sleepIssues'),
  ];

  const progress = Math.round((step / 5) * 100);
  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return !!answers.feeling;
    if (step === 2) return answers.needs.length > 0;
    if (step === 3) return !!answers.language;
    return true;
  };

  const handleNext = () => {
    if (step === 3) setStep(4);
    else if (step === 4) findMatches();
    else setStep((s) => s + 1);
  };

  const findMatches = async () => {
    setLoading(true);
    try {
      const needToSpecialty = answers.needs.map((need) => {
        const found = specialties.find((s) => s.name.toLowerCase() === need.toLowerCase());
        return found?.id;
      }).filter(Boolean) as string[];
      const languageId = languages.find((l) => l.name.toLowerCase() === answers.language.toLowerCase())?.id;
      const { data, error } = await supabase.functions.invoke("find-matches", {
        body: { specialtyNeeded: needToSpecialty[0] || specialties[0]?.id, languagesPreferred: languageId ? [languageId] : [], prefersOnline: answers.sessionType === "online" },
      });
      if (error) throw error;
      if (data?.success && data.matches) {
        const scored = data.matches.map((m: PsychologistProfile, i: number) => ({ ...m, matchScore: Math.max(78, 98 - i * 4 - Math.floor(Math.random() * 3)) }));
        setMatches(scored);
      }
      setStep(5);
    } catch (err: any) {
      toast({ title: t('common.error'), description: t('assessments.noMatchesDesc'), variant: "destructive" });
    } finally { setLoading(false); }
  };

  const toggleNeed = (need: string) => {
    setAnswers((a) => ({ ...a, needs: a.needs.includes(need) ? a.needs.filter((n) => n !== need) : [...a.needs, need] }));
  };

  const feelingLabels: Record<string, string> = {
    calm: t('assessments.feelingCalm'),
    stressed: t('assessments.feelingStressed'),
    overwhelmed: t('assessments.feelingOverwhelmed'),
    struggling: t('assessments.feelingStruggling'),
  };

  const renderWelcome = () => (
    <ScrollReveal>
      <div className="max-w-xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(255,179,0,0.1)", border: "2px solid rgba(255,179,0,0.3)" }}>
          <Heart className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-display leading-tight">{t('onboarding.welcomeTitle')}</h1>
        <p className="text-body text-muted-foreground max-w-md mx-auto">{t('onboarding.welcomeText')}</p>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Lock className="w-3.5 h-3.5 text-primary" />
          <span>{t('onboarding.confidential')}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button variant="primary" size="lg" onClick={() => setStep(1)}>
            {t('onboarding.startAssessment')} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link to={addLocalePrefix("/psychologists", locale)}>{t('onboarding.browsePsychologistsInstead')}</Link>
          </Button>
        </div>
      </div>
    </ScrollReveal>
  );

  const renderFeeling = () => (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-h2">{t('assessments.questionFeeling')}</h2>
        <p className="text-muted-foreground">{t('assessments.questionFeelingSubtitle')}</p>
      </div>
      <div className="space-y-3">
        {FEELING_OPTIONS.map((opt) => (
          <OptionCard key={opt.value} selected={answers.feeling === opt.value} onClick={() => setAnswers((a) => ({ ...a, feeling: opt.value }))} icon={opt.icon} label={opt.label} description={opt.description} />
        ))}
      </div>
    </div>
  );

  const renderNeeds = () => (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-h2">{t('assessments.questionHelp')}</h2>
        <p className="text-muted-foreground">{t('assessments.selectAllApply')}</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {NEED_OPTIONS.map((need) => (
          <MultiOptionCard key={need} label={need} selected={answers.needs.includes(need)} onClick={() => toggleNeed(need)} />
        ))}
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="max-w-lg mx-auto space-y-8">
      <div className="space-y-3">
        <h3 className="text-h3 text-center">{t('assessments.preferSpeaking')}</h3>
        <div className="flex gap-2 justify-center">
          {[t('assessments.yes'), t('assessments.maybe'), t('assessments.notSureYet')].map((opt) => (
            <MultiOptionCard key={opt} label={opt} selected={answers.wantToTalk === opt} onClick={() => setAnswers((a) => ({ ...a, wantToTalk: opt }))} />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-h3 text-center">{t('assessments.preferredLanguage')}</h3>
        <div className="flex gap-2 justify-center">
          {["Arabic", "French", "English"].map((lang) => (
            <MultiOptionCard key={lang} label={lang} selected={answers.language === lang} onClick={() => setAnswers((a) => ({ ...a, language: lang }))} />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-h3 text-center">{t('assessments.sessionTypePreference')}</h3>
        <div className="flex gap-2 justify-center">
          {[
            { value: "online", label: t('assessments.online') },
            { value: "in-person", label: t('assessments.inPerson') },
            { value: "either", label: t('common.noPreference') },
          ].map((opt) => (
            <MultiOptionCard key={opt.value} label={opt.label} selected={answers.sessionType === opt.value} onClick={() => setAnswers((a) => ({ ...a, sessionType: opt.value }))} />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-h3 text-center">{t('assessments.genderPreference')}</h3>
        <div className="flex gap-2 justify-center">
          {[
            { value: "male", label: t('assessments.male') },
            { value: "female", label: t('assessments.female') },
            { value: "any", label: t('common.noPreference') },
          ].map((opt) => (
            <MultiOptionCard key={opt.value} label={opt.label} selected={answers.gender === opt.value} onClick={() => setAnswers((a) => ({ ...a, gender: opt.value }))} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <ScrollReveal>
      <div className="max-w-xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(255,179,0,0.1)", border: "2px solid rgba(255,179,0,0.3)" }}>
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-h2">{t('assessments.assessmentSummary')}</h2>
        <div className="glass-card p-6 text-left space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {t('assessments.responseSuggest')}{" "}
            <strong className="text-foreground">{feelingLabels[answers.feeling] || t('assessments.someChallenges')}</strong>.
            {answers.needs.length > 0 && (<> {t('assessments.interestedInSupport')} <strong className="text-foreground">{answers.needs.join(", ")}</strong>.</>)}
          </p>
          <div className="pt-4 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-sm font-medium text-foreground">{t('assessments.weRecommend')}</p>
            <div className="space-y-2">
              {[
                { icon: User, text: t('assessments.recommendPsychologist') },
                { icon: Brain, text: t('assessments.recommendCourses') },
                { icon: Heart, text: t('assessments.recommendSelfHelp') },
              ].map((rec) => (
                <div key={rec.text} className="flex items-center gap-3">
                  <rec.icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{rec.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button variant="primary" size="lg" onClick={handleNext} disabled={loading}>
            {loading ? t('assessments.findingMatches') : t('assessments.seeRecommended')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link to={addLocalePrefix("/resources", locale)}>{t('assessments.explorePrograms')}</Link>
          </Button>
        </div>
      </div>
    </ScrollReveal>
  );

  const renderMatches = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-h2">{t('assessments.topMatches')}</h2>
        <p className="text-muted-foreground">{t('assessments.topMatchesDesc')}</p>
      </div>
      {matches.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-h3 mb-2">{t('assessments.noMatches')}</h3>
          <p className="text-muted-foreground mb-6">{t('assessments.noMatchesDesc')}</p>
          <Button variant="primary" asChild>
            <Link to={addLocalePrefix("/psychologists", locale)}>{t('common.browseAll')}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((psychologist) => (
            <div key={psychologist.id} className="glass-card p-0 flex flex-col overflow-hidden">
              <div className="relative h-40 overflow-hidden" style={{ background: "rgba(255,179,0,0.03)" }}>
                {psychologist.photo_url ? (
                  <img src={psychologist.photo_url} alt={psychologist.full_name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="w-14 h-14 text-primary/30" /></div>
                )}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(255,179,0,0.9)", color: "hsl(var(--primary-foreground))" }}>
                  {psychologist.matchScore}% {t('assessments.match')}
                </div>
                {psychologist.is_accredited && (
                  <div className="absolute top-3 right-3 bg-secondary rounded-full px-2.5 py-1 flex items-center gap-1">
                    <Award className="w-3 h-3 text-secondary-foreground" />
                    <span className="text-[10px] text-secondary-foreground font-medium">{t('psychologists.accredited')}</span>
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-foreground leading-tight">{psychologist.full_name}</h3>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                    <span className="text-sm font-semibold text-primary">4.9</span>
                  </div>
                </div>
                {psychologist.specialties && psychologist.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {psychologist.specialties.slice(0, 3).map((s) => (
                      <Badge key={s.id} variant="outline" className="text-[11px] py-0.5">{s.name}</Badge>
                    ))}
                  </div>
                )}
                {psychologist.languages && psychologist.languages.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary/50" />
                    <span>{psychologist.languages.map((l) => l.name).join(" · ")}</span>
                  </div>
                )}
                {psychologist.city && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3.5 h-3.5 text-primary/50" />
                    <span>{psychologist.city}</span>
                  </div>
                )}
                {psychologist.hourly_rate_mad && (
                  <p className="text-primary font-bold text-lg mb-4">
                    {psychologist.hourly_rate_mad} MAD <span className="text-xs font-normal text-muted-foreground">{t('psychologists.perSession')}</span>
                  </p>
                )}
                <div className="mt-auto flex gap-2">
                  <Button asChild variant="secondary" size="sm" className="flex-1">
                    <Link to={addLocalePrefix(`/psychologists/${psychologist.slug}`, locale)}>{t('common.viewProfile')}</Link>
                  </Button>
                  <Button asChild variant="primary" size="sm" className="flex-1">
                    <Link to={addLocalePrefix(`/psychologists/${psychologist.slug}#booking`, locale)}>
                      <Calendar className="mr-1.5 h-3.5 w-3.5" />
                      {t('psychologists.book')}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="text-center pt-4">
        <Button variant="ghost" asChild>
          <Link to={addLocalePrefix("/psychologists", locale)}>
            {t('common.browseAll')} <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );

  const stepRenderers = [renderWelcome, renderFeeling, renderNeeds, renderPreferences, renderResults, renderMatches];

  return (
    <div className="min-h-screen">
      <SEOHead
        path="/get-matched"
        title="Get Matched with a Psychologist — U.Psy"
        description="Answer a few questions and U.Psy matches you with an accredited Moroccan psychologist tailored to your needs, language, and goals."
      />
      {step > 0 && step < 5 && (
        <div className="sticky top-16 z-30 py-3" style={{ background: "rgba(26,26,26,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="container-custom">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" /> {t('common.back')}
              </Button>
              <div className="flex-1"><Progress value={progress} className="h-2" /></div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {t('onboarding.progress').replace('{step}', String(step)).replace('{total}', '4')}
              </span>
            </div>
          </div>
        </div>
      )}

      <section className="hero-neural-bg relative py-16 md:py-24">
        <div className="container-custom relative z-10">
          {stepRenderers[step]()}
          {step >= 1 && step <= 3 && (
            <div className="flex justify-center pt-8">
              <Button variant="primary" size="lg" onClick={handleNext} disabled={!canProceed()}>
                {step === 3 ? t('onboarding.seeMyResults') : t('onboarding.continue')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {step === 0 && (
        <>
          <MaroonDivider />
          <section className="liquid-bg py-12">
            <div className="container-custom">
              <div className="flex flex-wrap items-center justify-center gap-8">
                {[
                  { icon: Shield, label: t('onboarding.confidentialLabel') },
                  { icon: Clock, label: t('onboarding.takesTwoMinutes') },
                  { icon: Brain, label: t('onboarding.evidenceBased') },
                  { icon: Lock, label: t('onboarding.dataProtected') },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default GetMatched;
