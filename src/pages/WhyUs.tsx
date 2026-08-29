import { Link } from "@/lib/router-compat";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  X,
  Activity,
  ShieldCheck,
  Globe2,
  FlaskConical,
  Layers,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import SEOHead from "@/components/SEOHead";
import { MethodsMetricsBand } from "@/components/MethodsMetricsBand";

const pillarConfig = [
  {
    icon: Activity,
    key: "system",
    fallbackTitle: "Performance Psychology System",
    href: "/assessment-lab",
  },
  {
    icon: ShieldCheck,
    key: "accreditation",
    fallbackTitle: "5-Tier Clinical Accreditation",
    href: "/psychologists",
  },
  {
    icon: Globe2,
    key: "morocco",
    fallbackTitle: "Built for Morocco",
    href: "/moroccan-umbrella",
  },
  {
    icon: FlaskConical,
    key: "rigor",
    fallbackTitle: "Clinical Rigor",
    href: "/founder",
  },
  {
    icon: Layers,
    key: "ecosystem",
    fallbackTitle: "Integrated Ecosystem",
    href: "/services",
  },
  {
    icon: Lock,
    key: "privacy",
    fallbackTitle: "Privacy by Design",
    href: "/privacy",
  },
] as const;

const comparisonRows = [
  { key: "credentials", fallback: "Verified clinical credentials" },
  { key: "diagnostics", fallback: "Validated diagnostics built-in" },
  { key: "outcomes", fallback: "Structured outcome tracking" },
  { key: "arabic", fallback: "Native Arabic + RTL" },
  { key: "law", fallback: "Moroccan Law 09-08 compliance" },
  { key: "ecosystem", fallback: "Integrated learning + B2B + AI" },
] as const;

