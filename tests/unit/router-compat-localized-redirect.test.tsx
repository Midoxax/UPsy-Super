/**
 * A guard's redirect keeps the page's language. An unprefixed target from a
 * /fr page used to be rewritten by LocaleContext mid-redirect, and the guard
 * and the rewrite then looped until the tab ran out of memory (specialists
 * and admins without two-step sign-in, sent to /auth/mfa-setup).
 */
import { it, expect, describe } from "vitest";
import { render, waitFor } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { Navigate, localizeRedirect } from "@/lib/router-compat";

describe("localizeRedirect", () => {
  it("adds the current language to an unprefixed target", () => {
    expect(
      localizeRedirect(
        "/auth/mfa-setup?redirect=%2Ffr%2Fmy-space",
        "/fr/my-space",
      ),
    ).toBe("/fr/auth/mfa-setup?redirect=%2Ffr%2Fmy-space");
    expect(localizeRedirect("/admin", "/ar/my-space")).toBe("/ar/admin");
    expect(localizeRedirect("/", "/fr/admin")).toBe("/fr");
  });
  it("leaves English pages, prefixed targets and other URLs alone", () => {
    expect(localizeRedirect("/admin", "/my-space")).toBe("/admin");
    expect(localizeRedirect("/fr/admin", "/ar/x")).toBe("/fr/admin");
    expect(localizeRedirect("https://example.com/x", "/fr/x")).toBe(
      "https://example.com/x",
    );
    expect(localizeRedirect("//evil.example", "/fr/x")).toBe("//evil.example");
  });
});

it("redirects from a French page straight to the French target", async () => {
  const root = createRootRoute({ component: () => <Outlet /> });
  const guarded = createRoute({
    getParentRoute: () => root,
    path: "/fr/my-space",
    component: () => (
      <Navigate to="/auth/mfa-setup?redirect=%2Ffr%2Fmy-space" replace />
    ),
  });
  const setup = createRoute({
    getParentRoute: () => root,
    path: "/fr/auth/mfa-setup",
    component: () => <div>setup</div>,
  });
  const router = createRouter({
    routeTree: root.addChildren([guarded, setup]),
    history: createMemoryHistory({ initialEntries: ["/fr/my-space"] }),
  });

  render(<RouterProvider router={router} />);

  await waitFor(() =>
    expect(router.state.location.pathname).toBe("/fr/auth/mfa-setup"),
  );
  expect(router.state.location.href).toBe(
    "/fr/auth/mfa-setup?redirect=%2Ffr%2Fmy-space",
  );
});
