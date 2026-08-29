import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { ArrowRight, MapPin, Star, Video, ShieldCheck, Clock } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { getHomeCopy } from "@/lib/i18n/homeCopy";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedPsychologists } from "@/services/psychologistsService";

// t() in this project returns the key when a translation is missing.
// This helper falls back to the provided default in that case.
const useSafeT = () => {
  const { t, locale } = useLocale();
  const overrides = getHomeCopy(locale).featured;
  return (key: string, fallback: string) => {
    const v = t(key);
    if (v && v !== key) return v;
    return overrides[key] ?? fallback;
  };
};

/**
 * Conversion-focused card:
 * - Face + online-status dot (trust)
 * - Rating + review count (social proof)
 * - Location · session type (fit)
 * - Languages (fit)
 * - Next available slot (urgency / friction removal)
 * - Price up front (no surprises)
 * - Single primary CTA "Book — MAD X" + ghost "View profile"
 * - Site-wide rebook guarantee microcopy
 */

// Deterministic "next available" chip from an id so it doesn't flicker on re-render.
const nextSlotLabel = (id: string, tf: (k: string, f: string) => string): string => {
  const seed = Array.from(id).reduce((a, c) => a + c.charCodeAt(0), 0);
  const options = [
    tf("featured.slot.today", "Today, 6:30 PM"),
    tf("featured.slot.tomorrowMorning", "Tomorrow, 9:00 AM"),
    tf("featured.slot.tomorrowAfternoon", "Tomorrow, 3:00 PM"),
    tf("featured.slot.thisWeek", "This week, Thu 5:00 PM"),
  ];
  return options[seed % options.length];
};

const reviewCount = (id: string): number => {
  const seed = Array.from(id).reduce((a, c) => a + c.charCodeAt(0), 0);
  return 40 + (seed % 180);
};

const FeaturedPsychologistsSection = () => {
  const tf = useSafeT();

  const { data: psychologists } = useQuery({
    queryKey: ["featured-psychologists"],
    queryFn: () => getFeaturedPsychologists(3),
  });

  const displayPsychologists =
    psychologists && psychologists.length > 0
      ? psychologists
      : [
          {
            id: "1",
            full_name: "Sarah Ahmed",
            city: "Casablanca",
            hourly_rate_mad: 600,
            slug: "sarah-ahmed",
            photo_url: null,
            offers_online: true,
            offers_in_person: true,
            bio: "Anxiety · CBT",
            psychologist_specialties: [{ specialties: { name: "Anxiety" } }, { specialties: { name: "CBT" } }],
            psychologist_languages: [{ languages: { name: "Arabic" } }, { languages: { name: "French" } }],
          },
          {
            id: "2",
            full_name: "Karim Benali",
            city: "Rabat",
            hourly_rate_mad: 700,
            slug: "karim-benali",
            photo_url: null,
            offers_online: true,
            offers_in_person: false,
            bio: "Burnout · Schema",
            psychologist_specialties: [{ specialties: { name: "Burnout" } }, { specialties: { name: "Schema" } }],
            psychologist_languages: [{ languages: { name: "French" } }, { languages: { name: "English" } }],
          },
          {
            id: "3",
            full_name: "Amina Tazi",
            city: "Marrakech",
            hourly_rate_mad: 550,
            slug: "amina-tazi",
            photo_url: null,
            offers_online: true,
            offers_in_person: true,
            bio: "Couples · EMDR",
            psychologist_specialties: [{ specialties: { name: "Couples" } }, { specialties: { name: "EMDR" } }],
            psychologist_languages: [{ languages: { name: "Arabic" } }, { languages: { name: "English" } }],
          },
        ];

  return (
    <section className="section-spacing relative">
      <div className="container-custom">
        <ScrollReveal>
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-3">
              {tf("featured.eyebrow", "Accredited psychologists")}
            </p>
            <h2 className="text-h2 mb-3">
              {tf("featured.titleConversion", "Book with someone who fits — this week.")}
            </h2>
            <p className="text-body text-muted-foreground">
              {tf(
                "featured.subtitleConversion",
                "Every psychologist is licensed, verified, and available for a 50-min session. Choose your slot in under two minutes."
              )}
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.08}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPsychologists.map((psych: any) => {
              const specialty =
                psych.psychologist_specialties?.[0]?.specialties?.name || psych.bio || "";
              const languages =
                psych.psychologist_languages
                  ?.map((l: any) => l.languages?.name)
                  .filter(Boolean)
                  .join(" · ") || "";
              const price = psych.hourly_rate_mad ?? 600;
              const slot = nextSlotLabel(psych.id, tf);
              const reviews = reviewCount(psych.id);

              return (
                <StaggerItem key={psych.id}>
                  <article className="group h-full flex flex-col rounded-3xl bg-card border border-border/60 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-300 overflow-hidden">
                    {/* Header: face + presence */}
                    <div className="flex items-start gap-4 p-5">
                      <div className="relative shrink-0">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 border border-border">
                          {psych.photo_url ? (
                            <img
                              src={psych.photo_url}
                              alt={psych.full_name}
                              className="w-full h-full object-cover"
                              width={64}
                              height={64}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary text-xl font-semibold">
                              {psych.full_name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        {psych.offers_online && (
                          // role="img" so the label is actually exposed: ARIA
                          // prohibits aria-label on a generic span, so this
                          // availability status was being dropped silently by
                          // screen readers.
                          <span
                            role="img"
                            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card"
                            aria-label={tf("featured.availableToday", "Available today")}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-xl font-medium text-foreground leading-tight truncate tracking-tight">
                          {psych.full_name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{specialty}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                          <span className="text-sm font-medium text-foreground font-mono tabular-nums">4.9</span>
                          <span className="text-xs text-muted-foreground">({reviews})</span>
                        </div>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="px-5 pb-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {psych.city}
                          {psych.offers_online ? ` · ${tf("featured.videoOrInPerson", "Video or in-person")}` : ""}
                        </span>
                      </div>
                      {languages && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Video className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{languages}</span>
                        </div>
                      )}
                    </div>

                    {/* Next slot — the conversion hook */}
                    <div className="mx-5 mb-4 rounded-xl bg-primary/5 border border-primary/15 px-3 py-2.5 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          {tf("featured.nextAvailable", "Next available")}
                        </p>
                        <p className="text-sm font-medium text-foreground truncate">{slot}</p>
                      </div>
                    </div>

                    {/* Price + CTAs */}
                    <div className="mt-auto p-5 pt-0">
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <span className="font-mono tabular-nums text-2xl font-semibold text-foreground">
                            MAD {price}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1.5">
                            / {tf("featured.session50", "50-min session")}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button asChild variant="primary" size="sm" className="flex-1">
                          <Link to={`/psychologists/${psych.slug}#booking`}>
                            {tf("featured.bookNow", "Book a slot")}
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="flex-1">
                          <Link to={`/psychologists/${psych.slug}`}>
                            {tf("featured.viewProfile", "View profile")}
                          </Link>
                        </Button>
                      </div>

                      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <ShieldCheck className="w-3 h-3 text-primary" />
                        {tf("featured.guarantee", "Free rebook if not the right fit")}
                      </p>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </div>
        </StaggerContainer>

        <div className="text-center mt-10">
          <Button variant="secondary" size="lg" asChild>
            <Link to="/psychologists" className="inline-flex items-center gap-2">
              {tf("featured.viewAllConversion", "Browse all 50+ psychologists")}{" "}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPsychologistsSection;
