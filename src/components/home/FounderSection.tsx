import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { ArrowRight, Award, Brain, Target, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import mehdiPhoto from "@/assets/mehdi-felji.png";

const FounderSection = () => {
  const { t, locale } = useLocale();

  return (
    <section className="section-spacing">
      <div className="container-custom">
       <div className="mx-auto" style={{ maxWidth: "1100px" }}>
        <ScrollReveal>
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-center">
            {/* Photo — smaller, authoritative */}
            <div className="lg:col-span-2 w-full max-w-xs mx-auto lg:mx-0">
              <div className="aspect-[3/4] rounded-u-lg overflow-hidden shadow-glass">
                <img
                  src={mehdiPhoto}
                  alt="Mehdi Felji — Founder of U.Psy"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Content — editorial */}
            <div className="lg:col-span-3 space-y-6 text-center lg:text-left">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                {t("founder.sectionBadge") || "Built from the Field"}
              </span>

              <h2 className="text-h2">
                {t("founder.sectionTitle") || "A System Built on Practice, Not Theory"}
              </h2>

              {/* Quote excerpt from Mot du Président */}
              <blockquote className="text-base md:text-lg italic text-muted-foreground/80 pl-4 border-l-2 border-primary/25 leading-relaxed">
                <Quote className="w-4 h-4 text-primary/40 mb-1 inline-block" />{" "}
                {t("founder.sectionQuote") || "Psychology doesn't lack theories. It lacks applicability under pressure."}
              </blockquote>

              <p className="text-body text-muted-foreground leading-relaxed">
                {t("founder.sectionDesc") || "Mehdi Felji designed U.Psy from operational experience — in elite sport, humanitarian contexts, and institutional systems. The platform is built to diagnose, match, and train. Not to browse."}
              </p>

              {/* 3 proof cards */}
              <div className="grid sm:grid-cols-3 gap-3 pt-2">
                {[
                  {
                    icon: Brain,
                    label: t("founder.proof1") || "Clinical Psychology",
                    detail: t("founder.proof1Detail") || "CBT · Schema · EMDR practice",
                  },
                  {
                    icon: Target,
                    label: t("founder.proof2") || "Performance Psychology",
                    detail: t("founder.proof2Detail") || "Elite sport · high-stakes contexts",
                  },
                  {
                    icon: Award,
                    label: t("founder.proof3") || "Accredited Network",
                    detail: t("founder.proof3Detail") || "5-tier specialist vetting",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-u-md border border-border/60 bg-surface/60 backdrop-blur-sm p-4 text-left hover:border-secondary/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-md bg-secondary/10 text-secondary flex items-center justify-center mb-2">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-semibold text-foreground leading-tight">
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 leading-snug">
                      {item.detail}
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="secondary" size="lg" asChild>
                <Link to={addLocalePrefix("/founder", locale)} className="inline-flex items-center gap-2">
                  {t("founder.exploreWork") || "Read the Mot du Président"} <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>
       </div>
      </div>
    </section>
  );
};

export default FounderSection;
