// Search metadata for a URL, computed the same way on the server and in the
// browser: <html lang/dir>, title, description, canonical, hreflang
// alternates, robots. The root route renders it into the server HTML, so a
// crawler gets the right tags before any JavaScript runs.
import { SITE_URL } from "@/config/site";
import { ARTICLES } from "@/content/blog/articles";
import { LEGACY_POSTS } from "@/content/blog/legacy";
import legacyFr from "@/content/blog/legacy-fr.generated.json";
import { CITIES, COUNTRIES } from "@/content/seo/places";

export type Lang = "en" | "fr" | "ar";
type L3 = Record<Lang, string>;

export interface PageSeo {
  lang: string;
  dir: "ltr" | "rtl";
  title: string;
  description: string;
  canonical: string;
  alternates: Array<{ hrefLang: string; href: string }>;
  ogLocale: string;
  noindex: boolean;
  /** True when this file has hand-written or data-driven copy for the page. */
  curated: boolean;
}

const BRAND = " | U.Psy";

// Hand-written for the pages people search for. Titles stay under ~60
// characters before the brand, descriptions under ~155.
const PAGES: Record<string, { title: L3; description: L3 }> = {
  "/": {
    title: {
      fr: "Psychologue au Maroc et en ligne : réservez une séance",
      en: "Psychologists in Morocco and online: book a session",
      ar: "أخصائي نفسي في المغرب وعبر الإنترنت: احجز حصتك",
    },
    description: {
      fr: "Psychologues vérifiés au Maroc : séances au cabinet ou en visio, en darija, arabe, français ou anglais. Tarifs affichés, réservation en ligne.",
      en: "Verified psychologists in Morocco: in-office or video sessions in Darija, Arabic, French or English. Clear fees, online booking.",
      ar: "أخصائيون نفسيون موثوقون في المغرب: حصص في العيادة أو عبر الفيديو بالدارجة والعربية والفرنسية والإنجليزية. أسعار واضحة وحجز إلكتروني.",
    },
  },
  "/psychologists": {
    title: {
      fr: "Trouver un psychologue au Maroc, au cabinet ou en ligne",
      en: "Find a psychologist in Morocco, in person or online",
      ar: "ابحث عن أخصائي نفسي في المغرب، حضورياً أو عن بعد",
    },
    description: {
      fr: "Comparez les psychologues par ville, spécialité, langue et tarif. Casablanca, Rabat, Marrakech, Tanger et en visio partout. Réservez en ligne.",
      en: "Compare psychologists by city, specialty, language and fee. Casablanca, Rabat, Marrakech, Tangier, and by video anywhere. Book online.",
      ar: "قارن الأخصائيين النفسيين حسب المدينة والتخصص واللغة والسعر. الدار البيضاء والرباط ومراكش وطنجة، وعبر الفيديو من أي مكان.",
    },
  },
  "/get-matched": {
    title: {
      fr: "Quel psychologue choisir ? Orientation gratuite en 2 minutes",
      en: "Which psychologist is right for you? Free 2-minute match",
      ar: "أي أخصائي نفسي يناسبك؟ توجيه مجاني في دقيقتين",
    },
    description: {
      fr: "Répondez à quelques questions et recevez une sélection de psychologues adaptés à votre besoin, votre langue et votre budget.",
      en: "Answer a few questions and get psychologists matched to your need, your language and your budget.",
      ar: "أجب عن بضعة أسئلة واحصل على أخصائيين يناسبون حاجتك ولغتك وميزانيتك.",
    },
  },
  "/pricing": {
    title: {
      fr: "Tarifs des séances de psychologue au Maroc",
      en: "Psychologist session fees in Morocco",
      ar: "أسعار حصص الأخصائي النفسي في المغرب",
    },
    description: {
      fr: "Combien coûte une séance de psychologue au Maroc ? Tarifs en dirhams affichés par chaque praticien, paiement par virement, sans frais cachés.",
      en: "How much does a psychologist cost in Morocco? Each practitioner shows fees in dirhams; pay by transfer, no hidden costs.",
      ar: "كم تكلف حصة الأخصائي النفسي في المغرب؟ يعرض كل أخصائي سعره بالدرهم، والدفع بالتحويل دون رسوم خفية.",
    },
  },
  "/mental-performance": {
    title: {
      fr: "Préparation mentale et psychologie du sport au Maroc",
      en: "Sport psychology and mental performance in Morocco",
      ar: "التحضير الذهني وعلم النفس الرياضي في المغرب",
    },
    description: {
      fr: "Préparation mentale pour sportifs, équipes et dirigeants : concentration, confiance, gestion du stress de compétition, avec des psychologues du sport.",
      en: "Mental preparation for athletes, teams and leaders: focus, confidence, competition stress, with sport psychologists.",
      ar: "تحضير ذهني للرياضيين والفرق والقادة: التركيز والثقة وإدارة ضغط المنافسة مع أخصائيين في علم النفس الرياضي.",
    },
  },
  "/mental-toughness-athletes": {
    title: {
      fr: "Force mentale du sportif : méthode et accompagnement",
      en: "Mental toughness for athletes: method and coaching",
      ar: "الصلابة الذهنية للرياضي: منهج ومرافقة",
    },
    description: {
      fr: "Développer la force mentale en compétition : routines, visualisation, gestion de l'échec. Programme mené par des psychologues du sport.",
      en: "Build mental toughness for competition: routines, visualisation, handling setbacks. A programme led by sport psychologists.",
      ar: "تطوير الصلابة الذهنية في المنافسة: الروتين والتخيل وإدارة الإخفاق، ببرنامج يقوده أخصائيون في علم النفس الرياضي.",
    },
  },
  "/athlete-hub": {
    title: {
      fr: "Espace Athlète : préparation mentale au quotidien",
      en: "Athlete Hub: daily mental training",
      ar: "فضاء الرياضي: تدريب ذهني يومي",
    },
    description: {
      fr: "Check-in, objectifs, routine d'avant-compétition, journal et bilan mensuel, à partager avec votre psychologue du sport.",
      en: "Check-ins, goals, pre-competition routine, journal and monthly report, shareable with your sport psychologist.",
      ar: "تقييم يومي وأهداف وروتين ما قبل المنافسة ومذكرات وتقرير شهري، للمشاركة مع أخصائيك.",
    },
  },
  "/for-organizations": {
    title: {
      fr: "Santé mentale au travail : programme pour entreprises au Maroc",
      en: "Workplace mental health programme for companies in Morocco",
      ar: "الصحة النفسية في العمل: برنامج للشركات في المغرب",
    },
    description: {
      fr: "Soutien psychologique des salariés, prévention du burn-out, indicateurs anonymisés et facturation conforme au Maroc.",
      en: "Psychological support for employees, burnout prevention, anonymised indicators and Morocco-compliant invoicing.",
      ar: "دعم نفسي للموظفين والوقاية من الاحتراق المهني ومؤشرات مجهولة الهوية وفوترة مطابقة للقانون المغربي.",
    },
  },
  "/apply": {
    title: {
      fr: "Psychologues : rejoignez U.Psy et recevez des patients",
      en: "Psychologists: join U.Psy and receive patients",
      ar: "الأخصائيون النفسيون: انضموا إلى U.Psy واستقبلوا المرضى",
    },
    description: {
      fr: "Déposez votre dossier, faites-le vérifier et publiez votre profil. Réservations, visio, rappels et paiements gérés pour vous.",
      en: "Submit your file, get verified and publish your profile. Bookings, video, reminders and payments handled for you.",
      ar: "قدّم ملفك واحصل على التحقق وانشر ملفك. الحجوزات والفيديو والتذكيرات والمدفوعات علينا.",
    },
  },
  "/blog": {
    title: {
      fr: "Blog santé mentale et psychologie du sport",
      en: "Mental health and sport psychology blog",
      ar: "مدونة الصحة النفسية وعلم النفس الرياضي",
    },
    description: {
      fr: "Anxiété, burn-out, dépression, performance : des articles écrits par des psychologues, en français et en anglais.",
      en: "Anxiety, burnout, depression, performance: articles by psychologists, in French and English.",
      ar: "القلق والاحتراق والاكتئاب والأداء: مقالات يكتبها أخصائيون نفسيون.",
    },
  },
  "/psychologue": {
    title: {
      fr: "Psychologue par ville au Maroc",
      en: "Psychologists by city in Morocco",
      ar: "الأخصائيون النفسيون حسب المدن في المغرب",
    },
    description: {
      fr: "Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir et 10 autres villes : trouvez un psychologue près de chez vous ou en ligne.",
      en: "Casablanca, Rabat, Marrakech, Fez, Tangier, Agadir and 10 more cities: find a psychologist near you or online.",
      ar: "الدار البيضاء والرباط ومراكش وفاس وطنجة وأكادير و10 مدن أخرى: ابحث عن أخصائي نفسي قربك أو عبر الإنترنت.",
    },
  },
  "/psychologue-en-ligne": {
    title: {
      fr: "Psychologue en ligne francophone pour l'Afrique et la diaspora",
      en: "Online French- and Arabic-speaking psychologist for Africa",
      ar: "أخصائي نفسي عبر الإنترنت لإفريقيا والجالية",
    },
    description: {
      fr: "Sénégal, Côte d'Ivoire, Tunisie, Algérie, Cameroun, France, Belgique, Canada : consultez en visio un psychologue francophone ou arabophone.",
      en: "Senegal, Côte d'Ivoire, Tunisia, Algeria, Cameroon, France, Belgium, Canada: see a French- or Arabic-speaking psychologist by video.",
      ar: "السنغال وساحل العاج وتونس والجزائر والكاميرون وفرنسا وبلجيكا وكندا: استشر أخصائياً نفسياً عبر الفيديو.",
    },
  },
  "/contact": {
    title: { fr: "Contacter U.Psy", en: "Contact U.Psy", ar: "اتصل بـ U.Psy" },
    description: {
      fr: "Une question sur une séance, un paiement ou un partenariat ? Écrivez-nous ou contactez-nous sur WhatsApp.",
      en: "A question about a session, a payment or a partnership? Write to us or reach us on WhatsApp.",
      ar: "سؤال حول حصة أو دفع أو شراكة؟ راسلنا أو تواصل معنا عبر واتساب.",
    },
  },
};

