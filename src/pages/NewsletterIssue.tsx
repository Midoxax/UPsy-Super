import { ArrowLeft, Loader2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import NewsletterSignup from "@/components/NewsletterSignup";
import NewsletterBand from "@/components/newsletter/NewsletterBand";
import IssueArticles from "@/components/newsletter/IssueArticles";
import { Link, useParams } from "@/lib/router-compat";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { issueMonth, useNewsletterCopy } from "@/lib/newsletter/newsletterCopy";
import {
  issueArticles,
  issueIntro,
  useNewsletterArchive,
} from "@/lib/newsletter/issues";

const HERO = "/campaign/newsletter/hero.jpg";

/** The web version of an issue, linked from the email's "Read online". */
export default function NewsletterIssue() {
  const { t, locale } = useNewsletterCopy();
  const { period = "" } = useParams<{ period: string }>();
  const { data: issues = [], isLoading } = useNewsletterArchive();
  const issue = issues.find((i) => i.period === period);
  const month = /^\d{4}-\d{2}$/.test(period) ? issueMonth(period, locale) : "";
  const articles = issue ? issueArticles(issue, locale) : [];

  return (
    <>
      <SEOHead
        path={`/newsletter/${period}`}
        title={`${t.eyebrow} · ${month}`}
        description={
          articles.map((a) => a.title).join(" · ") || t.seoDescription
        }
        ogImage={`https://upsy.ma${HERO}`}
      />

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
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(to top, #2a0610, rgba(42,6,16,0.7), transparent)",
          }}
        />
        <div className="container-custom space-y-4 pb-14 pt-24 md:pt-32">
          <Link
            to={addLocalePrefix("/newsletter", locale)}
            className="inline-flex items-center gap-1.5 text-sm text-white/75 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t.back}
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-u-gold">
            {t.eyebrow}
          </p>
          <h1 className="font-display text-4xl capitalize md:text-6xl">
            {month || t.issue}
          </h1>
          {issue && issueIntro(issue, locale) && (
            <p className="max-w-2xl text-lg text-white/75">
              {issueIntro(issue, locale)}
            </p>
          )}
        </div>
      </section>

      <section className="container-custom py-14">
        {isLoading ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        ) : issue ? (
          <IssueArticles articles={articles} />
        ) : (
          <p className="text-muted-foreground">{t.notFound}</p>
        )}
      </section>

      <section className="container-custom pb-14">
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-6 md:p-8">
          <NewsletterSignup source={`newsletter-issue-${period}`} />
        </div>
      </section>

      <NewsletterBand />
    </>
  );
}
