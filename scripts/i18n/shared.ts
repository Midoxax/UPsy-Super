// Shared by the i18n audit and translate scripts.
import en from "../../src/lib/i18n/locales/en";
import fr from "../../src/lib/i18n/locales/fr";
import ar from "../../src/lib/i18n/locales/ar";

export const TARGETS = { fr, ar } as const;
export type Target = keyof typeof TARGETS;
export const ENGLISH = en;

/** Flatten a nested message tree to dotted keys; only string leaves count. */
export function flatten(
  tree: unknown,
  prefix = "",
  out: Record<string, string> = {},
) {
  for (const [key, value] of Object.entries(tree as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value))
      flatten(value, path, out);
    else if (typeof value === "string") out[path] = value;
  }
  return out;
}

/** English keys a locale has no text for, hand-written or machine. */
export function missingKeys(target: Target): string[] {
  const have = flatten(TARGETS[target]);
  return Object.keys(flatten(ENGLISH)).filter((k) => !(k in have));
}