// Signed-in or one-off pages: never in search results.
const PRIVATE =
  /^\/(dashboard|admin|ops|auth|my-space|notifications|intake|session|booking|b|invite|unsubscribe|newsletter|reset-password|league|center\/progress|apply\/wizard|video)(\/|$)/;

const LOCALES = ["fr", "ar", "ber"] as const;

export function splitLocale(pathname: string): {
  locale: Lang | "ber";
  path: string;
} {
  const clean = pathname.split(/[?#]/)[0] || "/";
  const m = clean.match(/^\/(fr|ar|ber)(\/.*)?$/);
  if (m) return { locale: m[1] as Lang | "ber", path: m[2] || "/" };
  return { locale: "en", path: clean };
}

const href = (locale: Lang, path: string) =>
  `${SITE_URL}${locale === "en" ? "" : `/${locale}`}${path === "/" && locale !== "en" ? "" : path}`;

function contentFor(
  path: string,
  lang: Lang,
): { title: string; description: string; langs: Lang[] } | null {
  const page = PAGES[path];
  if (page)
    return {
      title: page.title[lang] + BRAND,
      description: page.description[lang],
      langs: ["en", "fr", "ar"],
    };

  const blog = path.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blog) {
    const a = ARTICLES.find((x) => x.slug === blog[1]);
    if (a) {
      // Data articles exist in English and French; Arabic readers get French.
      const c = a.content[lang === "en" ? "en" : "fr"];
      return {
        title: c.title + BRAND,
        description: c.description,
        langs: ["en", "fr"],
      };
    }
    const p = LEGACY_POSTS.find((x) => x.slug === blog[1]);
    if (p) {
      const fr = (
        legacyFr as Record<string, { title: string; description: string }>
      )[p.slug];
      return {
        title:
          (lang === "en" ? p.fallbackTitle : (fr?.title ?? p.fallbackTitle)) +
          BRAND,
        description:
          lang === "en" ? p.fallbackDesc : (fr?.description ?? p.fallbackDesc),
        langs: ["en", "fr", "ar"],
      };
    }
  }

  const city = path.match(/^\/psychologue\/([a-z-]+)$/);
  if (city) {
    const c = CITIES.find((x) => x.slug === city[1]);
    if (c) {
      const n = c.name[lang];
      return {
        title:
          (lang === "fr"
            ? `Psychologue à ${n} : cabinet ou en ligne`
            : lang === "en"
              ? `Psychologist in ${n}: in person or online`
              : `أخصائي نفسي في ${n}: حضورياً أو عن بعد`) + BRAND,
        description: c.intro[lang].slice(0, 155),
        langs: ["en", "fr", "ar"],
      };
    }
  }

  const country = path.match(/^\/psychologue-en-ligne\/([a-z-]+)$/);
  if (country) {
    const c = COUNTRIES.find((x) => x.slug === country[1]);
    if (c) {
      const n = c.name[lang];
      return {
        title:
          (lang === "fr"
            ? `Psychologue en ligne ${c.inFr === "au" ? "au" : "en"} ${n}`
            : lang === "en"
              ? `Online psychologist in ${n}`
              : `أخصائي نفسي عبر الإنترنت في ${n}`) + BRAND,
        description: c.intro[lang].slice(0, 155),
        langs: ["en", "fr", "ar"],
      };
    }
  }
  return null;
}

const DEFAULT: L3 = {
  fr: "U.Psy : psychologues vérifiés au Maroc et en ligne",
  en: "U.Psy: verified psychologists in Morocco and online",
  ar: "U.Psy: أخصائيون نفسيون موثوقون في المغرب وعبر الإنترنت",
};

export function seoForPath(pathname: string): PageSeo {
  const { locale, path } = splitLocale(pathname);
  // Berber pages show French or Arabic text for now: they point search
  // engines at the French page rather than competing with it.
  const lang: Lang = locale === "ber" ? "fr" : locale;
  const content = contentFor(path, lang);
  const langs = content?.langs ?? ["en", "fr", "ar"];
  // A language the page is not written in canonicalises to French.
  const canonicalLang: Lang = langs.includes(lang) ? lang : "fr";
  const noindex = PRIVATE.test(path);
  return {
    lang: locale === "ber" ? "fr" : lang,
    dir: lang === "ar" ? "rtl" : "ltr",
    title: content?.title ?? DEFAULT[lang],
    description: content?.description ?? PAGES["/"].description[lang],
    canonical: href(canonicalLang, path),
    alternates: noindex
      ? []
      : [
          ...langs.map((l) => ({ hrefLang: l, href: href(l, path) })),
          {
            hrefLang: "x-default",
            href: href(langs.includes("fr") ? "fr" : "en", path),
          },
        ],
    ogLocale: lang === "fr" ? "fr_MA" : lang === "ar" ? "ar_MA" : "en_US",
    noindex,
    curated: content !== null,
  };
}

export const isLocalePrefix = (s: string) =>
  (LOCALES as readonly string[]).includes(s);
