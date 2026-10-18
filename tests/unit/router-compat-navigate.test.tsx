/**
 * <Navigate> must navigate once per target.
 *
 * Guards such as ProtectedRoute re-render while auth state settles, handing
 * <Navigate> a fresh props object each time. TanStack's own <Navigate>
 * re-navigates on every props change; on @tanstack/react-router 1.170.45 that
 * restarted the router load on each render, so the redirect never committed
 * and the page locked up. The shim navigates once per `to` instead.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { useEffect, useRef } from "react";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  useLocation: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
  useRouter: vi.fn(),
  Link: () => null,
  Outlet: () => null,
  // Mirrors TanStack's <Navigate>: navigate whenever the props object changes.
  Navigate: (props: unknown) => {
    const prev = useRef<unknown>(null);
    useEffect(() => {
      if (prev.current !== props) {
        navigate(props);
        prev.current = props;
      }
    });
    return null;
  },
}));

import { Navigate } from "@/lib/router-compat";

beforeEach(() => navigate.mockClear());

describe("router-compat <Navigate>", () => {
  it("navigates once when the parent keeps re-rendering", () => {
    const { rerender } = render(
      <Navigate to="/auth?redirect=%2Fdashboard" replace />,
    );
    for (let i = 0; i < 5; i++) {
      rerender(<Navigate to="/auth?redirect=%2Fdashboard" replace />);
    }

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith({
      to: "/auth",
      search: { redirect: "/dashboard" },
      hash: undefined,
      state: undefined,
      replace: true,
    });
  });

  it("navigates again when the target changes", () => {
    const { rerender } = render(<Navigate to="/auth" replace />);
    rerender(<Navigate to="/dashboard" replace />);

    expect(navigate).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenLastCalledWith(
      expect.objectContaining({ to: "/dashboard" }),
    );
  });
});
