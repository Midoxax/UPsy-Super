import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { BarChart3, Brain, Clock, Flame, HeartPulse } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { motion } from "framer-motion";
import MoodSpheres from "@/components/3d/MoodSpheres";

const SelfAssessmentSection = () => {
  const { t } = useLocale();

  const assessments = [
    { icon: HeartPulse, labelKey: "selfAssessment.anxiety" as const, fallback: "Anxiety Screening" },
    { icon: Brain, labelKey: "selfAssessment.stress" as const, fallback: "Stress Assessment" },
    { icon: Flame, labelKey: "selfAssessment.burnout" as const, fallback: "Burnout Check" },
  ];

  return (
    <section className="py-28 md:py-36 relative overflow-hidden" id="self-assessment" aria-labelledby="self-assessment-heading">
      {/* Warm atmospheric glow — dominant section feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, hsl(var(--primary) / 0.06), transparent 55%), radial-gradient(ellipse at 50% 80%, hsl(var(--accent) / 0.04), transparent 50%)",
        }}
      />

      <div className="container-custom relative z-10">
        <motion.div
          className="glass-card p-10 md:p-16 lg:p-20 max-w-4xl mx-auto text-center !transform-none hover:!transform-none"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ boxShadow: "0 20px 60px hsl(var(--primary) / 0.06)" }}
        >
          {/* Mood spheres — gentle visual hook */}
          <div className="h-44 md:h-52 mb-6 -mt-4 relative">
            <MoodSpheres />
          </div>

          {/* Icon */}
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 bg-primary/8 border border-primary/15">
            <BarChart3 className="w-7 h-7 text-primary" />
          </div>

          {/* Duration badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/8 text-primary border border-primary/12 mb-5">
            <Clock className="w-3 h-3" /> {t("selfAssessment.duration") || "Takes only 2 minutes"}
          </span>

          <h2 id="self-assessment-heading" className="text-h2 mb-4">
            {t("selfAssessment.title") || "Understand Yourself Better"}
          </h2>

          <p className="text-body text-muted-foreground max-w-xl mx-auto mb-3 leading-relaxed">
            {t("selfAssessment.subtitle") ||
              "A quick, private check-in to understand your needs. Your answers guide us toward the right support for you."}
          </p>

          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8 italic">
            {t("selfAssessment.reassurance") || "Completely confidential. Never shared with anyone."}
          </p>

          {/* Assessment types */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {assessments.map((a) => (
              <div
                key={a.fallback}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background/60 border border-border/40 text-sm text-muted-foreground"
              >
                <a.icon className="w-4 h-4 text-primary/70" />
                <span className="font-medium">{t(a.labelKey) || a.fallback}</span>
              </div>
            ))}
          </div>

          {/* Primary CTA — THE conversion moment */}
          <Button variant="primary" size="hero" asChild>
            <Link to="/get-matched">{t("selfAssessment.cta") || "Start Assessment"}</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default SelfAssessmentSection;
