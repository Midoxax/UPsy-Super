import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import { Heart, Zap, BookOpen, Building2, ArrowRight } from "lucide-react";

const PathwaysSection = () => {
  const { t, locale } = useLocale();

  const pathways = [
    {
      icon: Heart,
      title: t("pathways.therapy") || "I need therapy",
      description: t("pathways.therapyDesc") || "Connect with a licensed psychologist for personalized support and evidence-based treatment.",
      href: addLocalePrefix("/psychologists", locale),
      accent: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
      borderColor: "border-primary/20 hover:border-primary/40",
    },
    {
      icon: Zap,
      title: t("pathways.performance") || "I want to improve performance",
      description: t("pathways.performanceDesc") || "Mental performance coaching for athletes and high-performers seeking peak cognitive output.",
      href: addLocalePrefix("/athlete-hub", locale),
      accent: "from-accent/10 to-accent/5",
      iconColor: "text-accent",
      borderColor: "border-accent/20 hover:border-accent/40",
    },
    {
      icon: BookOpen,
      title: t("pathways.learn") || "I want to learn",
      description: t("pathways.learnDesc") || "Structured courses, assessments, and certifications in psychology and mental wellness.",
      href: addLocalePrefix("/resources", locale),
      accent: "from-[hsl(var(--u-clinical))]/10 to-[hsl(var(--u-clinical))]/5",
      iconColor: "text-[hsl(var(--u-clinical))]",
      borderColor: "border-[hsl(var(--u-clinical))]/20 hover:border-[hsl(var(--u-clinical))]/40",
    },
    {
      icon: Building2,
      title: t("pathways.organization") || "I represent an organization",
      description: t("pathways.organizationDesc") || "Comprehensive mental wellness solutions for your team — diagnostics, programs, and reporting.",
      href: addLocalePrefix("/services/consulting-for-organizations", locale),
      accent: "from-muted to-muted/50",
      iconColor: "text-muted-foreground",
      borderColor: "border-border hover:border-primary/30",
    },
  ];

  return (
    <section className="section-spacing">
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="text-h2 mb-3">{t("pathways.title") || "How can we help you?"}</h2>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              {t("pathways.subtitle") || "Choose your path to start your journey with U.Psy."}
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.1}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {pathways.map((p) => (
              <StaggerItem key={p.title}>
                <Link
                  to={p.href}
                  className={`glass-card p-6 h-full flex flex-col group transition-all duration-300 hover:shadow-glass-hover hover:-translate-y-1 border ${p.borderColor}`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.accent} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <p.icon className={`w-6 h-6 ${p.iconColor}`} />
                  </div>
                  <h3 className="text-foreground font-semibold mb-2 text-sm">{p.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{p.description}</p>
                  <div className="flex items-center gap-1 mt-4 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                    {t("pathways.explore") || "Explore"} <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </div>
    </section>
  );
};

export default PathwaysSection;
