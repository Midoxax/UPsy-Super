import { Heart, BookOpen, Activity, Building2, ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";

const pillars = [
  {
    icon: Heart,
    titleKey: "pillars.care.title" as const,
    descKey: "pillars.care.description" as const,
    fallbackTitle: "Care",
    fallbackDesc: "Online psychological consultations with licensed professionals.",
    href: "/services",
    colorVar: "hsl(var(--secondary))",
    bgVar: "hsl(var(--secondary) / 0.08)",
    borderVar: "hsl(var(--secondary) / 0.25)",
  },
  {
    icon: BookOpen,
    titleKey: "pillars.learning.title" as const,
    descKey: "pillars.learning.description" as const,
    fallbackTitle: "Learning",
    fallbackDesc: "Courses and mental-health education for personal growth.",
    href: "/resources",
    colorVar: "hsl(var(--primary))",
    bgVar: "hsl(var(--primary) / 0.08)",
    borderVar: "hsl(var(--primary) / 0.25)",
  },
  {
    icon: Activity,
    titleKey: "pillars.performance.title" as const,
    descKey: "pillars.performance.description" as const,
    fallbackTitle: "Performance",
    fallbackDesc: "Mental performance coaching for athletes and high performers.",
    href: "/services",
    colorVar: "hsl(var(--gold-highlight, 39 100% 48%))",
    bgVar: "hsl(var(--gold-highlight, 39 100% 48%) / 0.08)",
    borderVar: "hsl(var(--gold-highlight, 39 100% 48%) / 0.25)",
  },
  {
    icon: Building2,
    titleKey: "pillars.organizations.title" as const,
    descKey: "pillars.organizations.description" as const,
    fallbackTitle: "Organizations",
    fallbackDesc: "Mental-health solutions for institutions and sports organizations.",
    href: "/services/consulting-for-organizations",
    colorVar: "hsl(var(--secondary))",
    bgVar: "hsl(var(--secondary) / 0.08)",
    borderVar: "hsl(var(--secondary) / 0.25)",
  },
];

const PillarsSection = () => {
  const { t } = useLocale();

  return (
    <section className="section-spacing liquid-bg" aria-label={t("pillars.ariaLabel") || "Our four pillars"}>
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-h2 mb-4">{t("pillars.title") || "The U.Psy Ecosystem"}</h2>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              {t("pillars.subtitle") || "A comprehensive mental-health ecosystem — from clinical care to organizational transformation."}
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.1}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar) => (
              <StaggerItem key={pillar.fallbackTitle}>
                <Link to={pillar.href} className="block h-full">
                  <div className="glass-card p-7 h-full group">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                      style={{ background: pillar.bgVar, border: `2px solid ${pillar.borderVar}` }}
                    >
                      <pillar.icon className="w-7 h-7" style={{ color: pillar.colorVar }} />
                    </div>
                    <h3 className="text-h3 mb-3">{t(pillar.titleKey) || pillar.fallbackTitle}</h3>
                    <p className="text-body text-muted-foreground text-sm leading-relaxed mb-4">
                      {t(pillar.descKey) || pillar.fallbackDesc}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                      {t("pillars.learnMore") || "Learn more"} <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        <div className="text-center mt-10">
          <Button variant="secondary" size="lg" asChild>
            <Link to="/services" className="inline-flex items-center gap-2">
              {t("pillars.cta") || "Explore All Services"} <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PillarsSection;