const WhyUs = () => {
  const { t } = useLocale();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How is U.Psy different from other therapy directories?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "U.Psy is a performance psychology system, not a directory. Specialists are clinically accredited, sessions follow evidence-based protocols, and outcomes are measured.",
        },
      },
      {
        "@type": "Question",
        name: "Are U.Psy psychologists verified?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — every specialist passes a 5-tier accreditation reviewing identity, license, training, supervision, and ethics before being listed.",
        },
      },
      {
        "@type": "Question",
        name: "Is U.Psy compliant with Moroccan privacy law?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. U.Psy is built for Morocco and complies with Law 09-08 on personal data protection. All forms include the required privacy notice.",
        },
      },
    ],
  };

  return (
    <main className="flex-1">
      <SEOHead
        path="/why-us"
        title="Why U.Psy — Performance Psychology System for Morocco"
        description="U.Psy is not a therapy directory. Discover the six pillars that make it Morocco's clinical-grade performance psychology platform — accreditation, rigor, privacy, and local depth."
        jsonLd={faqJsonLd}
      />

      {/* Hero */}
      <section className="section-spacing relative overflow-hidden">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block px-4 py-1.5 rounded-full border border-secondary/40 bg-secondary/5 text-secondary text-xs font-semibold tracking-[0.2em] uppercase mb-6"
            >
              {t("whyUs.eyebrow") || "Why U.Psy"}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-h1 mb-6"
            >
              {t("whyUs.heroTitle") ||
                "We don't list therapists. We run a performance psychology system."}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-body text-muted-foreground mb-10"
            >
              {t("whyUs.heroSubtitle") ||
                "Most platforms in Morocco are search results. U.Psy is a clinical-grade operating system for measuring, training, and applying psychological skills under pressure."}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button size="lg" asChild>
                <Link to="/get-matched" className="inline-flex items-center gap-2">
                  {t("whyUs.heroCtaPrimary") || "Find your match"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/founder">
                  {t("whyUs.heroCtaSecondary") || "Talk to the founder"}
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison band */}
      <section className="section-spacing">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-3xl overflow-hidden"
          >
            <div className="grid grid-cols-3 border-b border-border/40">
              <div className="p-5 md:p-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {t("whyUs.compare.feature") || "Feature"}
              </div>
              <div className="p-5 md:p-6 text-sm font-semibold text-center text-muted-foreground">
                {t("whyUs.compare.directory") || "Typical directory"}
              </div>
              <div className="p-5 md:p-6 text-sm font-semibold text-center text-primary bg-primary/5">
                U.Psy
              </div>
            </div>
            {comparisonRows.map((row, idx) => (
              <div
                key={row.key}
                className={`grid grid-cols-3 ${idx !== comparisonRows.length - 1 ? "border-b border-border/30" : ""}`}
              >
                <div className="p-4 md:p-5 text-sm md:text-base font-medium">
                  {t(`whyUs.compare.rows.${row.key}`) || row.fallback}
                </div>
                <div className="p-4 md:p-5 flex items-center justify-center">
                  <X className="w-5 h-5 text-muted-foreground/40" />
                </div>
                <div className="p-4 md:p-5 flex items-center justify-center bg-primary/5">
                  <Check className="w-5 h-5 text-primary" />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Six pillars */}
      <section className="section-spacing">
        <div className="container-custom">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-h2 mb-4">
              {t("whyUs.pillarsTitle") || "Six pillars, one system."}
            </h2>
            <p className="text-body text-muted-foreground">
              {t("whyUs.pillarsSubtitle") ||
                "Each pillar is a deliberate design choice — and a measurable commitment."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {pillarConfig.map((pillar, idx) => {
              const proof = [
                t(`whyUs.pillars.${pillar.key}.proof.a`),
                t(`whyUs.pillars.${pillar.key}.proof.b`),
                t(`whyUs.pillars.${pillar.key}.proof.c`),
              ].filter(Boolean);
              return (
              <motion.div
                key={pillar.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (idx % 2) * 0.08 }}
                className="glass-card p-7 rounded-3xl flex flex-col"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20 mb-5">
                  <pillar.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-h3 mb-3">
                  {t(`whyUs.items.${pillar.key}.title`) || pillar.fallbackTitle}
                </h3>
                <p className="text-body text-muted-foreground text-sm leading-relaxed mb-5">
                  {t(`whyUs.pillars.${pillar.key}.desc`) || t(`whyUs.items.${pillar.key}.desc`)}
                </p>
                <ul className="space-y-2 mb-6">
                  {proof.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={pillar.href}
                  className="mt-auto inline-flex items-center gap-1 text-sm text-primary font-medium hover:gap-2 transition-all"
                >
                  {t(`whyUs.pillars.${pillar.key}.cta`)} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Methods & Metrics band — methodology proof */}
      <MethodsMetricsBand />

      {/* Founder voice */}
      <section className="section-spacing">
        <div className="container-custom max-w-3xl text-center">
          <motion.blockquote
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-h3 md:text-h2 italic text-foreground/90 leading-relaxed"
          >
            “{t("whyUs.founderQuote") ||
              "Morocco doesn't need another marketplace. It needs a system that takes psychology seriously — clinically, operationally, and culturally."}”
          </motion.blockquote>
          <p className="mt-6 text-sm text-muted-foreground">
            — Mehdi Felji, {t("founder.role") || "Founder of U.Psy"}
          </p>
          <Button variant="ghost" asChild className="mt-4">
            <Link to="/founder" className="inline-flex items-center gap-1">
              {t("whyUs.founderCta") || "Read the founder's story"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-spacing">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="text-h2 mb-5">
            {t("whyUs.finalTitle") || "Ready to work with a real system?"}
          </h2>
          <p className="text-body text-muted-foreground mb-8">
            {t("whyUs.finalSubtitle") ||
              "Two minutes of diagnostics. One match. A real psychologist, a real protocol, real outcomes."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/get-matched" className="inline-flex items-center gap-2">
                {t("whyUs.heroCtaPrimary") || "Find your match"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/founder">
                {t("whyUs.methodCta") || "Read methodology"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default WhyUs;