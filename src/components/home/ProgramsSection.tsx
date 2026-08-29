import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { Heart, Activity, Leaf, ShieldCheck, ArrowRight } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import FloatingDecorations from "./FloatingDecorations";

const programs = [
  { icon: Heart, titleKey: "programs.clinical.title" as const, descKey: "programs.clinical.desc" as const, fallbackTitle: "Clinical Care", fallbackDesc: "Evidence-based therapy for anxiety, depression, and trauma.", audiences: ["Adults", "Students"] },
  { icon: Activity, titleKey: "programs.performance.title" as const, descKey: "programs.performance.desc" as const, fallbackTitle: "Mental Performance", fallbackDesc: "Peak performance coaching for athletes and professionals.", audiences: ["Athletes", "Professionals"] },
  { icon: Leaf, titleKey: "programs.mindfulness.title" as const, descKey: "programs.mindfulness.desc" as const, fallbackTitle: "Mindfulness Training", fallbackDesc: "Structured mindfulness programs for daily resilience.", audiences: ["All Levels"] },
  { icon: ShieldCheck, titleKey: "programs.trauma.title" as const, descKey: "programs.trauma.desc" as const, fallbackTitle: "Trauma Recovery", fallbackDesc: "Specialized trauma processing and recovery pathways.", audiences: ["Adults", "Professionals"] },
];

const ProgramsSection = () => {
  const { t } = useLocale();

  return (
    <section className="section-spacing liquid-bg relative">
      <FloatingDecorations preset="warm" />
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-h2 mb-4">{t("programs.title") || "Mental Health Programs"}</h2>
            <p className="text-body text-muted-foreground">
              {t("programs.subtitle") || "Structured programs designed for lasting change."}
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.1}>
          {/* Horizontally scrollable on mobile, so it needs to be reachable and
              scrollable by keyboard; without tabIndex a keyboard-only user
              cannot reach the cards that overflow the viewport. */}
          <div
            tabIndex={0}
            role="group"
            aria-label={t("programs.title") || "Mental Health Programs"}
            className="scroll-carousel md:!grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible md:snap-none md:pb-0 md:mx-0 md:px-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
            {programs.map((program) => (
              <StaggerItem key={program.fallbackTitle}>
                <div className="card-tilt">
                <div className="glass-card p-7 h-full min-w-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5 bg-primary/8 border-2 border-primary/15">
                    <program.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t(program.titleKey) || program.fallbackTitle}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t(program.descKey) || program.fallbackDesc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {program.audiences.map((audience) => (
                      <span key={audience} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/8 text-primary border border-primary/15">
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        <div className="text-center mt-10">
          <Button variant="primary" size="lg" asChild>
            <Link to="/services" className="inline-flex items-center gap-2">
              {t("programs.cta") || "Explore Programs"} <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
