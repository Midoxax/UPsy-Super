import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { REFERENCES } from "@/lib/pitch/content";

/**
 * Audience landing page: hero, sourced numbers, how it works, what you get,
 * a trust block and a closing CTA. Copy lives with each page, per locale;
 * every number cites an entry of the pitch's REFERENCES list.
 */

export type FunnelCopy = {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  sub: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  reassurance: string[];
  statsTitle: string;
  stats: { value: string; label: string; ref: number }[];
  stepsTitle: string;
  steps: { title: string; body: string }[];
  featuresTitle: string;
  features: { icon: LucideIcon; title: string; body: string }[];
  trustTitle: string;
  trust: string[];
  closingTitle: string;
  closingBody: string;
  sourcesLabel: string;
};

export default function FunnelPage({
  path,
  copy: c,
}: {
  path: string;
  copy: FunnelCopy;
}) {
  const { locale } = useLocale();
  const to = (href: string) => addLocalePrefix(href, locale);
  const refIds = [...new Set(c.stats.map((s) => s.ref))].sort((a, b) => a - b);
  const refs = REFERENCES.filter((r) => refIds.includes(r.id));

  return (
    <>
      <SEOHead path={path} title={c.seoTitle} description={c.seoDescription} />
      <main className="bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#0D0406] text-[#FAFAFA]">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 60% 70% at 85% 20%, hsl(348 60% 22% / 0.9), transparent 70%)",
            }}
          />
          <div className="container-custom relative py-20 md:py-28 max-w-4xl">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[hsl(var(--gold-accent))]">
              {c.eyebrow}
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.2rem,5.5vw,4rem)] font-bold leading-[1.05]">
              {c.title}{" "}
              <span className="italic text-[hsl(var(--gold-accent))]">
                {c.titleAccent}
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-[#FAFAFA]/80">{c.sub}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button variant="primary" size="lg" asChild>
                <Link to={to(c.primary.href)}>
                  {c.primary.label}
                  <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-white/30 bg-transparent text-[#FAFAFA] hover:bg-white/10 hover:text-[#FAFAFA]"
              >
                <Link to={to(c.secondary.href)}>{c.secondary.label}</Link>
              </Button>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#FAFAFA]/70">
              {c.reassurance.map((r) => (
                <li key={r} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[hsl(var(--gold-accent))]" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Sourced numbers */}
        <section className="container-custom py-16 md:py-20">
          <h2 className="font-display text-2xl md:text-3xl font-bold max-w-2xl">
            {c.statsTitle}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {c.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border/60 p-6"
              >
                <div className="font-display text-5xl font-bold text-primary tabular-nums">
                  {s.value}
                </div>
                <p className="mt-3 text-sm text-foreground/80">
                  {s.label}{" "}
                  <a
                    href={`#ref-${s.ref}`}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    [{s.ref}]
                  </a>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-muted/30 py-16 md:py-20">
          <div className="container-custom">
            <h2 className="font-display text-2xl md:text-3xl font-bold">
              {c.stepsTitle}
            </h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {c.steps.map((s, i) => (
                <li
                  key={s.title}
                  className="rounded-2xl bg-background p-6 border border-border/60"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* What you get */}
        <section className="container-custom py-16 md:py-20">
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            {c.featuresTitle}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border/60 p-6"
              >
                <f.icon className="h-7 w-7 text-primary" />
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section className="container-custom pb-16 md:pb-20">
          <div className="rounded-3xl border border-primary/20 bg-primary/[0.04] p-8 md:p-10">
            <h2 className="font-display text-2xl font-bold">{c.trustTitle}</h2>
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {c.trust.map((t) => (
                <li key={t} className="flex gap-3 text-sm text-foreground/85">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-[#0D0406] text-[#FAFAFA]">
          <div className="container-custom py-16 md:py-20 text-center max-w-3xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {c.closingTitle}
            </h2>
            <p className="mt-4 text-[#FAFAFA]/75">{c.closingBody}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" size="lg" asChild>
                <Link to={to(c.primary.href)}>{c.primary.label}</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-white/30 bg-transparent text-[#FAFAFA] hover:bg-white/10 hover:text-[#FAFAFA]"
              >
                <Link to={to(c.secondary.href)}>{c.secondary.label}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Sources */}
        <section className="container-custom py-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {c.sourcesLabel}
          </h2>
          <ol className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            {refs.map((r) => (
              <li key={r.id} id={`ref-${r.id}`}>
                [{r.id}] {r.authors} ({r.year}). {r.title}. {r.source}.{" "}
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  {r.url.replace(/^https?:\/\//, "")}
                </a>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}
