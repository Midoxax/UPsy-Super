// Per-locale message registry.
//
// English ships in the main bundle because it is both the default locale and
// the fallback for every missing key. The other locales are separate chunks,
// fetched on demand: the full translation table was the largest avoidable
// piece of the homepage's up-front JavaScript, and a visitor only ever reads
// one language.
//
// The server registers every locale up front (src/server.ts) so SSR never
// waits; the client entry (src/client.tsx) loads the URL's locale before
// hydrating, so the first client render matches the server markup.
import en from "./locales/en";
import type { Locale } from "./utils";

export type Messages = Record<string, unknown>;

const loaded: Partial<Record<Locale, Messages>> = { en };

const loaders: Record<Exclude<Locale, "en">, () => Promise<Messages>> = {
  fr: () => import("./locales/fr").then((m) => m.default),
  ar: () => import("./locales/ar").then((m) => m.default),
  ber: () => import("./locales/ber").then((m) => m.default),
};

const pending: Partial<Record<Locale, Promise<void>>> = {};

export function getMessages(locale: Locale): Messages | undefined {
  return loaded[locale];
}

export function englishMessages(): Messages {
  return en;
}

export function isLocaleLoaded(locale: Locale): boolean {
  return loaded[locale] !== undefined;
}

export function loadLocale(locale: Locale): Promise<void> {
  if (loaded[locale]) return Promise.resolve();
  const load = loaders[locale as Exclude<Locale, "en">];
  if (!load) return Promise.resolve();
  pending[locale] ??= load().then(
    (messages) => {
      loaded[locale] = messages;
    },
    (error) => {
      // A failed chunk fetch (offline, stale deploy) must not wedge the
      // locale forever: English stays in place and the next call retries.
      delete pending[locale];
      throw error;
    },
  );
  return pending[locale]!;
}

export function registerLocales(all: Partial<Record<Locale, Messages>>) {
  Object.assign(loaded, all);
}
