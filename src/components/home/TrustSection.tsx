import { Shield, Video, Lock, Award } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { motion } from "framer-motion";

const trustItems = [
  { icon: Award, labelKey: "trust.licensed" as const, fallback: "Licensed Psychologists" },
  { icon: Video, labelKey: "trust.telehealth" as const, fallback: "Secure Telehealth" },
  { icon: Lock, labelKey: "trust.confidential" as const, fallback: "100% Confidential" },
  { icon: Shield, labelKey: "trust.accredited" as const, fallback: "Accredited Platform" },
];

const stats = [
  { value: "50+", labelKey: "trust.statExperts" as const, fallback: "Verified Experts" },
  { value: "2,000+", labelKey: "trust.statSessions" as const, fallback: "Sessions Completed" },
  { value: "98%", labelKey: "trust.statSatisfaction" as const, fallback: "Client Satisfaction" },
];

const TrustSection = () => {
  const { t } = useLocale();

  return (
    <section aria-label="Trust signals" className="py-14">
      <div className="container-custom">
        {/* Trust badges — calm horizontal strip */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {trustItems.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2.5 text-muted-foreground"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <item.icon className="h-4 w-4 text-primary/60" />
              <span className="text-xs font-medium tracking-wider uppercase">
                {t(item.labelKey) || item.fallback}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Social proof — gentle numbers */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-12 md:gap-20 mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-semibold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground/70 mt-1 tracking-wider uppercase">
                {t(stat.labelKey) || stat.fallback}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Reassurance whisper */}
        <motion.p
          className="text-center text-sm text-muted-foreground/60 mt-8 italic max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          {t("trust.reassurance") || "You're in safe hands. Every session is private, secure, and judgment-free."}
        </motion.p>
      </div>
    </section>
  );
};

export default TrustSection;
