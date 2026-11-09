import { Link, useParams } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import NotFound from "@/pages/NotFound";
import { ArrowLeft, ArrowRight, Printer, Info } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { findLibResource, libLang } from "@/content/library";

const COPY = {
  fr: {
    back: "Toutes les ressources",
    print: "Imprimer / PDF",
    cbt: "TCC",
    schema: "Thérapie des schémas",
    act: "ACT",
    dbt: "TCD (DBT)",
    compassion: "Auto-compassion",
    sport: "Préparation mentale",
    wellbeing: "Bien-être",
    guide: "Guide",
    worksheet: "Fiche d'exercice",
    min: "min",
    refs: "Références",
    therapist:
      "Certaines techniques présentées ici se pratiquent en séance, avec un psychologue formé. Ce guide sert à comprendre, pas à remplacer un accompagnement.",
    disclaimer:
      "Ressource psychoéducative rédigée par U.Psy. Elle ne remplace pas une évaluation ni un traitement. En cas de détresse ou de pensées suicidaires, contactez les urgences (141 / 15) ou un proche immédiatement.",
    cta: "Envie d'avancer avec un professionnel ?",
    find: "Trouver un psychologue",
  },
  en: {
    back: "All resources",
    print: "Print / PDF",
    cbt: "CBT",
    schema: "Schema therapy",
    act: "ACT",
    dbt: "DBT",
    compassion: "Self-compassion",
    sport: "Mental preparation",
    wellbeing: "Wellbeing",
    guide: "Guide",
    worksheet: "Worksheet",
    min: "min",
    refs: "References",
    therapist:
      "Some techniques described here are practised in session, with a trained psychologist. This guide is for understanding, not a substitute for care.",
    disclaimer:
      "Psychoeducational resource written by U.Psy. It does not replace assessment or treatment. If you are in distress or having suicidal thoughts, call emergency services (141 / 15) or someone close to you now.",
    cta: "Want to work on this with a professional?",
    find: "Find a psychologist",
  },
} as const;

/** Renders a library resource (content/library) at /resources/<slug>. */
export default function ResourceArticle() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { locale } = useLocale();
  const res = findLibResource(slug);
  if (!res) return <NotFound />;

  const lang = libLang(locale);
  const c = COPY[lang];
  const body = res.content[lang];
  const title = locale === "ar" ? res.ar.title : body.title;
  const summary = locale === "ar" ? res.ar.summary : body.summary;
  const arText = locale === "ar" ? ({ dir: "rtl", lang: "ar" } as const) : {};

  return (
    <>
      <SEOHead
        path={`/resources/${res.slug}`}
        title={`${title} | U.Psy`}
        description={summary}
      />
      <main className="flex-1 print:bg-white" lang={lang} dir="ltr">
        <section className="hero-neural-bg py-16 md:py-20 print:py-4 print:bg-none">
          <div className="container-custom max-w-3xl space-y-5">
            <Link
              to={addLocalePrefix("/resources", locale)}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary print:hidden"
            >
              <ArrowLeft className="h-4 w-4" /> {c.back}
            </Link>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
                {c[res.approach]}
              </span>
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground">
                {c[res.format]} · {res.readMinutes} {c.min}
              </span>
            </div>
            <h1 className="text-display leading-tight font-display" {...arText}>
              {title}
            </h1>
            <p
              className="text-body text-muted-foreground leading-relaxed"
              {...arText}
            >
              {summary}
            </p>
            {locale === "ar" && (
              <p className="text-sm text-muted-foreground" dir="rtl" lang="ar">
                النسخة العربية الكاملة قيد الإعداد؛ النص معروض بالفرنسية.
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="print:hidden"
            >
              <Printer className="me-2 h-4 w-4" /> {c.print}
            </Button>
          </div>
        </section>

        <article className="py-12 md:py-16 print:py-2">
          <div className="container-custom max-w-3xl space-y-12 print:space-y-6">
            {res.withTherapist && (
              <p className="flex gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
                <Info className="h-5 w-5 shrink-0 text-primary" />
                {c.therapist}
              </p>
            )}

            {body.sections.map((s) => (
              <section
                key={s.heading}
                className="space-y-4 break-inside-avoid-page"
              >
                <h2 className="text-h2 font-display">{s.heading}</h2>
                {s.body?.map((p) => (
                  <p
                    key={p.slice(0, 40)}
                    className="text-body text-muted-foreground leading-relaxed print:text-black"
                  >
                    {p}
                  </p>
                ))}
                {s.bullets && (
                  <ul className="list-disc ps-6 space-y-2 text-body text-muted-foreground leading-relaxed print:text-black">
                    {s.bullets.map((b) => (
                      <li key={b.slice(0, 40)}>{b}</li>
                    ))}
                  </ul>
                )}
                {s.steps && (
                  <ol className="list-decimal ps-6 space-y-2 text-body text-muted-foreground leading-relaxed print:text-black">
                    {s.steps.map((b) => (
                      <li key={b.slice(0, 40)}>{b}</li>
                    ))}
                  </ol>
                )}
                {s.table && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr>
                          {s.table.columns.map((h) => (
                            <th
                              key={h}
                              scope="col"
                              className="border border-border bg-muted p-2 text-start font-semibold"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.table.example && (
                          <tr>
                            {s.table.example.map((v, i) => (
                              <td
                                key={i}
                                className="border border-border p-2 align-top italic text-muted-foreground"
                              >
                                {v}
                              </td>
                            ))}
                          </tr>
                        )}
                        {Array.from(
                          { length: s.table.blankRows ?? 0 },
                          (_, r) => (
                            <tr key={`blank-${r}`} className="h-14">
                              {s.table!.columns.map((h) => (
                                <td
                                  key={h}
                                  className="border border-border p-2"
                                />
                              ))}
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                {s.tip && (
                  <p className="rounded-lg border-s-4 border-primary bg-primary/5 p-4 text-sm text-foreground">
                    {s.tip}
                  </p>
                )}
              </section>
            ))}

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">{c.refs}</h2>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {res.references.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>

            <p className="text-xs text-muted-foreground border-t pt-4">
              {c.disclaimer}
            </p>

            <section className="glass-card p-8 text-center space-y-4 print:hidden">
              <p className="text-body text-foreground">{c.cta}</p>
              <Button asChild size="lg">
                <Link to={addLocalePrefix("/psychologists", locale)}>
                  {c.find}
                  <ArrowRight className="ms-2 h-4 w-4" />
                </Link>
              </Button>
            </section>
          </div>
        </article>
      </main>
    </>
  );
}
