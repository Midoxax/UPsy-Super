import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";

import { pushDataLayer } from "@/lib/analytics/gtm";
import {
  controlAssignments,
  type ExperimentAssignments,
  type ExperimentDefinition,
} from "./config";

/**
 * Read the server-resolved variant for an experiment.
 *
 * Reads the root match's loader data through router state rather than
 * `useLoaderData`, which throws when the match isn't found. A marketing hero
 * must always render, so an experiment that fails to resolve degrades to the
 * control copy instead of blanking the page.
 */
export function useExperimentVariant<T extends string>(definition: ExperimentDefinition): T {
  const assignments = useRouterState({
    select: (state) => {
      const rootLoaderData = state.matches[0]?.loaderData as
        | { experiments?: ExperimentAssignments }
        | undefined;
      return rootLoaderData?.experiments;
    },
  });

  const resolved = assignments ?? controlAssignments();
  const variant = resolved[definition.id] ?? definition.variants[0]!;
  return variant as T;
}

/**
 * Fire a one-time `experiment_view` event so the variant can be joined against
 * conversions in GTM/GA4.
 *
 * Guarded by a ref rather than an empty dep array: React double-invokes effects
 * in dev StrictMode, which would otherwise double-count every exposure.
 */
export function useExperimentExposure(experimentId: string, variant: string): void {
  const fired = useRef<string | null>(null);

  useEffect(() => {
    const key = `${experimentId}:${variant}`;
    if (fired.current === key) return;
    fired.current = key;

    pushDataLayer({
      event: "experiment_view",
      experiment_id: experimentId,
      experiment_variant: variant,
    });
  }, [experimentId, variant]);
}
