import { useEffect, type ReactNode } from "react";
import SEOHead from "@/components/SEOHead";
import { useLocale } from "@/contexts/LocaleContext";
import { useLocation } from "@/lib/router-compat";
import type { Locale } from "@/lib/i18n/utils";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

export interface LegalDoc {
  title: string;
  seoTitle: string;
  description: string;
  /** Shown as "Last updated: …" in the document's language. */
  updated: string;
  updatedLabel: string;
  contentsLabel: string;
  intro?: ReactNode;
  sections: LegalSection[];
}

/**
 * One layout for every legal page: title, date, a table of contents with
 * anchor links (the footer deep-links into sections), then the sections.
 * Locales without a translation fall back to English, like t() does.
 */
export function LegalDocument({
  path,
  docs,
}: {
  path: string;
  docs: Partial<Record<Locale, LegalDoc>> & { en: LegalDoc };
}) {
  const { locale } = useLocale();
  const { hash } = useLocation();
  const doc = docs[locale] ?? docs.en;
  const lang = docs[locale] ? locale : "en";

  // The footer links into sections (/legal#ethics). A client-side navigation
  // lands at the top of the page, so bring the requested section into view,
  // including when the link is followed from the same page.
  useEffect(() => {
    const id = decodeURIComponent(hash.replace(/^#/, ""));
    if (id) document.getElementById(id)?.scrollIntoView();
  }, [hash]);

  return (
    <main className="min-h-screen bg-background">
      <SEOHead path={path} title={doc.seoTitle} description={doc.description} />
      <article
        lang={lang}
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="container-custom section-spacing max-w-4xl mx-auto"
      >
        <h1 className="text-h1 text-foreground mb-2">{doc.title}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {doc.updatedLabel}: {doc.updated}
        </p>

        {doc.intro && (
          <div className="text-body text-foreground/90 leading-relaxed mb-8 space-y-3">
            {doc.intro}
          </div>
        )}

        <nav
          aria-label={doc.contentsLabel}
          className="mb-10 rounded-lg border border-border bg-muted/30 p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-3">
            {doc.contentsLabel}
          </h2>
          <ol className="grid gap-x-6 sm:grid-cols-2 text-sm list-decimal pl-5">
            {doc.sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="inline-block py-1 text-muted-foreground hover:text-primary"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-10 text-body text-foreground/90 leading-relaxed">
          {doc.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-h3 text-foreground mb-3">
                {i + 1}. {s.title}
              </h2>
              <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_a]:text-primary [&_a]:underline">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
