import { useEffect } from 'react';
import { useLocale } from '@/contexts/LocaleContext';

interface BlogArticleSchemaProps {
  title: string;
  description: string;
  slug: string;
  datePublished?: string;
  dateModified?: string;
  category?: string;
  readTimeMinutes?: number;
}

const BlogArticleSchema = ({
  title,
  description,
  slug,
  datePublished = '2025-01-15',
  dateModified,
  category = 'Mental Health',
  readTimeMinutes = 5,
}: BlogArticleSchemaProps) => {
  const { locale } = useLocale();
  const baseUrl = 'https://upsy.ma';
  const localePath = locale === 'en' ? '' : `/${locale}`;
  const articleUrl = `${baseUrl}${localePath}/blog/${slug}`;
  const wordCount = readTimeMinutes * 200;

  useEffect(() => {
    const scriptId = `article-schema-${slug}`;
    const breadcrumbScriptId = `breadcrumb-schema-${slug}`;
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();
    const existingBreadcrumb = document.getElementById(breadcrumbScriptId);
    if (existingBreadcrumb) existingBreadcrumb.remove();

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      url: articleUrl,
      datePublished,
      dateModified: dateModified || datePublished,
      wordCount,
      inLanguage: locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-MA' : 'en-US',
      author: {
        '@type': 'Organization',
        name: 'U.Psy',
        url: baseUrl,
      },
      publisher: {
        '@type': 'Organization',
        name: 'U.Psy',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/__l5e/assets-v1/2edf1a4b-29b9-4195-8a74-121993b46fe3/upsy-logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': articleUrl,
      },
      articleSection: category,
      isAccessibleForFree: true,
    };

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    const blogUrl = `${baseUrl}${localePath}/blog`;
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${baseUrl}${localePath || '/'}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: blogUrl,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: title,
          item: articleUrl,
        },
      ],
    };

    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.id = breadcrumbScriptId;
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
      const bEl = document.getElementById(breadcrumbScriptId);
      if (bEl) bEl.remove();
    };
  }, [title, description, slug, locale, localePath, articleUrl, datePublished, dateModified, wordCount, category]);

  return null;
};

export default BlogArticleSchema;
