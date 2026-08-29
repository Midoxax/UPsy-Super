import { useLocale } from "@/contexts/LocaleContext";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    nameKey: "testimonials.t1.name" as const, roleKey: "testimonials.t1.role" as const, textKey: "testimonials.t1.text" as const,
    fallbackName: "Amina B.", fallbackRole: "Client", fallbackText: "U.Psy helped me find the right psychologist in just a few days. The process was seamless and confidential.",
    rating: 5,
  },
  {
    nameKey: "testimonials.t2.name" as const, roleKey: "testimonials.t2.role" as const, textKey: "testimonials.t2.text" as const,
    fallbackName: "Youssef K.", fallbackRole: "Psychologist", fallbackText: "The platform gave me visibility and connected me with clients who truly needed my expertise in cognitive therapy.",
    rating: 5,
  },
  {
    nameKey: "testimonials.t3.name" as const, roleKey: "testimonials.t3.role" as const, textKey: "testimonials.t3.text" as const,
    fallbackName: "Sara M.", fallbackRole: "Client", fallbackText: "I was hesitant about online therapy, but the experience was incredibly professional and comfortable.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  const { t } = useLocale();

  return (
    <section aria-label="Testimonials" className="py-20 md:py-28">
      <div className="container-custom">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-h2 mb-4">{t("testimonials.title")}</h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            {t("testimonials.subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              className="glass-card p-8 flex flex-col !transform-none hover:!transform-none"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Quote className="h-7 w-7 text-primary/15 mb-4" />
              <p className="text-foreground/75 text-sm leading-relaxed flex-1 mb-6">
                "{t(item.textKey) || item.fallbackText}"
              </p>
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: item.rating }).map((_, s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-primary/70 text-primary/70" />
                ))}
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{t(item.nameKey) || item.fallbackName}</p>
                <p className="text-muted-foreground/60 text-xs">{t(item.roleKey) || item.fallbackRole}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
