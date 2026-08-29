import { Link } from "@/lib/router-compat";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLocale } from "@/contexts/LocaleContext";
import { getHomeCopy } from "@/lib/i18n/homeCopy";

const tierRoutes = ["/psychologists", "/psychologists", "/membership"] as const;

export default function HomePricingSection() {
  const { locale } = useLocale();
  const c = getHomeCopy(locale).pricing;
  const tiers = c.tiers.map((t, i) => ({
    ...t,
    to: tierRoutes[i],
    featured: i === 1,
  }));
  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="container-custom">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-xs font-medium tracking-[0.18em] uppercase text-primary mb-4">{c.eyebrow}</p>
          <h2 className="text-h2 mb-4">{c.title}</h2>
          <p className="text-body text-muted-foreground">{c.subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`relative rounded-u-card p-8 flex flex-col ${
                tier.featured
                  ? "bg-card border-2 border-primary shadow-glass-hover md:-translate-y-2"
                  : "bg-card/60 border border-border"
              }`}
            >
              {tier.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                  {c.badge}
                </span>
              )}
              <h3 className="font-display text-2xl font-medium tracking-tight mb-1">{tier.name}</h3>
              <p className="text-sm text-muted-foreground mb-5">{tier.tagline}</p>
              <div className="mb-5">
                <span className="font-mono tabular-nums text-4xl font-semibold text-foreground" data-numeric>
                  {tier.price}
                </span>
                <span className="text-sm text-muted-foreground ml-2">{tier.cadence}</span>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {tier.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground/85">{b}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={tier.featured ? "primary" : "secondary"}
                size="lg"
                className="w-full gap-2 group"
              >
                <Link to={tier.to}>
                  {tier.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          {c.footnote}{" "}
          <Link to="/pricing" className="text-primary underline underline-offset-4">
            {c.footnoteLink}
          </Link>
        </p>
      </div>
    </section>
  );
}