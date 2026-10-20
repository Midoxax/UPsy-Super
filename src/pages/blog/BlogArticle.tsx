import { Link, useParams } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";
import BlogArticleSchema from "@/components/BlogArticleSchema";
import BlogAuthor from "@/components/blog/BlogAuthor";
import RelatedArticles from "@/components/blog/RelatedArticles";
import ScrollReveal from "@/components/ScrollReveal";
import NotFound from "@/pages/NotFound";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { articleLang, findArticle } from "@/content/blog/articles";

/** Renders any article from content/blog/articles at /blog/<slug>. */
export default function BlogArticle() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { locale } = useLocale();
  const article = findArticle(slug);
  if (!article) return <NotFound />;

  const lang = articleLang(locale);
  const a = article.content[lang];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: a.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <SEOHead
        path={`/blog/${article.slug}`}
        title={`${a.title} | U.Psy`}
        description={a.description}
        jsonLd={faqJsonLd}
      />
      <BlogArticleSchema
        title={a.title}
        description={a.description}
        slug={article.slug}
        datePublished={article.datePublished}
        category={a.category}
        readTimeMinutes={article.readMinutes}
      />

      {/* Arabic readers get the French text until a translation exists. */}
      <main className="flex-1" lang={lang} dir="ltr">
        <section className="hero-neural-bg py-20 md:py-28">
          <div className="container-custom max-w-3xl">
            <ScrollReveal>
              <div className="text-center space-y-6">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {a.category}
                </span>
                <h1 className="text-display leading-tight font-display">
                  {a.title}
                </h1>
                <p className="text-body text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {a.intro}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <article className="py-16 md:py-24">
          <div className="container-custom max-w-3xl space-y-14">
            {a.sections.map((s) => (
              <ScrollReveal key={s.heading}>
                <section className="space-y-4">
                  <h2 className="text-h2 font-display">{s.heading}</h2>
                  {s.paragraphs.map((p) => (
                    <p
                      key={p.slice(0, 40)}
                      className="text-body text-muted-foreground leading-relaxed"
                    >
                      {p}
                    </p>
                  ))}
                  {s.bullets && (
                    <ul className="list-disc ps-6 space-y-2 text-body text-muted-foreground leading-relaxed">
                      {s.bullets.map((b) => (
                        <li key={b.slice(0, 40)}>{b}</li>
                      ))}
                    </ul>
                  )}
                </section>
              </ScrollReveal>
            ))}

            <ScrollReveal>
              <section className="space-y-4">
                <h2 className="text-h2 font-display">FAQ</h2>
                <Accordion type="single" collapsible>
                  {a.faq.map((f, i) => (
                    <AccordionItem key={f.q} value={`q${i}`}>
                      <AccordionTrigger className="text-start">
                        {f.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {f.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="glass-card p-8 text-center space-y-4">
                <p className="text-body text-foreground">{a.cta}</p>
                <Button asChild size="lg">
                  <Link to={addLocalePrefix("/psychologists", locale)}>
                    {lang === "fr"
                      ? "Trouver un psychologue"
                      : "Find a psychologist"}
                    <ArrowRight className="ms-2 h-4 w-4" />
                  </Link>
                </Button>
              </section>
            </ScrollReveal>

            <BlogAuthor />
            <RelatedArticles currentSlug={article.slug} />
          </div>
        </article>
      </main>
    </>
  );
}
