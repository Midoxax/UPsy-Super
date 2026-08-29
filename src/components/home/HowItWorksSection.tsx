import { ArrowRight, ClipboardCheck, Search, Video } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import ScrollReveal from "@/components/ScrollReveal";

const steps = [
  {
    number: "01",
    icon: ClipboardCheck,
    titleKey: "howItWorks.step1.title" as const,
    descKey: "howItWorks.step1.description" as const,
    fallbackTitle: "Take a Self-Assessment",
    fallbackDesc: "Understand your mental wellbeing with a quick evidence-based screening.",
  },
  {
    number: "02",
    icon: Search,
    titleKey: "howItWorks.step2.title" as const,
    descKey: "howItWorks.step2.description" as const,
    fallbackTitle: "Find the Right Psychologist",
    fallbackDesc: "Filter by language, specialty, availability, and session format.",
  },
  {
    number: "03",
    icon: Video,
    titleKey: "howItWorks.step3.title" as const,
    descKey: "howItWorks.step3.description" as const,
    fallbackTitle: "Start Your Sessions",
    fallbackDesc: "Secure video consultations with licensed professionals.",
  },
];

const HowItWorksSection = () => {
  const { t } = useLocale();

  return (
    <section className="section-spacing liquid-bg" aria-label={t("howItWorks.ariaLabel") || "How it works"}>
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-h2 mb-4">{t("howItWorks.title") || "Start Your Mental Health Journey"}</h2>
            <p className="text-body text-muted-foreground">
              {t("howItWorks.subtitle") || "Three simple steps to get the support you need."}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <ScrollReveal key={step.number}>
              <div className="glass-card p-7 text-center relative">
                <div className="text-5xl font-bold text-primary/15 mb-2">{step.number}</div>
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/10 border-2 border-primary/25"
                >
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-h3 mb-3">{t(step.titleKey) || step.fallbackTitle}</h3>
                <p className="text-body text-muted-foreground text-sm">
                  {t(step.descKey) || step.fallbackDesc}
                </p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                    <ArrowRight className="w-5 h-5 text-primary/25" />
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="primary" size="lg" asChild>
            <Link to="/get-matched" className="inline-flex items-center gap-2">
              {t("howItWorks.cta") || "Get Started Now"} <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
