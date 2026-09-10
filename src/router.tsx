import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// TanStack Router's default search codec JSON-encodes every value, so the
// plain string "1" round-trips as '"1"' (?book=%221%22) instead of "1"
// (?book=1). The whole app treats search params as plain strings (see
// router-compat's useSearchParams, built on URLSearchParams), so parse/
// stringify search the same way react-router-dom always did.
function parseSearch(searchStr: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(searchStr));
}

function stringifySearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const key in search) {
    const value = search[key];
    if (value === undefined) continue;
    params.set(key, String(value));
  }
  const str = params.toString();
  return str ? `?${str}` : "";
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    parseSearch,
    stringifySearch,
  });

  return router;
};
