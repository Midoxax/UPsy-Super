/**
 * Router-compat shim — bridges react-router-dom v6 call sites to
 * @tanstack/react-router without hand-rewriting every component.
 * This is the same load-bearing pattern used in Klar's dev-copy migration.
 */
import {
  useNavigate as tsNavigate,
  useLocation as tsLocation,
  useParams as tsParams,
  useSearch as tsSearch,
  useRouter,
  Link as TSLink,
  Navigate as TSNavigate,
  Outlet as TSOutlet,
} from "@tanstack/react-router";
import {
  useMemo,
  useCallback,
  forwardRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { addLocalePrefix, getLocaleFromPath } from "@/lib/i18n/utils";

// ---------- shared URL parsing ----------

function parseTo(to: string): {
  pathname: string;
  search?: Record<string, string>;
  hash?: string;
} {
  const [beforeHash, hashStr] = (to ?? "").split("#");
  const [pathname, searchStr] = beforeHash.split("?");
  return {
    // react-router keeps the current path for search-only ("?a=1") and
    // hash-only ("#section") targets; TanStack's "." means current route.
    pathname: pathname || ".",
    search: searchStr
      ? Object.fromEntries(new URLSearchParams(searchStr))
      : undefined,
    hash: hashStr || undefined,
  };
}

// ---------- useNavigate ----------

type NavigateOptions = { replace?: boolean; state?: unknown };

type NavigateFn = {
  (to: string | number, options?: NavigateOptions): void;
  (delta: number): void;
};

export function useNavigate(): NavigateFn {
  const tsNav = tsNavigate();
  const router = useRouter();
  return useCallback(
    (to: string | number, options?: NavigateOptions) => {
      if (typeof to === "number") {
        router.history.go(to);
        return;
      }
      const { pathname, search, hash } = parseTo(to);
      tsNav({
        to: pathname,
        search: search as never,
        hash,
        state: options?.state as never,
        replace: options?.replace,
      });
    },
    [tsNav, router],
  ) as NavigateFn;
}

// ---------- useLocation ----------

function withPrefix(prefix: string, value: string | undefined): string {
  if (!value) return "";
  return value.startsWith(prefix) ? value : prefix + value;
}

export function useLocation() {
  const loc = tsLocation();
  return useMemo(
    () => ({
      pathname: loc.pathname,
      // react-router shape: search starts with "?", hash with "#". TanStack's
      // searchStr already carries the "?" and its hash has no "#".
      search: withPrefix("?", loc.searchStr),
      hash: withPrefix("#", loc.hash),
      state: (loc.state ?? null) as unknown,
      key: loc.pathname + (loc.searchStr ?? ""),
    }),
    [loc.pathname, loc.searchStr, loc.hash, loc.state],
  );
}

// ---------- useParams ----------

export function useParams<
  T extends Record<string, string | undefined> = Record<
    string,
    string | undefined
  >,
>(): T {
  return tsParams({ strict: false } as never) as T;
}

// ---------- useSearchParams (react-router-dom compat) ----------

export function useSearchParams(): [
  URLSearchParams,
  (
    init:
      | URLSearchParams
      | Record<string, string>
      | ((prev: URLSearchParams) => URLSearchParams),
    opts?: { replace?: boolean },
  ) => void,
] {
  const loc = tsLocation();
  const nav = tsNavigate();
  const router = useRouter();
  const params = useMemo(
    () => new URLSearchParams(loc.searchStr ?? ""),
    [loc.searchStr],
  );
  const setParams = useCallback(
    (
      init:
        | URLSearchParams
        | Record<string, string>
        | ((prev: URLSearchParams) => URLSearchParams),
      opts?: { replace?: boolean },
    ) => {
      // Functional updaters read the router's live location, not the render
      // snapshot — react-router passes call-time params, and chained updates
      // within one tick must see each other's writes.
      const live = router.state.location;
      const current = new URLSearchParams(live.searchStr ?? "");
      const next =
        typeof init === "function"
          ? init(current)
          : init instanceof URLSearchParams
            ? init
            : new URLSearchParams(init);
      const searchObj: Record<string, string> = {};
      next.forEach((v, k) => {
        searchObj[k] = v;
      });
      nav({
        to: live.pathname,
        search: searchObj as never,
        replace: opts?.replace,
      });
    },
    [nav, router],
  );
  return [params, setParams];
}

// ---------- Link ----------

type LinkProps = Omit<ComponentProps<typeof TSLink>, "to"> & {
  to: string;
  replace?: boolean;
  state?: unknown;
  children?: ReactNode;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, replace, state, children, ...rest },
  ref,
) {
  const { pathname, search, hash } = parseTo(to);
  return (
    <TSLink
      ref={ref as never}
      to={pathname as never}
      search={search as never}
      hash={hash}
      replace={replace}
      state={state as never}
      {...((rest ?? {}) as Record<string, unknown>)}
    >
      {children}
    </TSLink>
  );
});

// ---------- Navigate ----------

/**
 * A redirect to an unprefixed path ("/auth/mfa-setup", "/admin") from a page
 * in another language keeps that language: "/fr/my-space" → "/fr/auth/...".
 * Without this, LocaleContext rewrites the unprefixed target to the prefixed
 * one while the first redirect is still loading; the guard that issued it
 * re-renders and redirects again, and the two loop until the tab runs out of
 * memory (every specialist and admin without two-step sign-in hit this).
 */
export function localizeRedirect(to: string, currentPathname: string): string {
  if (!to.startsWith("/") || to.startsWith("//")) return to;
  const current = getLocaleFromPath(currentPathname);
  if (current === "en" || getLocaleFromPath(to) !== "en") return to;
  return addLocalePrefix(to, current);
}

export function Navigate({
  to,
  replace,
  state,
}: {
  to: string;
  replace?: boolean;
  state?: unknown;
}) {
  // Navigate once per target. TanStack's <Navigate> navigates again whenever
  // its props object changes, and a parent that keeps re-rendering (an auth
  // guard waiting on state) would hand it a new object every render: each
  // navigation restarts the router load, which re-renders, which navigates
  // again, so the redirect never commits and the main thread spins.
  // Memoizing the element keeps the same props object until the target
  // changes. `state` is left out of the key on purpose: call sites build it
  // inline, and it only matters for the first navigation to a target.
  const { pathname: currentPathname } = tsLocation();
  const target = localizeRedirect(to, currentPathname);
  return useMemo(() => {
    const { pathname, search, hash } = parseTo(target);
    return (
      <TSNavigate
        to={pathname as never}
        search={search as never}
        hash={hash}
        state={state as never}
        replace={replace}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, replace]);
}

// ---------- Outlet ----------

export const Outlet = TSOutlet;

// ---------- NavLink (minimal) ----------

export const NavLink = Link;
