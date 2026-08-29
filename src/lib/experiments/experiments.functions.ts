import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import {
  EXPERIMENT_COOKIE_MAX_AGE,
  EXPERIMENT_COOKIE_PREFIX,
  EXPERIMENTS,
  HOME_HERO_EXPERIMENT,
  isValidVariant,
  pickVariant,
  type ExperimentAssignments,
} from "./config";

type HomeHeroWinnerResult = {
  status?: string;
  winning_variant?: string;
};

/**
 * If a variant has been promoted (manually or by the auto-promote job), the
 * experiment is over: every visitor is served the winner, ignoring their cookie
 * bucket. Returns null while the test is still inconclusive.
 */
async function promotedWinner(): Promise<string | null> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data } = (await supabase.rpc("home_hero_winner").maybeSingle()) as {
    data: HomeHeroWinnerResult | null;
  };
  if (data?.status === "winner" && HOME_HERO_EXPERIMENT.variants.includes(data.winning_variant as never)) {
    return data.winning_variant!;
  }
  return null;
}

/**
 * Resolve this visitor's variant for every registered experiment.
 *
 * Called from the root route loader, so during SSR it runs in-process (no extra
 * round trip) and its result is serialised into the hydration payload. The
 * client therefore renders the identical variant it was served, with no flash
 * and no hydration mismatch.
 *
 * Assignment is written back as a first-party cookie so the visitor stays in
 * the same bucket across sessions — otherwise a returning visitor could be
 * counted in two arms and the conversion numbers would be meaningless.
 */
export const resolveExperiments = createServerFn({ method: "GET" }).handler(
  async (): Promise<ExperimentAssignments> => {
    const { getCookie, setCookie } = await import("@tanstack/react-start/server");

    const assignments: ExperimentAssignments = {};

    // If a winner has been promoted, the experiment is decided: serve it to
    // everyone and skip bucketing so returning visitors also see the winner.
    const winner = await promotedWinner();
    if (winner) {
      for (const experiment of EXPERIMENTS) {
        assignments[experiment.id] = experiment.id === HOME_HERO_EXPERIMENT.id ? winner : experiment.variants[0]!;
      }
      return assignments;
    }

    for (const experiment of EXPERIMENTS) {
      const cookieName = `${EXPERIMENT_COOKIE_PREFIX}${experiment.id}`;
      const existing = getCookie(cookieName);

      if (isValidVariant(experiment, existing)) {
        // Already bucketed. Don't re-set the cookie: refreshing max-age on every
        // request would keep a visitor alive in the test indefinitely.
        assignments[experiment.id] = existing!;
        continue;
      }

      const variant = pickVariant(experiment);
      assignments[experiment.id] = variant;

      setCookie(cookieName, variant, {
        maxAge: EXPERIMENT_COOKIE_MAX_AGE,
        path: "/",
        sameSite: "lax",
        // Readable by client analytics; carries no personal data, just a bucket.
        httpOnly: false,
        secure: process.env["NODE_ENV"] === "production",
      });
    }

    return assignments;
  },
);
