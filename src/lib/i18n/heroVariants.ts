/**
 * Copy overrides for the `home_hero_v1` A/B test.
 *
 * Each variant only overrides the fields it changes; everything else falls
 * through to `homeCopy.ts`, so the surrounding hero (metrics panel, ticker)
 * stays identical and the test isolates headline / subhead / CTA.
 *
 * Three arms:
 *  - `control` — the existing abstract, authority-led editorial hero.
 *  - `clarity` — plain language and a concrete promise. Tests whether the
 *    abstract framing is costing us visitors who don't self-identify as
 *    "elite performers".
 *  - `offer`  — leads with the live WELCOME20 launch discount and routes the
 *    primary CTA into the paid-campaign landing page.
 */

import type { Locale } from "@/lib/i18n/utils";
import type { HomeHeroVariant } from "@/lib/experiments/config";

export type HeroCtaTarget = {
  label?: string;
  /** Internal route. Omit to keep the variant's default destination. */
  to?: string;
  search?: Record<string, string>;
};

export type HeroVariantCopy = {
  eyebrow?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  tagline?: string;
  body?: string;
  ctaPrimary?: HeroCtaTarget;
  ctaSecondary?: HeroCtaTarget;
  /** Small reassurance line under the buttons. */
  ctaFootnote?: string;
};

type VariantTable = Record<Exclude<HomeHeroVariant, "control">, Record<string, HeroVariantCopy>>;

/**
 * Attribution for homepage traffic entering the paid-campaign funnel. Tagging
 * here (not just on the ad) keeps organic homepage visitors who convert on the
 * offer distinguishable from paid clicks that land on the campaign page direct.
 */
const OFFER_SEARCH = {
  utm_source: "site",
  utm_medium: "homepage_hero",
  utm_campaign: "welcome20_launch",
  utm_content: "hero_offer_variant",
};

const VARIANTS: VariantTable = {
  clarity: {
    en: {
      eyebrow: "Accredited psychologists · Video worldwide",
      headlineLine1: "Talk to someone",
      headlineLine2: "who actually helps.",
      tagline: "Matched in 48 hours. Free rebook if the fit is wrong.",
      body:
        "Answer a few questions and we match you with an accredited psychologist who fits your language, schedule and what you're working through. Video anywhere in the world, or in person in select cities.",
      ctaPrimary: { label: "FIND MY PSYCHOLOGIST", to: "/get-matched" },
      ctaSecondary: { label: "TAKE THE 3-MIN ASSESSMENT", to: "/free-score" },
      ctaFootnote: "No card needed to get matched.",
    },
    fr: {
      eyebrow: "Psychologues accrédités · Visio dans le monde entier",
      headlineLine1: "Parlez à quelqu'un",
      headlineLine2: "qui vous aide vraiment.",
      tagline: "Mise en relation en 48 heures. Nouvelle séance offerte si le courant ne passe pas.",
      body:
        "Répondez à quelques questions et nous vous mettons en relation avec un psychologue accrédité adapté à votre langue, à vos horaires et à ce que vous traversez. En visio partout dans le monde, ou en présentiel dans certaines villes.",
      ctaPrimary: { label: "TROUVER MON PSYCHOLOGUE", to: "/get-matched" },
      ctaSecondary: { label: "FAIRE LE TEST DE 3 MIN", to: "/free-score" },
      ctaFootnote: "Aucune carte bancaire requise.",
    },
    ar: {
      eyebrow: "أخصائيون معتمدون · جلسات مرئية حول العالم",
      headlineLine1: "تحدّث إلى شخص",
      headlineLine2: "يساعدك فعلاً.",
      tagline: "مطابقة خلال 48 ساعة. جلسة بديلة مجاناً إن لم يكن الاختيار مناسباً.",
      body:
        "أجب عن بضعة أسئلة وسنطابقك مع أخصائي نفسي معتمد يناسب لغتك وجدولك وما تمرّ به. جلسات مرئية من أي مكان، أو حضورياً في مدن مختارة.",
      ctaPrimary: { label: "ابحث عن أخصائيي", to: "/get-matched" },
      ctaSecondary: { label: "ابدأ التقييم في 3 دقائق", to: "/free-score" },
      ctaFootnote: "لا حاجة لبطاقة بنكية.",
    },
  },
  offer: {
    en: {
      eyebrow: "Launch offer · WELCOME20",
      headlineLine1: "Your first session,",
      headlineLine2: "20% off.",
      tagline: "Matched in 48 hours. Free rebook if the fit is wrong.",
      body:
        "Start with an accredited psychologist for 20% less. Video anywhere in the world, or in person in select cities — in French, English, Arabic or Darija.",
      ctaPrimary: { label: "CLAIM WELCOME20", to: "/campaigns/first-session", search: OFFER_SEARCH },
      ctaSecondary: { label: "BROWSE PSYCHOLOGISTS", to: "/psychologists" },
      ctaFootnote: "Code sent to your inbox in under a minute.",
    },
    fr: {
      eyebrow: "Offre de lancement · WELCOME20",
      headlineLine1: "Votre première séance,",
      headlineLine2: "-20 %.",
      tagline: "Mise en relation en 48 heures. Nouvelle séance offerte si le courant ne passe pas.",
      body:
        "Commencez avec un psychologue accrédité à -20 %. En visio partout dans le monde, ou en présentiel dans certaines villes — en français, anglais, arabe ou darija.",
      ctaPrimary: { label: "OBTENIR WELCOME20", to: "/campaigns/first-session", search: OFFER_SEARCH },
      ctaSecondary: { label: "VOIR LES PSYCHOLOGUES", to: "/psychologists" },
      ctaFootnote: "Code envoyé par e-mail en moins d'une minute.",
    },
    ar: {
      eyebrow: "عرض الإطلاق · WELCOME20",
      headlineLine1: "جلستك الأولى",
      headlineLine2: "بخصم 20٪.",
      tagline: "مطابقة خلال 48 ساعة. جلسة بديلة مجاناً إن لم يكن الاختيار مناسباً.",
      body:
        "ابدأ مع أخصائي نفسي معتمد بخصم 20٪. جلسات مرئية من أي مكان، أو حضورياً في مدن مختارة — بالفرنسية أو الإنجليزية أو العربية أو الدارجة.",
      ctaPrimary: { label: "احصل على WELCOME20", to: "/campaigns/first-session", search: OFFER_SEARCH },
      ctaSecondary: { label: "تصفّح الأخصائيين", to: "/psychologists" },
      ctaFootnote: "يصلك الرمز على بريدك في أقل من دقيقة.",
    },
  },
};

/** Berber falls back to Arabic, matching homeCopy's behaviour. */
function resolveLocaleKey(locale: Locale): string {
  const key = String(locale);
  if (key === "ber") return "ar";
  return key in VARIANTS.clarity ? key : "en";
}

export function getHeroVariantCopy(variant: HomeHeroVariant, locale: Locale): HeroVariantCopy {
  if (variant === "control") return {};
  const table = VARIANTS[variant];
  if (!table) return {};
  return table[resolveLocaleKey(locale)] ?? table["en"] ?? {};
}
