import { useLocale } from "@/contexts/LocaleContext";

/**
 * Database copy in several languages lives in sibling columns: `title`
 * (English), `title_fr`, `title_ar`. Pick the visitor's language and fall back
 * when a translation is missing: Arabic → French → English, French → English,
 * English → French.
 */
export function pickLocalized(
  row: object | null | undefined,
  field: string,
  locale: string,
): string {
  if (!row) return "";
  const get = (k: string) =>
    (row as Record<string, unknown>)[k] as string | null | undefined;
  if (locale === "ar")
    return get(`${field}_ar`) || get(`${field}_fr`) || get(field) || "";
  if (locale === "fr") return get(`${field}_fr`) || get(field) || "";
  return get(field) || get(`${field}_fr`) || "";
}

/** Hook form: `const loc = useLocalizedField(); loc(course, "title")`. */
export function useLocalizedField() {
  const { locale } = useLocale();
  return (row: object | null | undefined, field: string) =>
    pickLocalized(row, field, locale);
}
