import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { Users, ArrowRight, MessageCircle, Calendar, Sparkles, ShieldCheck } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";

const CommunitySection = () => {
  const { t } = useLocale();

  const features = [
    { icon: MessageCircle, title: "Live group sessions", desc: "Weekly themed circles led by accredited psychologists." },
    { icon: Calendar, title: "Workshops & masterclasses", desc: "Skill-building modules on resilience, focus and recovery." },
    { icon: Sparkles, title: "Peer accountability", desc: "Small cohorts to track habits, journaling and progress together." },
    { icon: ShieldCheck, title: "Moderated & private", desc: "A safe, vetted space — no anonymous trolling, no judgement." },
  ];

  const stats = [
    { value: "1,200+", label: "Active members" },
    { value: "30+", label: "Live events / month" },
    { value: "4.9/5", label: "Member rating" },
  ];

  return (
    <section className="section-spacing liquid-bg">
      <div className="container-custom max-w-5xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-primary/10 border-2 border-primary/20">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-h2 mb-4">{t("community.title") || "Join the U.Psy Community"}</h2>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              {t("community.subtitle") || "Connect with psychologists and peers for live sessions, discussions, and shared growth."}
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.1}>
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {features.map((f) => (
              <StaggerItem key={f.title}>
                <div className="glass-card p-5 h-full flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        <ScrollReveal>
          <div className="glass-card p-8 md:p-10 text-center">
            <div className="grid grid-cols-3 gap-4 mb-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl md:text-3xl font-bold text-primary">{s.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground/80 mb-6 italic max-w-xl mx-auto">
              {t("community.reassurance") || "A safe, moderated space for meaningful conversations about mental health."}
            </p>
            <Button variant="primary" size="lg" asChild>
              <Link to="/skool" className="inline-flex items-center gap-2">
                {t("community.cta") || "Join Community"} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CommunitySection;
