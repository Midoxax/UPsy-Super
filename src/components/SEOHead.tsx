import { useEffect } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix, stripLocalePrefix } from "@/lib/i18n/utils";
import { absoluteUrl } from "@/config/site";
import { useRouterState } from "@tanstack/react-router";
import { dynamicSeo, seoForPath } from "@/lib/seo/meta";

interface SEOHeadProps {
  path: string;
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const DEFAULT_OG_IMAGE = absoluteUrl("/og-image.jpg");

/**
 * Keeps the head right after client-side navigation. The server already
 * rendered the same tags from seoForPath (src/lib/seo/meta.ts); this updates
 * them when the route changes without a reload, and adds per-page JSON-LD.
 * Where meta.ts has curated, translated copy for the page, it wins over the
 * props, so a page never swaps a French title for an English one.
 */
const SEOHead = ({
  path,
  title,
  description,
  ogImage,
  ogType = "website",
  jsonLd,
}: SEOHeadProps) => {
  const { locale } = useLocale();
  const basePath = stripLocalePrefix(path);
  const dynamic = useRouterState({ select: (s) => dynamicSeo(s.matches) });

  useEffect(() => {
    const seo = seoForPath(addLocalePrefix(basePath, locale), dynamic);
    const effectiveTitle = seo.curated ? seo.title : title || seo.title;
    const effectiveDescription = seo.curated
      ? seo.description
      : description || seo.description;

    document.title = effectiveTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("name", "description", effectiveDescription);
    setMeta("property", "og:title", effectiveTitle);
    setMeta("property", "og:description", effectiveDescription);
    setMeta("name", "twitter:title", effectiveTitle);
    setMeta("name", "twitter:description", effectiveDescription);
    setMeta("property", "og:url", seo.canonical);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:locale", seo.ogLocale);
    setMeta("property", "og:image", ogImage || DEFAULT_OG_IMAGE);
    setMeta("name", "twitter:image", ogImage || DEFAULT_OG_IMAGE);

    document
      .querySelectorAll(
        'link[rel="alternate"][hreflang], link[rel="canonical"]',
      )
      .forEach((el) => el.remove());
    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = seo.canonical;
    document.head.appendChild(canonical);
    for (const a of seo.alternates) {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = a.hrefLang;
      link.href = a.href;
      document.head.appendChild(link);
    }

    document
      .querySelectorAll('script[data-seo-jsonld="true"]')
      .forEach((el) => el.remove());
    if (jsonLd) {
      for (const block of Array.isArray(jsonLd) ? jsonLd : [jsonLd]) {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-jsonld", "true");
        script.text = JSON.stringify(block);
        document.head.appendChild(script);
      }
    }
    return () => {
      document
        .querySelectorAll('script[data-seo-jsonld="true"]')
        .forEach((el) => el.remove());
    };
  }, [locale, basePath, dynamic, title, description, ogImage, ogType, jsonLd]);

  return null;
};

export default SEOHead;
