// Titles and descriptions for pages whose copy lives in content data (blog
// articles, city and country landings). Kept out of meta.ts so the root head,
// which is in every page's first download, does not carry that data: the
// routes return this from their loaders and the root head reads it there.
import { ARTICLES } from "@/content/blog/articles";
import { LEGACY_POSTS } from "@/content/blog/legacy";
import legacyFr from "@/content/blog/legacy-fr.generated.json";
import type { City, Country } from "@/content/seo/places";
import { BRAND, type DynamicSeo } from "./meta";

export function blogSeo(slug: string): DynamicSeo | null {
  const a = ARTICLES.find((x) => x.slug === slug);
  if (a) {
    // Data articles exist in English and French; Arabic readers get French.
    return {
      title: { en: a.content.en.title + BRAND, fr: a.content.fr.title + BRAND },
      description: {
        en: a.content.en.description,
        fr: a.content.fr.description,
      },
      langs: ["en", "fr"],
    };
  }
  const p = LEGACY_POSTS.find((x) => x.slug === slug);
  if (!p) return null;
  const fr = (
    legacyFr as Record<string, { title: string; description: string }>
  )[p.slug];
  const frTitle = (fr?.title ?? p.fallbackTitle) + BRAND;
  const frDesc = fr?.description ?? p.fallbackDesc;
  return {
    title: { en: p.fallbackTitle + BRAND, fr: frTitle, ar: frTitle },
    description: { en: p.fallbackDesc, fr: frDesc, ar: frDesc },
    langs: ["en", "fr", "ar"],
  };
}

export function citySeo(c: City): DynamicSeo {
  const n = c.name;
  return {
    title: {
      fr: `Psychologue à ${n.fr} : cabinet ou en ligne` + BRAND,
      en: `Psychologist in ${n.en}: in person or online` + BRAND,
      ar: `أخصائي نفسي في ${n.ar}: حضورياً أو عن بعد` + BRAND,
    },
    description: {
      fr: c.intro.fr.slice(0, 155),
      en: c.intro.en.slice(0, 155),
      ar: c.intro.ar.slice(0, 155),
    },
    langs: ["en", "fr", "ar"],
  };
}

export function countrySeo(c: Country): DynamicSeo {
  const n = c.name;
  return {
    title: {
      fr:
        `Psychologue en ligne ${c.inFr === "au" ? "au" : "en"} ${n.fr}` + BRAND,
      en: `Online psychologist in ${n.en}` + BRAND,
      ar: `أخصائي نفسي عبر الإنترنت في ${n.ar}` + BRAND,
    },
    description: {
      fr: c.intro.fr.slice(0, 155),
      en: c.intro.en.slice(0, 155),
      ar: c.intro.ar.slice(0, 155),
    },
    langs: ["en", "fr", "ar"],
  };
}

export const blogLoader = (slug: string) => ({ seo: blogSeo(slug) });
