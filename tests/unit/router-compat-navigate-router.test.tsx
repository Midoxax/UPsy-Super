/**
 * The router-compat <Navigate> carries the query string through a real
 * TanStack router (memory history), so a guard's /auth?redirect=... target
 * arrives intact.
 */
import { it, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

it("keeps the query string when redirecting", async () => {
  const root = createRootRoute({ component: () => <Outlet /> });
  const guarded = createRoute({
    getParentRoute: () => root,
    path: "/my-space",
    component: () => (
      <Navigate to="/auth?redirect=%2Fmy-space%3Fx%3D1" replace />
    ),
  });
  const auth = createRoute({
    getParentRoute: () => root,
    path: "/auth",
    component: () => <div>auth</div>,
  });
  const router = createRouter({
    routeTree: root.addChildren([guarded, auth]),
    history: createMemoryHistory({ initialEntries: ["/my-space?x=1"] }),
  });

  render(<RouterProvider router={router} />);

  await waitFor(() => expect(router.state.location.pathname).toBe("/auth"));
  expect(router.state.location.href).toBe("/auth?redirect=%2Fmy-space%3Fx%3D1");
});
