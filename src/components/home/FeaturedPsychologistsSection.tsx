import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import {
  ArrowRight,
  MapPin,
  Star,
  Video,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { getHomeCopy } from "@/lib/i18n/homeCopy";
import { addLocalePrefix } from "@/lib/i18n/utils";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedPsychologists } from "@/services/psychologistsService";
import { photoUrl } from "@/lib/images/photoUrl";

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
 * - Rating + review count, only when real reviews exist (social proof)
 * - Location · session type (fit)
 * - Languages (fit)
 * - Next available slot, only when the specialist has published one
 * - Price up front (no surprises)
 * - Single primary CTA "Book — MAD X" + ghost "View profile"
 * - Verification note (what U.Psy actually checked)
 */

const FeaturedPsychologistsSection = () => {
  const tf = useSafeT();
  const { locale } = useLocale();

  const { data: psychologists } = useQuery({
    queryKey: ["featured-psychologists"],
    queryFn: () => getFeaturedPsychologists(3),
  });

  // Only real, published specialists. No placeholder profiles: a visitor
  // who books a made-up person is a broken promise.
  const displayPsychologists = psychologists ?? [];
  if (displayPsychologists.length === 0) return null;

  return (
    <section className="section-spacing relative">
      <div className="container-custom">
        <ScrollReveal>
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-3">
              {tf("featured.eyebrow", "Accredited psychologists")}
            </p>
            <h2 className="text-h2 mb-3">
              {tf(
                "featured.titleConversion",
                "Book with someone who fits — this week.",
              )}
            </h2>
            <p className="text-body text-muted-foreground">
              {tf(
                "featured.subtitleConversion",
                "Every psychologist is licensed and verified by U.Psy before their profile goes live. Choose a time in under two minutes.",
              )}
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.08}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPsychologists.map((psych: any) => {
              const specialty =
                psych.psychologist_specialties?.[0]?.specialties?.name ||
                psych.bio ||
                "";
              const languages =
                psych.psychologist_languages
                  ?.map((l: any) => l.languages?.name)
                  .filter(Boolean)
                  .join(" · ") || "";
              const price: number | null = psych.hourly_rate_mad ?? null;
              const rating: number | null = psych.rating_avg ?? null;
              const reviews: number = psych.rating_count ?? 0;
              const slot: string | null = psych.next_available
                ? new Intl.DateTimeFormat(
                    locale === "ar"
                      ? "ar-MA"
                      : locale === "fr"
                        ? "fr-MA"
                        : "en-GB",
                    {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  ).format(new Date(psych.next_available))
                : null;

              return (
                <StaggerItem key={psych.id}>
                  <article className="group h-full flex flex-col rounded-3xl bg-card border border-border/60 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-300 overflow-hidden">
                    {/* Header: face + presence */}
                    <div className="flex items-start gap-4 p-5">
                      <div className="relative shrink-0">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 border border-border">
                          {psych.photo_url ? (
                            <img
                              src={photoUrl(psych.photo_url, 64)}
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
                            aria-label={tf(
                              "featured.offersVideo",
                              "Offers video sessions",
                            )}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-xl font-medium text-foreground leading-tight truncate tracking-tight">
                          {psych.full_name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {specialty}
                        </p>
                        {rating !== null && reviews > 0 ? (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                            <span className="text-sm font-medium text-foreground font-mono tabular-nums">
                              {rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({reviews})
                            </span>
                          </div>
                        ) : (
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            {tf("featured.newOnUpsy", "New on U.Psy")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="px-5 pb-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {psych.city}
                          {psych.offers_online
                            ? ` · ${tf("featured.videoOrInPerson", "Video or in-person")}`
                            : ""}
                        </span>
                      </div>
                      {languages && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Video className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{languages}</span>
                        </div>
                      )}
                    </div>

                    {/* Next slot: only a real one the specialist published */}
                    {slot && (
                      <div className="mx-5 mb-4 rounded-xl bg-primary/5 border border-primary/15 px-3 py-2.5 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                            {tf("featured.nextAvailable", "Next available")}
                          </p>
                          <p className="text-sm font-medium text-foreground truncate">
                            {slot}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Price + CTAs */}
                    <div className="mt-auto p-5 pt-0">
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          {price !== null ? (
                            <>
                              <span className="font-mono tabular-nums text-2xl font-semibold text-foreground">
                                MAD {price}
                              </span>
                              <span className="text-xs text-muted-foreground ml-1.5">
                                / {tf("featured.session50", "50-min session")}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {tf(
                                "featured.feesOnProfile",
                                "Fees on the profile",
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          asChild
                          variant="primary"
                          size="sm"
                          className="flex-1"
                        >
                          <Link
                            to={`${addLocalePrefix(`/psychologists/${psych.slug}`, locale)}?book=1`}
                          >
                            {tf("featured.bookNow", "Book a slot")}
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                        >
                          <Link
                            to={addLocalePrefix(
                              `/psychologists/${psych.slug}`,
                              locale,
                            )}
                          >
                            {tf("featured.viewProfile", "View profile")}
                          </Link>
                        </Button>
                      </div>

                      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <ShieldCheck className="w-3 h-3 text-primary" />
                        {tf(
                          "featured.verified",
                          "Diploma and identity checked by U.Psy",
                        )}
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
            <Link
              to="/psychologists"
              className="inline-flex items-center gap-2"
            >
              {tf("featured.viewAllConversion", "Browse all psychologists")}{" "}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPsychologistsSection;
