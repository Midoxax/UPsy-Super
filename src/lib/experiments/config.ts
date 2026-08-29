/**
 * A/B experiment registry.
 *
 * Client-safe: no server imports, so both the SSR assignment path and the
 * React components can share these definitions.
 *
 * Assignment is sticky per visitor via a first-party cookie and resolved on the
 * server before the first byte of HTML. That matters more than it sounds: if we
 * assigned in a `useEffect`, SSR would emit the control headline and the client
 * would swap it after hydration, so a measurable slice of visitors would see
 * the wrong variant flash — and every one of them would be logged against a
 * variant they only half-saw, which quietly poisons the results.
 */

export const EXPERIMENT_COOKIE_PREFIX = "upsy_exp_";

/** 90 days — long enough that a returning visitor stays in the same bucket. */
export const EXPERIMENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

export type ExperimentDefinition = {
  id: string;
  /** Variant keys. The first entry is the control and the SSR fallback. */
  variants: readonly string[];
};

export const HOME_HERO_EXPERIMENT = {
  id: "home_hero_v1",
  variants: ["control", "clarity", "offer"],
} as const satisfies ExperimentDefinition;

export const EXPERIMENTS = [HOME_HERO_EXPERIMENT] as const;

export type HomeHeroVariant = (typeof HOME_HERO_EXPERIMENT.variants)[number];

/** Every experiment id mapped to its assigned variant for this visitor. */
export type ExperimentAssignments = Record<string, string>;

export function isValidVariant(definition: ExperimentDefinition, value: string | undefined): boolean {
  return !!value && definition.variants.includes(value);
}

/**
 * Even split across variants. Uses crypto when available so buckets don't skew
 * on runtimes with a weak Math.random.
 */
export function pickVariant(definition: ExperimentDefinition): string {
  const { variants } = definition;
  const globalCrypto = globalThis.crypto;

  if (globalCrypto?.getRandomValues) {
    const buf = new Uint32Array(1);
    // Reject the unevenly-distributed tail so the split stays exactly even.
    const limit = Math.floor(0xffffffff / variants.length) * variants.length;
    let value = 0xffffffff;
    do {
      globalCrypto.getRandomValues(buf);
      value = buf[0]!;
    } while (value >= limit);
    return variants[value % variants.length]!;
  }

  return variants[Math.floor(Math.random() * variants.length)]!;
}

/** Control assignment, used for SSR fallback and for bots/prefetch paths. */
export function controlAssignments(): ExperimentAssignments {
  return Object.fromEntries(EXPERIMENTS.map((e) => [e.id, e.variants[0]]));
}
