import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import { ArrowRight, Award, Globe, Brain, Users, Target, Quote } from "lucide-react";
import { motion } from "framer-motion";
import mehdiPhoto from "@/assets/mehdi-felji.png";

const Founder = () => {
  const { t, locale } = useLocale();

  const expertiseAreas = [
    { icon: Brain, titleKey: "founder.area1Title" as const, descKey: "founder.area1Desc" as const, fallbackTitle: "Clinical Psychology", fallbackDesc: "Evidence-based interventions for anxiety, trauma, and recovery under real-world conditions." },
    { icon: Target, titleKey: "founder.area2Title" as const, descKey: "founder.area2Desc" as const, fallbackTitle: "Sport & Performance Psychology", fallbackDesc: "Mental control frameworks for athletes and operators in high-pressure environments." },
    { icon: Users, titleKey: "founder.area3Title" as const, descKey: "founder.area3Desc" as const, fallbackTitle: "Organizational Psychology", fallbackDesc: "Systemic diagnostics for workplace mental health, burnout prevention, and team performance." },
    { icon: Globe, titleKey: "founder.area4Title" as const, descKey: "founder.area4Desc" as const, fallbackTitle: "Humanitarian Psychology", fallbackDesc: "Psychologues Sans Frontières — field-deployed mental health support in crisis and migration contexts." },
    { icon: Award, titleKey: "founder.area5Title" as const, descKey: "founder.area5Desc" as const, fallbackTitle: "Training & Accreditation", fallbackDesc: "Professional development and quality assurance for psychology practitioners." },
  ];

  return (
    <>
      <SEOHead
        path="/founder"
        title="Mehdi Felji — Founder of U.Psy"
        description="Mehdi Felji, founder of U.Psy, combines clinical psychology, sport performance, and humanitarian fieldwork to build Morocco's mental health platform."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Mehdi Felji",
          jobTitle: "Founder of U.Psy",
          url: "https://upsy.ma/founder",
          worksFor: { "@type": "Organization", name: "U.Psy", url: "https://upsy.ma" },
        }}
      />
      <main className="flex-1">
        {/* Hero — Editorial layout */}
        <section className="hero-neural-bg py-20 md:py-32">
          <div className="container-custom">
            <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
              <motion.div
                className="lg:col-span-3 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                  {t("founder.badge") || "Founder & System Architect"}
                </span>
                <h1 className="text-display leading-tight">
                  {t("founder.heroTitle") || "Built from the Field. Not from Theory."}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  {t("founder.heroSubtitle") || "Mehdi Felji designed U.Psy as a system — not a directory. Born from operational psychology in sport, crisis, and institutional environments where models must perform or fail."}
                </p>
              </motion.div>

              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <div className="w-full max-w-sm mx-auto">
                  <div className="aspect-[3/4] rounded-u-lg overflow-hidden shadow-glass">
                    <img
                      src={mehdiPhoto}
                      alt="Mehdi Felji — Founder of U.Psy"
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mot du Président — Editorial typographic treatment */}
        <section className="py-20 md:py-32">
          <div className="container-custom">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto">
                {/* Section header */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <div className="h-px w-8 bg-primary/40" />
                    <Quote className="w-5 h-5 text-primary/60" />
                    <div className="h-px w-8 bg-primary/40" />
                  </div>
                  <h2 className="text-h2">{t("founder.motTitle") || "Mot du Président"}</h2>
                </div>

                {/* Opening statement — large, italic, high contrast */}
                <blockquote className="text-xl md:text-2xl font-semibold text-foreground italic leading-relaxed mb-10 pl-6 border-l-2 border-primary/30">
                  {t("founder.motOpener") || "La psychologie ne manque pas de théories. Elle manque d'applicabilité sous pression."}
                </blockquote>

                {/* Body — editorial rhythm with varied weight */}
                <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
                  <p>
                    {t("founder.mot1") || "Sur le terrain — dans le sport de haut niveau, dans les contextes migratoires, dans les situations de crise — les modèles classiques atteignent rapidement leurs limites. Ce qui fonctionne en cabinet ne fonctionne pas toujours dans l'urgence, dans l'incertitude, ou face à la performance."}
                  </p>

                  <p className="text-foreground font-semibold text-lg md:text-xl">
                    {t("founder.mot2") || "C'est dans cet écart que s'inscrit U.Psy."}
                  </p>

                  <p>
                    {t("founder.mot3") || "U.Psy n'a pas été conçu comme une plateforme. C'est un système. Un système construit à partir du terrain, où la psychologie doit être : opérationnelle, mesurable, mobilisable immédiatement."}
                  </p>

                  <p>
                    {t("founder.mot4") || "Mon parcours m'a conduit à intervenir dans des environnements où l'exigence est non négociable : accompagnement d'athlètes en performance, soutien psychosocial auprès de populations vulnérables, coordination de projets en santé mentale et développement."}
                  </p>

                  {/* Pivotal question — visually distinct */}
                  <div className="my-8 py-6 px-8 rounded-u-lg bg-primary/5 border border-primary/10">
                    <p className="text-foreground font-medium text-lg md:text-xl italic text-center">
                      {t("founder.mot5") || "Dans chacun de ces contextes, une même question revient : comment transformer la psychologie en un outil utilisable, et non en un savoir abstrait ?"}
                    </p>
                  </div>

                  <p>
                    {t("founder.mot6") || "U.Psy est une réponse à cette question. Nous structurons une approche qui relie trois dimensions souvent séparées : la rigueur clinique, la performance mentale, et l'impact systémique."}
                  </p>

                  {/* Three pillars — visual anchor */}
                  <div className="grid grid-cols-3 gap-4 my-8">
                    {[
                      { label: t("founder.pillar1") || "Clinical Rigor", sublabel: t("founder.pillar1Sub") || "Evidence-based" },
                      { label: t("founder.pillar2") || "Mental Performance", sublabel: t("founder.pillar2Sub") || "Field-tested" },
                      { label: t("founder.pillar3") || "Systemic Impact", sublabel: t("founder.pillar3Sub") || "Scalable" },
                    ].map((pillar, i) => (
                      <div key={i} className="text-center p-4 rounded-u-lg border border-primary/10 bg-primary/5">
                        <p className="text-sm font-semibold text-primary">{pillar.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{pillar.sublabel}</p>
                      </div>
                    ))}
                  </div>

                  <p>
                    {t("founder.mot7") || "Notre ambition est claire : redéfinir la manière dont la psychologie est utilisée — dans le sport, dans les institutions, et dans la société. Non pas comme un discours. Mais comme un levier."}
                  </p>

                  {/* Closing — strong, memorable */}
                  <blockquote className="text-lg md:text-xl font-semibold text-foreground italic leading-relaxed mt-8 pl-6 border-l-2 border-primary/30">
                    {t("founder.mot8") || "U.Psy est en construction. Mais sa direction est déjà définie : Créer une psychologie qui tient dans la réalité."}
                  </blockquote>
                </div>

                {/* Signature */}
                <div className="mt-10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                    <img src={mehdiPhoto} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">— Mehdi Felji</p>
                    <p className="text-xs text-muted-foreground">{t("founder.motSignature") || "Fondateur, U.Psy"}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Expertise Areas — Clean grid */}
        <section className="py-16 md:py-24 liquid-bg">
          <div className="container-custom">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-h2">{t("founder.expertiseTitle") || "Areas of Focus"}</h2>
                <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
                  {t("founder.expertiseSubtitle") || "Where psychology meets operational reality."}
                </p>
              </div>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {expertiseAreas.map((area, i) => (
                <ScrollReveal key={i}>
                  <div className="glass-card p-6 h-full space-y-3 group hover:border-primary/20 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <area.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{t(area.titleKey) || area.fallbackTitle}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(area.descKey) || area.fallbackDesc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container-custom max-w-2xl">
            <ScrollReveal>
              <div className="glass-card p-8 md:p-12 text-center space-y-4">
                <h2 className="text-h2">{t("founder.ctaTitle") || "Let's Build Something That Works"}</h2>
                <p className="text-body text-muted-foreground">
                  {t("founder.ctaText") || "Whether you're a professional, an organization, or a contributor — the system is open. Let's connect."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button variant="primary" size="lg" asChild>
                    <Link to={addLocalePrefix("/contact", locale)} className="inline-flex items-center gap-2">
                      {t("founder.ctaButton") || "Get in Touch"} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
};

export default Founder;
