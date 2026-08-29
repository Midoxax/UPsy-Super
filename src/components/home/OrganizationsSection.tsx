import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { Building2, HeartHandshake, Trophy, ArrowRight, CheckCircle2, BarChart3 } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";

const services = [
  {
    icon: Building2,
    titleKey: "orgs.corporate.title" as const,
    descKey: "orgs.corporate.desc" as const,
    fallbackTitle: "Corporate Wellbeing",
    fallbackDesc: "Employee mental health programs, workshops, and EAP solutions.",
    bullets: ["Confidential 1:1 sessions", "Burnout & stress audits", "Manager training"],
  },
  {
    icon: HeartHandshake,
    titleKey: "orgs.ngo.title" as const,
    descKey: "orgs.ngo.desc" as const,
    fallbackTitle: "NGO Mental Health",
    fallbackDesc: "Scalable mental health programs for humanitarian organizations.",
    bullets: ["Field-team support", "Crisis & trauma response", "Multilingual delivery"],
  },
  {
    icon: Trophy,
    titleKey: "orgs.sports.title" as const,
    descKey: "orgs.sports.desc" as const,
    fallbackTitle: "Sports Organizations",
    fallbackDesc: "Performance psychology and athlete wellbeing for clubs and federations.",
    bullets: ["Pre-competition prep", "Injury recovery", "Team cohesion"],
  },
];

const proof = [
  { value: "12+", label: "Partner organizations" },
  { value: "3,500+", label: "Employees & athletes served" },
  { value: "92%", label: "Program satisfaction" },
];

const OrganizationsSection = () => {
  const { t } = useLocale();

  return (
    <section className="section-spacing liquid-bg">
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-h2 mb-4">{t("orgs.title") || "Mental Health for Organizations"}</h2>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              {t("orgs.subtitle") || "Tailored solutions for teams, institutions, and sports organizations."}
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.15}>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            {services.map((service) => (
              <StaggerItem key={service.fallbackTitle}>
                <div className="glass-card p-7 h-full flex flex-col">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 bg-primary/8 border-2 border-primary/15">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t(service.titleKey) || service.fallbackTitle}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t(service.descKey) || service.fallbackDesc}</p>
                  <ul className="space-y-2 mt-auto">
                    {service.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        <ScrollReveal>
          <div className="glass-card p-6 md:p-8 max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-center gap-2 mb-5 text-xs uppercase tracking-wider text-muted-foreground">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>Proven impact</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {proof.map((p) => (
                <div key={p.label}>
                  <div className="text-2xl md:text-3xl font-bold text-primary">{p.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">{p.label}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="text-center">
          <Button variant="primary" size="lg" asChild>
            <Link to="/services/consulting-for-organizations" className="inline-flex items-center gap-2">
              {t("orgs.cta") || "Request a Proposal"} <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OrganizationsSection;
