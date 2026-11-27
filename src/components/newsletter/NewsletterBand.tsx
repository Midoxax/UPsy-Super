import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { useNewsletterCopy } from "@/lib/newsletter/newsletterCopy";

/** The closing call to action, as in the email: the free score or a psychologist. */
export default function NewsletterBand() {
  const { t, locale } = useNewsletterCopy();
  return (
    <section className="container-custom pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-secondary px-6 py-12 text-center text-white md:px-12">
        <div
          className="pointer-events-none absolute h-56 w-56 rounded-full bg-u-gold/20 blur-3xl"
          style={{ insetInlineEnd: "-4rem", top: "-4rem" }}
        />
        <h2 className="font-display text-3xl md:text-4xl">{t.bandTitle}</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/75">{t.bandText}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button size="lg" variant="primary" asChild>
            <Link to={addLocalePrefix("/free-score", locale)}>
              {t.bandScore}
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white"
            asChild
          >
            <Link to={addLocalePrefix("/psychologists", locale)}>
              {t.bandFind}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
