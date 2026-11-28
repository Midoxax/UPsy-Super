import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, FileText, Mail } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Link, useSearchParams } from "@/lib/router-compat";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { issueMonth, useNewsletterCopy } from "@/lib/newsletter/newsletterCopy";
import {
  issueArticles,
  issueIntro,
  useNewsletterArchive,
} from "@/lib/newsletter/issues";
import NewsletterBand from "@/components/newsletter/NewsletterBand";
import IssueArticles from "@/components/newsletter/IssueArticles";

const HERO = "/campaign/newsletter/hero.jpg";
// One-off colours stay inline: as Tailwind classes they would ship in the
// CSS every page loads.
const veil = (rtl: boolean) =>
  `linear-gradient(to ${rtl ? "left" : "right"}, #2a0610, rgba(42,6,16,0.85), rgba(42,6,16,0.2))`;

/**
 * The newsletter's home: sign up over the brand image, what each issue
 * brings, the latest issue and the archive (newsletter_archive). The topic
 * vote in the email lands here with ?voted=<topic>.
 */
export default function Newsletter() {
  const { t, locale } = useNewsletterCopy();
  const [params] = useSearchParams();
  const voted = params.get("voted");
  const { data: issues = [], isLoading } = useNewsletterArchive();
  const [latest, ...older] = issues;
  const issuePath = (p: string) => addLocalePrefix(`/newsletter/${p}`, locale);

  return (
    <>
      <SEOHead
        path="/newsletter"
        title={t.seoTitle}
        description={t.seoDescription}
        ogImage={`https://upsy.ma${HERO}`}
      />

      {/* Hero: the brand image under a maroon veil, the form on the right. */}
      <section
        className="relative isolate overflow-hidden text-white"
        style={{ background: "#2a0610" }}
      >
        <img
          src={HERO}
          alt=""
          width={1600}
          height={893}
          fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{ background: veil(locale === "ar") }}
        />
        <div className="container-custom grid items-center gap-10 py-20 md:py-28 lg:grid-cols-[1.4fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-u-gold">
              <Mail className="h-4 w-4" />
              {t.eyebrow}
            </p>
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight md:text-6xl">
              {t.title}
            </h1>
            <p className="max-w-xl text-lg text-white/75">{t.sub}</p>
            {voted && (
              <p
                role="status"
                className="flex max-w-xl items-start gap-2 rounded-xl border border-white/20 bg-u-gold/10 p-3 text-sm text-white"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-u-gold" />
                {t.voted}
              </p>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-2xl bg-card p-6 text-foreground shadow-2xl md:p-8"
          >
            <NewsletterSignup source="newsletter-page" />
          </motion.div>
        </div>
      </section>

      {/* What each issue brings. */}
      <section className="border-b border-border">
        <div className="container-custom py-16">
          <h2 className="mb-10 font-display text-2xl md:text-3xl">
            {t.inside}
          </h2>
          <ol className="grid gap-8 md:grid-cols-3">
            {t.perks.map((p, i) => (
              <motion.li
                key={p.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-2 border-t-2 border-secondary pt-5"
              >
                <span className="font-display text-4xl text-u-gold" dir="ltr">
                  0{i + 1}
                </span>
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="text-muted-foreground">{p.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* The latest issue. */}
      <section className="bg-surface/40">
        <div className="container-custom space-y-8 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                {t.latest}
              </p>
              {latest && (
                <h2 className="font-display text-3xl capitalize md:text-4xl">
                  {issueMonth(latest.period, locale)}
                </h2>
              )}
            </div>
            {latest && (
              <Link
                to={issuePath(latest.period)}
                className="inline-flex items-center gap-1.5 font-semibold text-secondary hover:underline"
              >
                {t.readIssue}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            )}
          </div>
          {latest ? (
            <>
              {issueIntro(latest, locale) && (
                <p className="max-w-3xl text-lg text-muted-foreground">
                  {issueIntro(latest, locale)}
                </p>
              )}
              <IssueArticles articles={issueArticles(latest, locale)} />
            </>
          ) : (
            !isLoading && <p className="text-muted-foreground">{t.empty}</p>
          )}
        </div>
      </section>

      {/* Archive. */}
      {older.length > 0 && (
        <section className="container-custom space-y-6 py-16">
          <h2 className="font-display text-2xl md:text-3xl">{t.archive}</h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {older.map((i) => {
              const n = issueArticles(i, locale).length;
              return (
                <li key={i.period}>
                  <Link
                    to={issuePath(i.period)}
                    className="group block rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-secondary hover:shadow-lg"
                  >
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t.issue}
                    </p>
                    <p className="font-display text-xl capitalize group-hover:text-secondary">
                      {issueMonth(i.period, locale)}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      {t.articles(n)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <NewsletterBand />
    </>
  );
}
