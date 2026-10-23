import { MapPin, Video, Star, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { SITE_URL } from "@/config/site";
import {
  CITIES,
  COUNTRIES,
  type City,
  type Country,
} from "@/content/seo/places";
import type { LocalPsychologist } from "@/lib/seo/localPsychologists";

type Lang = "en" | "fr" | "ar";

const T = {
  fr: {
    home: "Accueil",
    cities: "Psychologue par ville",
    countries: "Psychologue en ligne",
    cityH1: (n: string) => `Psychologue à ${n}`,
    countryH1: (c: Country) =>
      `Psychologue en ligne ${c.inFr === "au" ? "au" : "en"} ${c.name.fr}`,
    seeAll: (n: string) => `Voir les psychologues à ${n}`,
    seeOnline: "Voir les psychologues en ligne",
    match: "Être orienté gratuitement",
    listTitle: (n: string) => `Psychologues à ${n} et à proximité`,
    listOnline: "Psychologues disponibles en visio",
    empty:
      "Les profils de cette zone sont en cours de validation. En attendant, consultez en visio un psychologue de tout le Maroc.",
    inPerson: "Au cabinet",
    online: "En ligne",
    verified: "Vérifié",
    perSession: "MAD / séance",
    km: (d: number) => `à ${Math.round(d)} km`,
    how: "Comment ça marche",
    steps: [
      [
        "Comparez",
        "Spécialités, langues, approche et tarif de chaque psychologue.",
      ],
      [
        "Réservez",
        "Choisissez un créneau, au cabinet ou en visio, en quelques minutes.",
      ],
      [
        "Consultez",
        "Séance confidentielle ; le psychologue confirme le rendez-vous.",
      ],
    ],
    faq: "Questions fréquentes",
    otherCities: "Autres villes",
    otherCountries: "Autres pays",
    near: "Également pour",
    cityFaq: (c: City, min?: number, max?: number) => [
      [
        `Combien coûte une séance de psychologue à ${c.name.fr} ?`,
        min && max
          ? `Sur U.Psy, les psychologues de la région affichent entre ${min} et ${max} MAD par séance. Le tarif est visible sur chaque profil avant de réserver.`
          : "Chaque psychologue affiche son tarif en dirhams sur son profil, avant toute réservation. Il n'y a pas de frais cachés.",
      ],
      [
        "Peut-on consulter en ligne ?",
        `Oui. Si aucun créneau au cabinet ne vous convient à ${c.name.fr}, vous pouvez consulter en visio un psychologue de n'importe quelle ville du Maroc.`,
      ],
      [
        "En quelle langue se passent les séances ?",
        "Selon le psychologue : darija, arabe, français, anglais, parfois espagnol ou amazigh. Les langues sont indiquées sur chaque profil.",
      ],
      [
        "Les séances sont-elles confidentielles ?",
        "Oui. Les psychologues sont tenus au secret professionnel et les données sont protégées conformément à la loi 09-08.",
      ],
    ],
    countryFaq: (c: Country) => [
      [
        "Comment se passe une séance en ligne ?",
        "Par visioconférence sécurisée depuis votre téléphone ou votre ordinateur, sans application à installer. Le lien arrive par email et dans votre espace.",
      ],
      [
        "Quel décalage horaire avec le Maroc ?",
        c.offsetFromMorocco === 0
          ? `Aucun : ${c.name.fr} est à la même heure que le Maroc (${c.timezone}).`
          : `${c.name.fr} (${c.timezone}) a ${Math.abs(c.offsetFromMorocco)} heure${Math.abs(c.offsetFromMorocco) > 1 ? "s" : ""} ${c.offsetFromMorocco < 0 ? "de retard" : "d'avance"} sur le Maroc. Les horaires des créneaux s'affichent à l'heure du Maroc.`,
      ],
      [
        "Comment payer depuis l'étranger ?",
        "Par virement bancaire international ; les coordonnées s'affichent après la réservation. Le tarif est indiqué en dirhams sur chaque profil.",
      ],
      [
        "Les psychologues sont-ils qualifiés ?",
        "Chaque dossier est vérifié par U.Psy (diplômes, autorisation d'exercice) avant publication du profil.",
      ],
    ],
  },
  en: {
    home: "Home",
    cities: "Psychologists by city",
    countries: "Online psychologist",
    cityH1: (n: string) => `Psychologist in ${n}`,
    countryH1: (c: Country) => `Online psychologist in ${c.name.en}`,
    seeAll: (n: string) => `See psychologists in ${n}`,
    seeOnline: "See online psychologists",
    match: "Get matched for free",
    listTitle: (n: string) => `Psychologists in and near ${n}`,
    listOnline: "Psychologists available by video",
    empty:
      "Profiles in this area are being verified. Meanwhile, see a psychologist from anywhere in Morocco by video.",
    inPerson: "In person",
    online: "Online",
    verified: "Verified",
    perSession: "MAD / session",
    km: (d: number) => `${Math.round(d)} km away`,
    how: "How it works",
    steps: [
      [
        "Compare",
        "Each psychologist's specialties, languages, approach and fee.",
      ],
      ["Book", "Pick a time, in the office or by video, in a few minutes."],
      [
        "Meet",
        "A confidential session; the psychologist confirms the appointment.",
      ],
    ],
    faq: "Frequently asked questions",
    otherCities: "Other cities",
    otherCountries: "Other countries",
    near: "Also serving",
    cityFaq: (c: City, min?: number, max?: number) => [
      [
        `How much does a psychologist cost in ${c.name.en}?`,
        min && max
          ? `On U.Psy, psychologists in the area charge between ${min} and ${max} MAD per session. The fee is on every profile before you book.`
          : "Each psychologist shows a fee in dirhams on their profile before you book. No hidden costs.",
      ],
      [
        "Can I see a psychologist online?",
        `Yes. If no in-person slot in ${c.name.en} suits you, see a psychologist from any city in Morocco by video.`,
      ],
      [
        "Which languages are sessions in?",
        "It depends on the psychologist: Darija, Arabic, French, English, sometimes Spanish or Amazigh. Languages are on each profile.",
      ],
      [
        "Are sessions confidential?",
        "Yes. Psychologists are bound by professional secrecy and data is protected under Moroccan Law 09-08.",
      ],
    ],
    countryFaq: (c: Country) => [
      [
        "How does an online session work?",
        "By secure video from your phone or computer, with nothing to install. The link arrives by email and in your account.",
      ],
      [
        "What is the time difference with Morocco?",
        c.offsetFromMorocco === 0
          ? `None: ${c.name.en} is on the same time as Morocco (${c.timezone}).`
          : `${c.name.en} (${c.timezone}) is ${Math.abs(c.offsetFromMorocco)} hour${Math.abs(c.offsetFromMorocco) > 1 ? "s" : ""} ${c.offsetFromMorocco < 0 ? "behind" : "ahead of"} Morocco. Slots are shown in Morocco time.`,
      ],
      [
        "How do I pay from abroad?",
        "By international bank transfer; the details appear after booking. Fees are shown in dirhams on each profile.",
      ],
      [
        "Are the psychologists qualified?",
        "U.Psy checks every file (degrees, licence to practise) before a profile goes live.",
      ],
    ],
  },
  ar: {
    home: "الرئيسية",
    cities: "الأخصائيون حسب المدن",
    countries: "أخصائي نفسي عبر الإنترنت",
    cityH1: (n: string) => `أخصائي نفسي في ${n}`,
    countryH1: (c: Country) => `أخصائي نفسي عبر الإنترنت في ${c.name.ar}`,
    seeAll: (n: string) => `عرض الأخصائيين في ${n}`,
    seeOnline: "عرض الأخصائيين عبر الإنترنت",
    match: "توجيه مجاني",
    listTitle: (n: string) => `أخصائيون في ${n} وما حولها`,
    listOnline: "أخصائيون متاحون عبر الفيديو",
    empty:
      "ملفات هذه المنطقة قيد التحقق. في الأثناء، استشر عبر الفيديو أخصائياً من كل المغرب.",
    inPerson: "في العيادة",
    online: "عبر الإنترنت",
    verified: "موثّق",
    perSession: "درهم / حصة",
    km: (d: number) => `على بعد ${Math.round(d)} كلم`,
    how: "كيف يعمل",
    steps: [
      ["قارن", "تخصصات كل أخصائي ولغاته ومنهجه وسعره."],
      ["احجز", "اختر موعداً في العيادة أو عبر الفيديو في دقائق."],
      ["استشر", "حصة سرية، ويؤكد الأخصائي الموعد."],
    ],
    faq: "أسئلة شائعة",
    otherCities: "مدن أخرى",
    otherCountries: "دول أخرى",
    near: "وأيضاً",
    cityFaq: (c: City, min?: number, max?: number) => [
      [
        `كم تكلف حصة أخصائي نفسي في ${c.name.ar}؟`,
        min && max
          ? `على U.Psy، يتراوح سعر الحصة لدى أخصائيي المنطقة بين ${min} و${max} درهماً، ويظهر السعر في كل ملف قبل الحجز.`
          : "يعرض كل أخصائي سعره بالدرهم في ملفه قبل الحجز، دون رسوم خفية.",
      ],
      [
        "هل يمكن الاستشارة عبر الإنترنت؟",
        `نعم، إن لم يناسبك موعد في العيادة في ${c.name.ar} يمكنك الاستشارة عبر الفيديو مع أخصائي من أي مدينة مغربية.`,
      ],
      [
        "بأي لغة تجرى الحصص؟",
        "حسب الأخصائي: الدارجة، العربية، الفرنسية، الإنجليزية، وأحياناً الإسبانية أو الأمازيغية.",
      ],
      [
        "هل الحصص سرية؟",
        "نعم، الأخصائيون ملزمون بالسر المهني، والبيانات محمية وفق القانون 09-08.",
      ],
    ],
    countryFaq: (c: Country) => [
      [
        "كيف تجرى الحصة عبر الإنترنت؟",
        "عبر فيديو آمن من هاتفك أو حاسوبك دون تثبيت أي تطبيق، ويصلك الرابط بالبريد وفي حسابك.",
      ],
      [
        "ما فارق التوقيت مع المغرب؟",
        c.offsetFromMorocco === 0
          ? `لا فارق: ${c.name.ar} بنفس توقيت المغرب.`
          : `فارق ${Math.abs(c.offsetFromMorocco)} ساعة مع المغرب، وتظهر المواعيد بتوقيت المغرب.`,
      ],
      [
        "كيف أدفع من الخارج؟",
        "بالتحويل البنكي الدولي، وتظهر المعطيات بعد الحجز.",
      ],
      [
        "هل الأخصائيون مؤهلون؟",
        "يتحقق U.Psy من كل ملف (الشهادات وترخيص المزاولة) قبل نشره.",
      ],
    ],
  },
};

const useLang = (): Lang => {
  const { locale } = useLocale();
  return locale === "en" || locale === "ar" ? locale : "fr";
};

function Crumbs({ items }: { items: Array<[string, string?]> }) {
  const { locale } = useLocale();
  return (
    <nav
      aria-label="breadcrumb"
      className="text-sm text-muted-foreground flex flex-wrap gap-1.5"
    >
      {items.map(([label, to], i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden>›</span>}
          {to ? (
            <Link
              to={addLocalePrefix(to, locale)}
              className="hover:text-primary"
            >
              {label}
            </Link>
          ) : (
            <span className="text-foreground">{label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function Cards({
  list,
  emptyText,
}: {
  list: LocalPsychologist[];
  emptyText: string;
}) {
  const lang = useLang();
  const { locale } = useLocale();
  const t = T[lang];
  if (list.length === 0)
    return <p className="text-muted-foreground">{emptyText}</p>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p) => (
        <li key={p.id}>
          <Link
            to={addLocalePrefix(`/psychologists/${p.slug ?? p.id}`, locale)}
            className="glass-card p-4 flex gap-3 hover:shadow-glass-hover transition-all h-full"
          >
            {p.photo_url ? (
              <img
                src={p.photo_url}
                alt=""
                loading="lazy"
                className="w-14 h-14 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-muted shrink-0" />
            )}
            <div className="min-w-0 space-y-1">
              <p className="font-semibold text-foreground truncate">
                {p.full_name}
              </p>
              <p className="text-xs text-muted-foreground flex flex-wrap gap-x-2">
                {p.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {p.city}
                    {p.distance_km != null &&
                      p.distance_km > 3 &&
                      ` · ${t.km(Number(p.distance_km))}`}
                  </span>
                )}
                {p.rating_count ? (
                  <span className="inline-flex items-center gap-1">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    {Number(p.rating_avg).toFixed(1)} ({p.rating_count})
                  </span>
                ) : null}
              </p>
              <div className="flex flex-wrap gap-1">
                {p.is_accredited && (
                  <Badge variant="outline" className="text-[10px]">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    {t.verified}
                  </Badge>
                )}
                {p.offers_in_person && (
                  <Badge variant="outline" className="text-[10px]">
                    {t.inPerson}
                  </Badge>
                )}
                {p.offers_online && (
                  <Badge variant="outline" className="text-[10px]">
                    <Video className="w-3 h-3 mr-1" />
                    {t.online}
                  </Badge>
                )}
              </div>
              {p.hourly_rate_mad ? (
                <p className="text-sm font-medium text-foreground">
                  {Math.round(Number(p.hourly_rate_mad))} {t.perSession}
                </p>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Faq({ items }: { items: string[][] }) {
  return (
    <div className="space-y-2">
      {items.map(([q, a]) => (
        <details key={q} className="glass-card p-4 group">
          <summary className="cursor-pointer font-medium text-foreground min-h-10 flex items-center">
            {q}
          </summary>
          <p className="text-sm text-muted-foreground mt-2">{a}</p>
        </details>
      ))}
    </div>
  );
}

const jsonLdFor = (
  crumbs: Array<[string, string]>,
  faq: string[][],
  list: LocalPsychologist[],
  lang: Lang,
) => {
  const url = (p: string) =>
    `${SITE_URL}${lang === "en" ? "" : `/${lang}`}${p}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map(([name, path], i) => ({
        "@type": "ListItem",
        position: i + 1,
        name,
        item: url(path),
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
    ...(list.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: list.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: url(`/psychologists/${p.slug ?? p.id}`),
              name: p.full_name,
            })),
          },
        ]
      : []),
  ];
};

export function CityPage({
  city,
  list,
}: {
  city: City;
  list: LocalPsychologist[];
}) {
  const lang = useLang();
  const { locale } = useLocale();
  const t = T[lang];
  const n = city.name[lang];
  const fees = list.map((p) => Number(p.hourly_rate_mad)).filter((x) => x > 0);
  const faq = t.cityFaq(
    city,
    fees.length ? Math.min(...fees) : undefined,
    fees.length ? Math.max(...fees) : undefined,
  );
  const crumbs: Array<[string, string]> = [
    [t.home, "/"],
    [t.cities, "/psychologue"],
    [n, `/psychologue/${city.slug}`],
  ];
  return (
    <div className="container-custom py-8 sm:py-12 space-y-10">
      <SEOHead
        path={`/psychologue/${city.slug}`}
        jsonLd={jsonLdFor(crumbs, faq, list, lang)}
      />
      <Crumbs items={[[t.home, "/"], [t.cities, "/psychologue"], [n]]} />
      <header className="space-y-4 max-w-3xl">
        <h1 className="text-h1">{t.cityH1(n)}</h1>
        <p className="text-lg text-muted-foreground">{city.intro[lang]}</p>
        <p className="text-sm text-muted-foreground">
          {city.region[lang]} · {t.near} {city.near.join(", ")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="primary" size="lg">
            <Link
              to={addLocalePrefix(
                `/psychologists?city=${encodeURIComponent(city.name.fr)}`,
                locale,
              )}
            >
              {t.seeAll(n)}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to={addLocalePrefix("/get-matched", locale)}>{t.match}</Link>
          </Button>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-h2">{t.listTitle(n)}</h2>
        <Cards list={list} emptyText={t.empty} />
      </section>

      <HowItWorks t={t} />

      <section className="space-y-4 max-w-3xl">
        <h2 className="text-h2">{t.faq}</h2>
        <Faq items={faq} />
      </section>

      <section className="space-y-3">
        <h2 className="text-h3">{t.otherCities}</h2>
        <PlaceLinks
          base="/psychologue"
          items={CITIES.filter((c) => c.slug !== city.slug).map((c) => [
            c.slug,
            c.name[lang],
          ])}
        />
        <p>
          <Link
            to={addLocalePrefix("/psychologue-en-ligne", locale)}
            className="text-primary inline-flex min-h-10 items-center gap-1"
          >
            {t.countries} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </p>
      </section>
    </div>
  );
}

export function CountryPage({
  country,
  list,
}: {
  country: Country;
  list: LocalPsychologist[];
}) {
  const lang = useLang();
  const { locale } = useLocale();
  const t = T[lang];
  const faq = t.countryFaq(country);
  const crumbs: Array<[string, string]> = [
    [t.home, "/"],
    [t.countries, "/psychologue-en-ligne"],
    [country.name[lang], `/psychologue-en-ligne/${country.slug}`],
  ];
  return (
    <div className="container-custom py-8 sm:py-12 space-y-10">
      <SEOHead
        path={`/psychologue-en-ligne/${country.slug}`}
        jsonLd={jsonLdFor(crumbs, faq, list, lang)}
      />
      <Crumbs
        items={[
          [t.home, "/"],
          [t.countries, "/psychologue-en-ligne"],
          [country.name[lang]],
        ]}
      />
      <header className="space-y-4 max-w-3xl">
        <h1 className="text-h1">{t.countryH1(country)}</h1>
        <p className="text-lg text-muted-foreground">{country.intro[lang]}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="primary" size="lg">
            <Link to={addLocalePrefix("/psychologists?online=1", locale)}>
              {t.seeOnline}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to={addLocalePrefix("/get-matched", locale)}>{t.match}</Link>
          </Button>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-h2">{t.listOnline}</h2>
        <Cards list={list} emptyText={t.empty} />
      </section>

      <HowItWorks t={t} />

      <section className="space-y-4 max-w-3xl">
        <h2 className="text-h2">{t.faq}</h2>
        <Faq items={faq} />
      </section>

      <section className="space-y-3">
        <h2 className="text-h3">{t.otherCountries}</h2>
        <PlaceLinks
          base="/psychologue-en-ligne"
          items={COUNTRIES.filter((c) => c.slug !== country.slug).map((c) => [
            c.slug,
            c.name[lang],
          ])}
        />
      </section>
    </div>
  );
}

function HowItWorks({ t }: { t: (typeof T)["fr"] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-h2">{t.how}</h2>
      <ol className="grid gap-3 sm:grid-cols-3">
        {t.steps.map(([title, body], i) => (
          <li key={title} className="glass-card p-5">
            <p className="text-primary font-bold">{i + 1}</p>
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground mt-1">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PlaceLinks({
  base,
  items,
}: {
  base: string;
  items: Array<[string, string]>;
}) {
  const { locale } = useLocale();
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map(([slug, name]) => (
        <li key={slug}>
          <Link
            to={addLocalePrefix(`${base}/${slug}`, locale)}
            className="inline-flex min-h-10 items-center rounded-full border border-border px-3 text-sm hover:border-primary hover:text-primary"
          >
            {name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function PlacesIndex({ kind }: { kind: "cities" | "countries" }) {
  const lang = useLang();
  const t = T[lang];
  const intro = {
    cities: {
      fr: "Choisissez votre ville pour voir les psychologues les plus proches, leurs tarifs et leurs disponibilités. Partout ailleurs, la consultation en visio est possible.",
      en: "Pick your city to see the nearest psychologists, their fees and openings. Anywhere else, video sessions are available.",
      ar: "اختر مدينتك لترى أقرب الأخصائيين وأسعارهم ومواعيدهم. وفي كل مكان آخر تتاح الاستشارة عبر الفيديو.",
    },
    countries: {
      fr: "Des psychologues francophones et arabophones, vérifiés au Maroc, consultent en visio dans toute l'Afrique francophone et auprès de la diaspora.",
      en: "French- and Arabic-speaking psychologists, verified in Morocco, see clients by video across French-speaking Africa and the diaspora.",
      ar: "أخصائيون نفسيون ناطقون بالفرنسية والعربية، موثّقون في المغرب، يستشيرون عبر الفيديو في إفريقيا الفرنكوفونية ولدى الجالية.",
    },
  }[kind][lang];
  const base = kind === "cities" ? "/psychologue" : "/psychologue-en-ligne";
  const title = kind === "cities" ? t.cities : t.countries;
  return (
    <div className="container-custom py-8 sm:py-12 space-y-8">
      <SEOHead path={base} />
      <Crumbs items={[[t.home, "/"], [title]]} />
      <header className="space-y-3 max-w-3xl">
        <h1 className="text-h1">{title}</h1>
        <p className="text-lg text-muted-foreground">{intro}</p>
      </header>
      <PlaceLinks
        base={base}
        items={(kind === "cities" ? CITIES : COUNTRIES).map((c) => [
          c.slug,
          c.name[lang],
        ])}
      />
    </div>
  );
}
