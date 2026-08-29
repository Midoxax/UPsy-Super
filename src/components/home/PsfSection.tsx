import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { Globe, Heart, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";

/**
 * PSF Homepage Section — independent module.
 * Responsibility: Surface the PSF initiative and drive traffic to /psf.
 * Data source: Static (no DB dependency).
 */
const PsfSection = () => {
  const { locale, t } = useLocale();

  const safeT = (key: string, fallback: string) => {
    const val = t(key);
    return val === key ? fallback : val;
  };

  return (
    <section className="section-spacing liquid-bg">
      <div className="container-custom">
        <div className="glass-card p-10 md:p-14 max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Icon / Visual */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-secondary/10 border-2 border-secondary/30">
                  <div className="relative">
                    <Globe className="w-10 h-10 text-secondary" />
                    <Heart className="w-5 h-5 text-primary absolute -bottom-1 -right-1 fill-primary" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20 mb-4">
                  {safeT("psf.sectionBadge", "Social Impact Initiative")}
                </span>
                <h2 className="text-h2 mb-3">{safeT("psf.sectionTitle", "Psychologues Sans Frontières")}</h2>
                <p className="text-body text-muted-foreground mb-6 max-w-xl">
                  {safeT("psf.sectionDesc", "Bringing free mental health support to underserved communities across Morocco and beyond. Our volunteer psychologists provide pro-bono sessions, crisis intervention, and community workshops to those who need it most.")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Button variant="secondary" size="lg" asChild>
                    <Link to={addLocalePrefix("/psf", locale)} className="inline-flex items-center gap-2">
                      {safeT("psf.learnMore", "Learn More")} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="primary" size="lg" asChild>
                    <Link to={addLocalePrefix("/apply", locale)} className="inline-flex items-center gap-2">
                      {safeT("psf.volunteerAs", "Volunteer as Psychologist")}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-border/30">
              {[
                { value: "500+", labelKey: "psf.statSessionsLabel", fallback: "Free Sessions Given" },
                { value: "12", labelKey: "psf.statRegionsLabel", fallback: "Regions Covered" },
                { value: "50+", labelKey: "psf.statVolunteersLabel", fallback: "Volunteer Psychologists" },
              ].map((stat) => (
                <div key={stat.labelKey} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{safeT(stat.labelKey, stat.fallback)}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default PsfSection;
