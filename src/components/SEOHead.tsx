import { useEffect } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { stripLocalePrefix } from '@/lib/i18n/utils';
import { SITE_URL, absoluteUrl } from '@/config/site';

interface SEOHeadProps {
  path: string;
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const DEFAULT_TITLE = 'U.Psy — Performance Psychology Platform for Morocco';
const DEFAULT_DESCRIPTION = "Book accredited psychologists worldwide. Video sessions in any timezone, or in-person in select cities. Free rebook if not the right fit.";
const DEFAULT_OG_IMAGE = absoluteUrl('/og-image.jpg');

const SEOHead = ({ path, title, description, ogImage, ogType = 'website', jsonLd }: SEOHeadProps) => {
  const { locale } = useLocale();
  const basePath = stripLocalePrefix(path);
  const baseUrl = SITE_URL;

  useEffect(() => {
    document.documentElement.lang = locale;

    const effectiveTitle = title || DEFAULT_TITLE;
    const effectiveDescription = description || DEFAULT_DESCRIPTION;
    const effectiveOgImage = ogImage || DEFAULT_OG_IMAGE;

    // Title — always set so values don't leak across routes
    document.title = effectiveTitle;

    // Helper to set or create a meta tag
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', effectiveDescription);
    setMeta('property', 'og:description', effectiveDescription);
    setMeta('name', 'twitter:description', effectiveDescription);

    const pageUrl = locale === 'fr' ? `${baseUrl}/fr${basePath}` : locale === 'ar' ? `${baseUrl}/ar${basePath}` : `${baseUrl}${basePath}`;

    setMeta('property', 'og:title', effectiveTitle);
    setMeta('name', 'twitter:title', effectiveTitle);
    setMeta('property', 'og:url', pageUrl);
    setMeta('property', 'og:type', ogType);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('property', 'og:image', effectiveOgImage);
    setMeta('name', 'twitter:image', effectiveOgImage);

    // Remove existing alternate/canonical links
    document.querySelectorAll('link[rel="alternate"]').forEach(el => el.remove());
    document.querySelectorAll('link[rel="canonical"]').forEach(el => el.remove());

    // Canonical
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = pageUrl;
    document.head.appendChild(canonical);

    // Hreflang alternates
    const addAlternate = (hreflang: string, href: string) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = hreflang;
      link.href = href;
      document.head.appendChild(link);
    };
    addAlternate('en', `${baseUrl}${basePath}`);
    addAlternate('fr', `${baseUrl}/fr${basePath}`);
    addAlternate('ar', `${baseUrl}/ar${basePath}`);
    addAlternate('x-default', `${baseUrl}${basePath}`);

    // OG locale
    const ogLocaleContent = locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AR' : 'en_US';
    setMeta('property', 'og:locale', ogLocaleContent);

    document.querySelectorAll('meta[property="og:locale:alternate"]').forEach(el => el.remove());
    const alternateLocales = locale === 'en' ? ['fr_FR', 'ar_AR'] : locale === 'fr' ? ['en_US', 'ar_AR'] : ['en_US', 'fr_FR'];
    alternateLocales.forEach(altLocale => {
      const el = document.createElement('meta');
      el.setAttribute('property', 'og:locale:alternate');
      el.setAttribute('content', altLocale);
      document.head.appendChild(el);
    });

    // Per-route JSON-LD — tag with data attribute so we can clean on unmount
    document.querySelectorAll('script[data-seo-jsonld="true"]').forEach(el => el.remove());
    if (jsonLd) {
      const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      blocks.forEach(block => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-jsonld', 'true');
        script.text = JSON.stringify(block);
        document.head.appendChild(script);
      });
    }

    return () => {
      document.querySelectorAll('script[data-seo-jsonld="true"]').forEach(el => el.remove());
    };
  }, [locale, basePath, title, description, ogImage, ogType, jsonLd]);

  return null;
};

export default SEOHead;
