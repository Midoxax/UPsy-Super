import { Link } from "@/lib/router-compat";
import { ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { SITE_MAP } from "@/content/siteMap";

const TITLE = { en: "Site map", fr: "Plan du site", ar: "خريطة الموقع" };
const INTRO = {
  en: "Every page of U.Psy, in one place.",
  fr: "Toutes les pages de U.Psy, au même endroit.",
  ar: "كل صفحات U.Psy في مكان واحد.",
};

/** Every public page, grouped (src/content/siteMap.ts). */
export default function Explore() {
  const { locale } = useLocale();
  const lang = locale === "en" || locale === "ar" ? locale : "fr";
  return (
    <div className="container-custom py-10 sm:py-14 space-y-10">
      <SEOHead
        path="/explore"
        title={`${TITLE[lang]} — U.Psy`}
        description={INTRO[lang]}
      />
      <header>
        <h1 className="text-h1">{TITLE[lang]}</h1>
        <p className="text-muted-foreground mt-2">{INTRO[lang]}</p>
      </header>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {SITE_MAP.map((g) => (
          <section key={g.title.en}>
            <h2 className="text-h3 mb-3">{g.title[lang]}</h2>
            <ul className="space-y-0.5">
              {g.pages.map((p) => (
                <li key={p.path}>
                  <Link
                    to={addLocalePrefix(p.path, locale)}
                    className="group inline-flex min-h-10 items-center gap-2 text-foreground hover:text-primary"
                  >
                    {p.label[lang]}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
