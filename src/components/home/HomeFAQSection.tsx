import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { getHomeCopy } from "@/lib/i18n/homeCopy";

export default function HomeFAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  const { locale } = useLocale();
  const c = getHomeCopy(locale).faq;
  const faqs = c.items;

  return (
    <section className="py-24 md:py-32 bg-card/30">
      <div className="container-custom max-w-3xl">
        <div className="text-center mb-14">
          <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-primary mb-4">{c.eyebrow}</p>
          <h2 className="font-display text-h2 mb-4">{c.titleBefore}<span className="accent-italic">{c.titleItalic}</span>{c.titleAfter}</h2>
        </div>

        <div className="space-y-2">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="rounded-u-card border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-start p-5 md:p-6 hover:bg-muted/40 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-lg md:text-xl font-normal">{f.q}</span>
                  {isOpen ? (
                    <Minus className="h-5 w-5 text-primary shrink-0" />
                  ) : (
                    <Plus className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <p className="px-5 md:px-6 pb-6 text-body font-sans text-muted-foreground max-w-none">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}