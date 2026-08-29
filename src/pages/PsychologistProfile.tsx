import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useSearchParams } from "@/lib/router-compat";
import { usePsychologistProfile } from "@/hooks/usePsychologistProfile";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import MatchingFormModal from "@/components/matching/MatchingFormModal";
import { BookingWidget } from "@/components/psychologists/BookingWidget";
import BookingModal from "@/components/psychologists/BookingModal";
import { PoliciesDrawer } from "@/components/psychologists/PoliciesDrawer";
import ReviewsList from "@/components/psychologists/ReviewsList";
import { AccreditationBadge, getTierFromProfile } from "@/components/psychologists/AccreditationBadge";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Award, MapPin, Globe, User, ArrowLeft,
  Calendar, Shield, Clock, Star, MessageSquare,
  Briefcase, Languages, Brain, BookOpen, CheckCircle2,
  Video, Building2,
} from "lucide-react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PsychologistProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { data: psychologist, isLoading, error } = usePsychologistProfile(id!);
  const { t, locale } = useLocale();
  const [isMatchingModalOpen, setIsMatchingModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [specialties, setSpecialties] = useState<{ id: string; name: string }[]>([]);
  const [languages, setLanguages] = useState<{ id: string; name: string }[]>([]);
  const [reviewStats, setReviewStats] = useState({ count: 0, avg: 0 });
  const [availabilitySlots, setAvailabilitySlots] = useState<{ day_of_week: number; start_time: string; end_time: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [s, l] = await Promise.all([
        supabase.from("specialties").select("id, name").order("name"),
        supabase.from("languages").select("id, name").order("name"),
      ]);
      if (s.data) setSpecialties(s.data);
      if (l.data) setLanguages(l.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!psychologist) return;
    const fetchExtras = async () => {
      const [reviewsRes, slotsRes] = await Promise.all([
        supabase.from("reviews").select("rating").eq("psychologist_id", psychologist.id),
        supabase.from("availability_slots").select("day_of_week, start_time, end_time").eq("psychologist_id", psychologist.id).eq("is_available", true).order("day_of_week").order("start_time"),
      ]);
      if (reviewsRes.data && reviewsRes.data.length > 0) {
        const avg = reviewsRes.data.reduce((s, r) => s + r.rating, 0) / reviewsRes.data.length;
        setReviewStats({ count: reviewsRes.data.length, avg: Math.round(avg * 10) / 10 });
      }
      if (slotsRes.data) setAvailabilitySlots(slotsRes.data);
    };
    fetchExtras();
  }, [psychologist]);

  const availabilityByDay = useMemo(() => {
    const map = new Map<number, string[]>();
    availabilitySlots.forEach((s) => {
      const existing = map.get(s.day_of_week) || [];
      existing.push(`${s.start_time.slice(0, 5)} – ${s.end_time.slice(0, 5)}`);
      map.set(s.day_of_week, existing);
    });
    return map;
  }, [availabilitySlots]);

  useEffect(() => {
    if (psychologist) {
      document.title = `${psychologist.full_name} – Psychologist | U.Psy`;
    }
  }, [psychologist]);

  // Auto-open the booking widget when arriving via a shared "?book=1" link
  useEffect(() => {
    if (!psychologist) return;
    if (searchParams.get("book") !== "1") return;
    const t = setTimeout(() => {
      setIsBookingModalOpen(true);
      const el = document.getElementById("booking-widget");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
    return () => clearTimeout(t);
  }, [psychologist, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error || !psychologist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="rounded-2xl border border-border bg-card p-12 text-center max-w-md shadow-lg">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('profile.notFound')}</h2>
          <p className="text-muted-foreground mb-6">{t('profile.notFoundDesc')}</p>
          <Button asChild variant="primary">
            <Link to={addLocalePrefix("/psychologists", locale)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('profile.backToDirectory')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const scrollToBooking = () => setIsBookingModalOpen(true);
  const yearsExperience = psychologist.created_at
    ? Math.max(1, new Date().getFullYear() - new Date(psychologist.created_at).getFullYear())
    : 5;
  const therapyApproaches = psychologist.therapy_approaches || [];
  const accreditationTier = getTierFromProfile(
    (psychologist as any).accreditation_level,
    psychologist.is_accredited
  );

  return (
    <div className="min-h-screen pb-24 lg:pb-8 bg-background">
      <SEOHead
        path={`/psychologists/${psychologist.slug}`}
        title={`${psychologist.full_name} — Psychologist in Morocco | U.Psy`}
        description={(psychologist.bio || `${psychologist.full_name} is an accredited psychologist on U.Psy offering evidence-based sessions in Morocco.`).slice(0, 155)}
        ogImage={(psychologist as any).avatar_url || undefined}
        ogType="profile"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Physician",
          name: psychologist.full_name,
          medicalSpecialty: "Psychiatric",
          url: `https://upsy.ma/psychologists/${psychologist.slug}`,
          image: (psychologist as any).avatar_url || undefined,
          description: psychologist.bio || undefined,
          knowsLanguage: (psychologist as any).languages || undefined,
          areaServed: { "@type": "Country", name: "Morocco" },
          ...(reviewStats.count > 0 ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: reviewStats.avg,
              reviewCount: reviewStats.count,
            }
          } : {}),
        }}
      />

      <div id="booking-widget">
        <BookingWidget
          psychologistId={psychologist.id}
          psychologistName={psychologist.full_name}
          hourlyRate={psychologist.hourly_rate_mad ?? undefined}
          offersOnline={psychologist.offers_online ?? true}
          offersInPerson={psychologist.offers_in_person ?? false}
        />
      </div>

      {/* ── PREMIUM HERO ── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--background)) 100%)',
        }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 30% 20%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 70% 80%, hsl(var(--accent)) 0%, transparent 50%)',
        }} />

        <div className="container-custom relative z-10 pt-6 pb-10">
          {/* Back nav */}
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground mb-6">
            <Link to={addLocalePrefix("/psychologists", locale)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('profile.backToDirectory')}
            </Link>
          </Button>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Large photo */}
            <div className="relative shrink-0 group">
              {psychologist.photo_url ? (
                <img
                  src={psychologist.photo_url}
                  alt={psychologist.full_name}
                  className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl object-cover shadow-2xl transition-transform group-hover:scale-[1.02]"
                  style={{ border: '4px solid hsl(var(--primary) / 0.15)' }}
                  loading="lazy"
                />
              ) : (
                <div
                  className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl flex items-center justify-center shadow-2xl"
                  style={{ background: 'hsl(var(--primary) / 0.08)', border: '4px solid hsl(var(--primary) / 0.15)' }}
                >
                  <User className="w-20 h-20 text-primary/40" />
                </div>
              )}
              {/* Accreditation badge overlay */}
              <div className="absolute -bottom-3 -right-3">
                <AccreditationBadge tier={accreditationTier} variant="compact" />
              </div>
            </div>

            {/* Profile info */}
            <div className="flex-1 space-y-4 min-w-0">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-3">
                  {psychologist.full_name}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {psychologist.offers_online && (
                    <Badge variant="outline" className="gap-1.5 text-xs border-primary/20 text-primary bg-primary/5">
                      <Video className="h-3 w-3" /> Online
                    </Badge>
                  )}
                  {psychologist.offers_in_person && (
                    <Badge variant="outline" className="gap-1.5 text-xs border-primary/20 text-primary bg-primary/5">
                      <Building2 className="h-3 w-3" /> In-Person
                    </Badge>
                  )}
                  {psychologist.city && (
                    <Badge variant="outline" className="gap-1.5 text-xs border-border text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {psychologist.city}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Languages */}
              {psychologist.languages.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Languages className="w-4 h-4 text-primary shrink-0" />
                  {psychologist.languages.map((l) => (
                    <Badge key={l.id} variant="secondary" className="text-xs">{l.name}</Badge>
                  ))}
                </div>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 text-sm">
                {reviewStats.count > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(reviewStats.avg) ? "fill-primary text-primary" : "text-muted-foreground/20"}`} />
                      ))}
                    </div>
                    <span className="font-bold text-foreground">{reviewStats.avg}</span>
                    <span className="text-muted-foreground">({reviewStats.count})</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  <span>{yearsExperience}+ {t('profile.years')}</span>
                </div>
                {psychologist.hourly_rate_mad && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-primary text-lg">{psychologist.hourly_rate_mad} MAD</span>
                    <span className="text-muted-foreground text-xs">/ session</span>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="primary" size="lg" onClick={scrollToBooking} className="shadow-lg shadow-primary/20">
                  <Calendar className="mr-2 h-4 w-4" />
                  {t('booking.bookSession')}
                </Button>
                <Button variant="secondary" size="lg" onClick={() => setIsMatchingModalOpen(true)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t('profile.getMatched')}
                </Button>
                <PoliciesDrawer />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="py-10">
        <div className="container-custom lg:max-w-5xl xl:max-w-6xl">
          <div className="lg:pr-[340px] space-y-8">

            {/* Accreditation Block (Full) */}
            <ScrollReveal>
              <AccreditationBadge tier={accreditationTier} variant="full" />
            </ScrollReveal>

            {/* About */}
            {psychologist.bio && (
              <ScrollReveal>
                <div className="rounded-2xl border border-border bg-card p-7 shadow-xs">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    {t('profile.about')}
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{psychologist.bio}</p>
                </div>
              </ScrollReveal>
            )}

            {/* Specialties */}
            {psychologist.specialties.length > 0 && (
              <ScrollReveal>
                <div className="rounded-2xl border border-border bg-card p-7 shadow-xs">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    {t('profile.specialties')}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {psychologist.specialties.map((s) => (
                      <Badge key={s.id} variant="outline" className="text-sm py-2 px-4 bg-primary/5 text-foreground border-primary/15 hover:bg-primary/10 transition-colors">
                        {s.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Methods / Therapy Approaches */}
            {therapyApproaches.length > 0 && (
              <ScrollReveal>
                <div className="rounded-2xl border border-border bg-card p-7 shadow-xs">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    {t('profile.therapyApproach')}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {therapyApproaches.map((approach) => (
                      <div key={approach.id} className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm font-medium text-foreground">{approach.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {therapyApproaches.length === 0 && (
              <ScrollReveal>
                <div className="rounded-2xl border border-border bg-card p-7 shadow-xs">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    {t('profile.therapyApproach')}
                  </h2>
                  <div className="space-y-4">
                    {[
                      { method: t('profile.cbt'), desc: t('profile.cbtDesc') },
                      { method: t('profile.evidenceBased'), desc: t('profile.evidenceBasedDesc') },
                      { method: t('profile.clientCentered'), desc: t('profile.clientCenteredDesc') },
                    ].map((approach) => (
                      <div key={approach.method} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-foreground font-medium text-sm">{approach.method}</p>
                          <p className="text-muted-foreground text-sm">{approach.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Weekly Availability */}
            {availabilitySlots.length > 0 && (
              <ScrollReveal>
                <div className="rounded-2xl border border-border bg-card p-7 shadow-xs">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Weekly Availability
                    </h2>
                    <Button variant="primary" size="sm" onClick={scrollToBooking}>
                      <Calendar className="mr-2 h-3.5 w-3.5" />
                      Book a Slot
                    </Button>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {DAY_LABELS.map((day, i) => {
                      const hasSlots = availabilityByDay.has(i);
                      return (
                        <div key={day} className="text-center">
                          <p className={`text-xs font-semibold mb-2 ${hasSlots ? 'text-primary' : 'text-muted-foreground/40'}`}>{day}</p>
                          <div className={`rounded-xl p-2.5 min-h-[64px] flex flex-col items-center justify-center gap-1 transition-colors ${hasSlots ? 'bg-primary/5 border border-primary/20' : 'bg-muted/20 border border-transparent'}`}>
                            {hasSlots ? (
                              availabilityByDay.get(i)!.map((slot, j) => (
                                <span key={j} className="text-[10px] font-medium text-primary whitespace-nowrap">{slot.split(' – ')[0]}</span>
                              ))
                            ) : (
                              <span className="text-[10px] text-muted-foreground/40">—</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Times shown in your local timezone
                  </p>
                </div>
              </ScrollReveal>
            )}

            {/* Experience & Training */}
            <ScrollReveal>
              <div className="rounded-2xl border border-border bg-card p-7 shadow-xs">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {t('profile.experienceTraining')}
                </h2>
                <div className="space-y-0 divide-y divide-border/50">
                  {[
                    { label: t('profile.yearsOfPractice'), value: `${yearsExperience}+ ${t('profile.years')}` },
                    { label: t('profile.education'), value: t('profile.educationValue') },
                    { label: t('profile.certifications'), value: t('profile.certificationsValue') },
                    { label: t('profile.supervision'), value: t('profile.supervisionValue') },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm text-foreground font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Session Fees */}
            {psychologist.hourly_rate_mad && (
              <ScrollReveal>
                <div className="rounded-2xl border border-border bg-card p-7 shadow-xs">
                  <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    {t('profile.sessionFees')}
                  </h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { duration: "30 min", rate: Math.round(psychologist.hourly_rate_mad * 0.5), label: t('profile.briefCheckin'), popular: false },
                      { duration: "60 min", rate: psychologist.hourly_rate_mad, label: t('profile.standardSession'), popular: true },
                      { duration: "90 min", rate: Math.round(psychologist.hourly_rate_mad * 1.5), label: t('profile.extendedSession'), popular: false },
                    ].map((tier) => (
                      <button
                        key={tier.duration}
                        className={`relative p-5 rounded-xl text-center transition-all hover:scale-[1.02] cursor-pointer border ${tier.popular ? 'ring-2 ring-primary/30 border-primary/30 bg-primary/5' : 'border-border bg-muted/30 hover:border-primary/20'}`}
                        onClick={scrollToBooking}
                      >
                        {tier.popular && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-3 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                        <p className="text-xs text-muted-foreground mb-1">{tier.label}</p>
                        <p className="text-2xl font-bold text-primary mb-1">{tier.rate} <span className="text-sm font-normal text-muted-foreground">MAD</span></p>
                        <p className="text-xs text-muted-foreground">{tier.duration}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Session Options */}
            <ScrollReveal>
              <div className="rounded-2xl border border-border bg-card p-7 shadow-xs">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  {t('profile.sessionOptions')}
                </h2>
                <div className="flex gap-3 flex-wrap">
                  {psychologist.offers_online && (
                    <div className="flex items-center gap-2.5 p-4 rounded-xl bg-primary/5 border border-primary/15">
                      <Video className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{t('booking.onlineSessions')}</p>
                        <p className="text-xs text-muted-foreground">Secure video platform</p>
                      </div>
                    </div>
                  )}
                  {psychologist.offers_in_person && (
                    <div className="flex items-center gap-2.5 p-4 rounded-xl bg-primary/5 border border-primary/15">
                      <Building2 className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{t('booking.inPersonSessions')}</p>
                        {psychologist.city && <p className="text-xs text-muted-foreground">{psychologist.city}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Reviews */}
            <ReviewsList psychologistId={psychologist.id} />

            {/* Final CTA */}
            <ScrollReveal>
              <div className="rounded-2xl border border-primary/20 p-10 text-center shadow-xs" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.04), hsl(var(--accent) / 0.04))' }}>
                <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">{t('booking.readyToBook')}</h2>
                <p className="text-muted-foreground mb-6 text-sm max-w-md mx-auto">
                  {t('booking.scheduleSession').replace('{name}', psychologist.full_name)}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button variant="primary" size="lg" onClick={() => setIsBookingModalOpen(true)} className="shadow-lg shadow-primary/20">
                    <Calendar className="mr-2 h-4 w-4" />
                    {t('booking.bookSession')}
                  </Button>
                  <Button variant="secondary" size="lg" onClick={() => setIsMatchingModalOpen(true)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t('profile.getMatched')}
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <MatchingFormModal open={isMatchingModalOpen} onClose={() => setIsMatchingModalOpen(false)} specialties={specialties} languages={languages} />
      <BookingModal open={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} psychologistId={psychologist.id} psychologistName={psychologist.full_name} hourlyRate={psychologist.hourly_rate_mad} offersOnline={psychologist.offers_online} offersInPerson={psychologist.offers_in_person} city={psychologist.city} depositPercentage={(psychologist as any).deposit_percentage} />
    </div>
  );
};

export default PsychologistProfile;
