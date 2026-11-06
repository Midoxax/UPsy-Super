export type Locale = "en" | "fr" | "ar";

export function normalizeLocale(input: unknown): Locale {
  const v = String(input || "")
    .toLowerCase()
    .slice(0, 2);
  if (v === "en" || v === "ar") return v;
  return "fr";
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}
