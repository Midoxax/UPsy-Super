import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useNewsletterCopy } from "@/lib/newsletter/newsletterCopy";
import type { IssueArticle } from "@/lib/newsletter/issues";

/** An issue's articles: the first one large, the others beside it. */
export default function IssueArticles({
  articles,
}: {
  articles: IssueArticle[];
}) {
  const { t } = useNewsletterCopy();
  const [lead, ...rest] = articles;
  if (!lead) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Link
        to={lead.path}
        className="group overflow-hidden rounded-3xl bg-secondary text-white shadow-xl"
      >
        {lead.image && (
          <img
            src={lead.image}
            alt=""
            loading="lazy"
            className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        )}
        <div className="space-y-3 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-u-gold">
            {lead.category} · <span dir="ltr">{lead.readMinutes}</span>{" "}
            {t.minutes}
          </p>
          <h3 className="font-display text-2xl leading-tight md:text-3xl">
            {lead.title}
          </h3>
          <p className="text-white/75">{lead.description}</p>
          <span className="inline-flex items-center gap-1.5 font-semibold text-u-gold">
            {t.read}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180" />
          </span>
        </div>
      </Link>
      {rest.length > 0 && (
        <ul className="space-y-4">
          {rest.map((a) => (
            <li key={a.slug}>
              <Link
                to={a.path}
                className="group flex gap-4 rounded-2xl border border-border bg-card p-3 transition hover:border-secondary hover:shadow-md"
              >
                {a.image && (
                  <img
                    src={a.image}
                    alt=""
                    loading="lazy"
                    className="h-20 w-28 shrink-0 rounded-xl object-cover"
                  />
                )}
                <div className="min-w-0 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {a.category} · <span dir="ltr">{a.readMinutes}</span>{" "}
                    {t.minutes}
                  </p>
                  <p className="font-display text-lg leading-snug group-hover:text-secondary">
                    {a.title}
                  </p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {a.description}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
