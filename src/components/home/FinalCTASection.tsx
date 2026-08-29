import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";
import { motion } from "framer-motion";
import { WordReveal, MagneticButton } from "@/lib/motion";

const FinalCTASection = () => {
  const { t } = useLocale();

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, hsl(var(--primary) / 0.04), transparent 60%)",
        }}
      />
      <div className="container-custom relative z-10">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <WordReveal
            as="h2"
            className="text-h2 mb-5"
            text={t("finalCta.title") || "Take the First Step"}
          />
          <p className="text-body text-muted-foreground mb-4 leading-relaxed">
            {t("finalCta.subtitle") || "Whether you need therapy, coaching, or education — we're here to help you find the right support."}
          </p>
          <p className="text-sm text-muted-foreground mb-10 italic">
            {t("finalCta.reassurance") || "No commitment required. Start with a free 2-minute self-assessment."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <MagneticButton strength={0.3}>
              <Button variant="primary" size="hero" asChild>
                <Link to="/get-matched">{t("finalCta.assessment") || "Run Your Diagnostic"}</Link>
              </Button>
            </MagneticButton>
            <Button variant="secondary" size="hero" asChild>
              <Link to="/psychologists">{t("hero.findPsychologist") || "Browse Specialists"}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
