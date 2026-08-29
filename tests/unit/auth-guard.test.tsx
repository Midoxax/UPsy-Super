/**
 * Route authorization.
 *
 * The highest-consequence logic in the product: a mistake here exposes one
 * patient's clinical data to another account. Postgres RLS is the real
 * enforcement boundary and these guards are only the UX layer in front of it —
 * but a guard that fails open still shows a dashboard shell to someone who
 * should never have reached it, and still leaks the existence of records.
 *
 * Each case below is written as an access-control assertion rather than a
 * rendering one: who gets through, who is redirected, and what happens in the
 * indeterminate window before roles have loaded.
 *
 * The guard reaches the router only through `@/lib/router-compat` (the shim
 * left in place by the TanStack migration), so that one module is stubbed
 * instead of mounting a real router: the subject under test is the decision,
 * not the navigation machinery.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const authState = vi.hoisted(() => ({ user: null as unknown, loading: false }));
const roleState = vi.hoisted(() => ({ roles: [] as string[], isAdmin: false, loading: false }));
const locationState = vi.hoisted(() => ({ pathname: "/dashboard/specialist", search: "" }));

vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => authState }));
vi.mock("@/hooks/useUserRole", () => ({ useUserRole: () => roleState }));
vi.mock("@/lib/router-compat", () => ({
  // Rendering the target makes the redirect observable and, unlike a spy,
  // also proves the guard stopped rendering its children.
  Navigate: ({ to }: { to: string }) => <div>NAVIGATE:{to}</div>,
  useLocation: () => locationState,
  useNavigate: () => vi.fn(),
}));

function renderGuard(role?: string | string[], at = "/dashboard/specialist") {
  locationState.pathname = at;
  locationState.search = "";
  return render(
    <ProtectedRoute role={role as never}>
      <div>PROTECTED CONTENT</div>
    </ProtectedRoute>
  );
}

const shows = (t: string) => screen.queryByText(t) !== null;
/** The path the guard redirected to, or null when it did not redirect. */
const navigatedTo = (): string | null =>
  screen.queryByText(/^NAVIGATE:/)?.textContent?.replace("NAVIGATE:", "") ?? null;

beforeEach(() => {
  authState.user = null;
  authState.loading = false;
  roleState.roles = [];
  roleState.isAdmin = false;
  roleState.loading = false;
});

describe("unauthenticated access", () => {
  it("redirects an anonymous visitor to login", () => {
    renderGuard();
    expect(shows("PROTECTED CONTENT")).toBe(false);
    expect(navigatedTo()).toMatch(/^\/auth/);
  });

  it("does not render protected content while auth is still resolving", () => {
    // The dangerous window: if the guard treated "loading" as "no user but
    // render anyway", content would flash before the redirect.
    authState.loading = true;
    renderGuard();
    expect(shows("PROTECTED CONTENT")).toBe(false);
    expect(navigatedTo()).toBeNull();
  });
});

describe("authenticated access", () => {
  it("admits a signed-in user when no role is required", () => {
    authState.user = { id: "u1" };
    renderGuard();
    expect(shows("PROTECTED CONTENT")).toBe(true);
  });

  it("admits a user holding the required role", () => {
    authState.user = { id: "u1" };
    roleState.roles = ["psychologist"];
    renderGuard("psychologist");
    expect(shows("PROTECTED CONTENT")).toBe(true);
  });

  it("turns away a signed-in user lacking the required role", () => {
    // The core isolation case: a patient must not reach a specialist surface.
    authState.user = { id: "patient" };
    roleState.roles = ["patient"];
    renderGuard("psychologist");
    expect(shows("PROTECTED CONTENT")).toBe(false);
    expect(navigatedTo()).toBe("/dashboard");
  });

  it("admits an admin to a role-gated surface", () => {
    authState.user = { id: "admin" };
    roleState.isAdmin = true;
    roleState.roles = [];
    renderGuard("psychologist");
    expect(shows("PROTECTED CONTENT")).toBe(true);
  });

  it("accepts any one of several allowed roles", () => {
    authState.user = { id: "u1" };
    roleState.roles = ["organization"];
    renderGuard(["psychologist", "organization"]);
    expect(shows("PROTECTED CONTENT")).toBe(true);
  });

  it("holds in a loading state while roles resolve, rather than deciding early", () => {
    // The subtle one. With roles not yet loaded, a guard that skips the
    // roleLoading wait evaluates `roles.includes(...)` against an empty array,
    // decides "no access", and redirects — bouncing a legitimate specialist to
    // the generic dashboard for a moment before their role arrives.
    //
    // Asserting only that PROTECTED CONTENT is hidden cannot detect that: it
    // is hidden either way. The distinguishing signal is whether we redirected
    // or are still waiting. Verified by mutation — removing the roleLoading
    // wait fails this test.
    authState.user = { id: "u1" };
    roleState.loading = true;
    roleState.roles = [];
    renderGuard("psychologist");
    expect(shows("PROTECTED CONTENT")).toBe(false);
    expect(navigatedTo()).toBeNull();
  });
});

describe("post-login redirect", () => {
  it("preserves the attempted path so login can return the user to it", () => {
    renderGuard(undefined, "/dashboard/specialist");
    expect(navigatedTo()).toBe(`/auth?redirect=${encodeURIComponent("/dashboard/specialist")}`);
  });

  it("does not build a redirect loop back to /auth", () => {
    renderGuard(undefined, "/auth");
    // Guard must not send /auth -> /auth?redirect=/auth.
    expect(navigatedTo()).toBe("/auth");
  });
});
