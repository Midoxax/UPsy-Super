import { CBT_RESOURCES } from "./cbt";
import { SCHEMA_RESOURCES } from "./schema";
import { SKILLS_RESOURCES } from "./skills";
import { SPORT_RESOURCES } from "./sport";
import type { LibLang, LibResource } from "./types";

export type { LibLang, LibResource } from "./types";

export const LIBRARY: LibResource[] = [
  ...CBT_RESOURCES,
  ...SCHEMA_RESOURCES,
  ...SKILLS_RESOURCES,
  ...SPORT_RESOURCES,
];

export const findLibResource = (slug: string) =>
  LIBRARY.find((r) => r.slug === slug);

/** English for English readers; French otherwise (Arabic falls back to French). */
export const libLang = (locale: string): LibLang =>
  locale === "en" ? "en" : "fr";
