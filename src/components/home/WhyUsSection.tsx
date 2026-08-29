import { Link } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";

const differentiators = [
  {
    num: "01",
    titleKey: "whyUs.items.system.title",
    descKey: "whyUs.items.system.desc",
    fallbackTitle: "Performance Psychology System",
    fallbackDesc:
      "Not a therapy directory. A full operational SaaS that measures, identifies, trains, and applies psychological skills under pressure.",
  },
  {
    num: "02",
    titleKey: "whyUs.items.accreditation.title",
    descKey: "whyUs.items.accreditation.desc",
    fallbackTitle: "5-Tier Clinical Accreditation",
    fallbackDesc:
      "Every specialist is verified through a multi-stage clinical accreditation. No self-declared credentials, no marketplace inflation.",
  },
  {
    num: "03",
    titleKey: "whyUs.items.morocco.title",
    descKey: "whyUs.items.morocco.desc",
    fallbackTitle: "Built for Morocco",
    fallbackDesc:
      "Trilingual (EN / FR / AR-RTL), Law 09-08 compliant, MAD pricing, local payment rails, and authentic Moroccan clinical culture.",
  },
  {
    num: "04",
    titleKey: "whyUs.items.rigor.title",
    descKey: "whyUs.items.rigor.desc",
    fallbackTitle: "Clinical Rigor",
    fallbackDesc:
      "Validated instruments (GAD-7, PHQ-9), evidence-based protocols (CBT, Schema, EMDR), and structured session notes — not generic advice.",
  },
  {
    num: "05",
    titleKey: "whyUs.items.ecosystem.title",
    descKey: "whyUs.items.ecosystem.desc",
    fallbackTitle: "Integrated Ecosystem",
    fallbackDesc:
      "Marketplace, MOOC, B2B programs, AI tools (Nour), and crisis protocol — one platform, not a stitched-together patchwork.",
  },
  {
    num: "06",
    titleKey: "whyUs.items.privacy.title",
    descKey: "whyUs.items.privacy.desc",
    fallbackTitle: "Privacy by Design",
    fallbackDesc:
      "Strict row-level security, encrypted clinical notes, breached-password checks, mandatory email verification, and zero data resale.",
  },
] as const;

const WhyUsSection = () => {
  const { t } = useLocale();

  return (
    <section
      className="section-spacing relative overflow-hidden"
      aria-label={t("whyUs.ariaLabel") || "Why U.Psy"}
    >
      {/* Ambient gold particles */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[15%] left-[8%] h-2 w-2 rounded-full bg-secondary/40 motion-breathe" />
        <div className="absolute top-[40%] right-[12%] h-3 w-3 rounded-full bg-primary/20 motion-breathe" style={{ animationDelay: "0.6s" }} />
        <div className="absolute bottom-[25%] left-[20%] h-2 w-2 rounded-full bg-secondary/30 motion-breathe" style={{ animationDelay: "1.2s" }} />
        <div className="absolute bottom-[10%] right-[25%] h-2.5 w-2.5 rounded-full bg-primary/25 motion-breathe" style={{ animationDelay: "0.3s" }} />
      </div>

      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/40 bg-secondary/5 text-secondary text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {t("whyUs.eyebrow") || "Why U.Psy"}
          </div>
          <h2 className="text-h2 mb-5">
            {t("whyUs.title") || "Six reasons we're not another therapy directory."}
          </h2>
          <p className="text-body text-muted-foreground">
            {t("whyUs.subtitle") ||
              "Most platforms list therapists. We operate a complete performance psychology system — clinical, measurable, and built for Morocco."}
          </p>
        </motion.div>

        {/* Zigzag list */}
        <ol className="relative max-w-5xl mx-auto space-y-12 md:space-y-20">
          {/* Vertical connector — desktop only */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />

          {differentiators.map((item, idx) => {
            const isLeft = idx % 2 === 0;
            return (
              <motion.li
                key={item.num}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
                className={`relative grid md:grid-cols-2 gap-6 md:gap-12 items-center ${
                  isLeft ? "" : "md:[&>*:first-child]:order-2"
                }`}
              >
                {/* Numeral block */}
                <div className={`flex ${isLeft ? "md:justify-end" : "md:justify-start"}`}>
                  <div className="group relative">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative glass-card px-8 py-6 md:px-12 md:py-10 rounded-3xl flex items-center gap-5">
                      <span className="text-5xl md:text-7xl font-bold text-primary leading-none [font-family:var(--font-heading,inherit)] tabular-nums">
                        {item.num}
                      </span>
                      <span className="hidden md:block h-px w-16 bg-gradient-to-r from-secondary to-transparent" />
                    </div>
                    {/* Connector dot — desktop only */}
                    <span
                      className={`hidden md:block absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-secondary ring-4 ring-secondary/20 ${
                        isLeft ? "-right-[calc(50vw-50%)] md:right-auto md:left-[calc(100%+1.5rem)]" : "-left-[calc(50vw-50%)] md:left-auto md:right-[calc(100%+1.5rem)]"
                      }`}
                      aria-hidden
                    />
                  </div>
                </div>

                {/* Content */}
                <div className={isLeft ? "md:text-left" : "md:text-right"}>
                  <h3 className="text-h3 mb-3">
                    {t(item.titleKey) || item.fallbackTitle}
                  </h3>
                  <p className="text-body text-muted-foreground leading-relaxed">
                    {t(item.descKey) || item.fallbackDesc}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mt-20"
        >
          <Button size="lg" asChild>
            <Link to="/why-us" className="inline-flex items-center gap-2">
              {t("whyUs.cta") || "Read the full why"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyUsSection;