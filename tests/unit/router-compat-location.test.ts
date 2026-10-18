/**
 * router-compat useLocation returns react-router's shape: `search` starts
 * with "?" and `hash` with "#". TanStack's `searchStr` already carries the
 * "?" and its `hash` has none; the shim used to prepend a second "?", so
 * every consumer saw "??mode=signup" and the first query key came out as
 * "?mode" (Auth ignored ?mode=signup, ProtectedRoute and the locale switch
 * rebuilt URLs with "??").
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const loc = vi.hoisted(() => ({
  pathname: "/auth",
  searchStr: "",
  hash: "",
  state: null as unknown,
}));

vi.mock("@tanstack/react-router", () => ({
  useLocation: () => loc,
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
  useRouter: vi.fn(),
  Link: () => null,
  Navigate: () => null,
  Outlet: () => null,
}));

import { useLocation } from "@/lib/router-compat";

beforeEach(() => {
  loc.pathname = "/auth";
  loc.searchStr = "";
  loc.hash = "";
});

describe("router-compat useLocation", () => {
  it("keeps a single leading ? on search", () => {
    loc.searchStr = "?mode=signup&email=coach%40club.ma";
    const { result } = renderHook(() => useLocation());
    expect(result.current.search).toBe("?mode=signup&email=coach%40club.ma");
    const params = new URLSearchParams(result.current.search);
    expect(params.get("mode")).toBe("signup");
    expect(params.get("email")).toBe("coach@club.ma");
  });

  it("adds the ? when the router omits it", () => {
    loc.searchStr = "redirect=%2Fdashboard";
    const { result } = renderHook(() => useLocation());
    expect(result.current.search).toBe("?redirect=%2Fdashboard");
  });

  it("returns an empty search when there is no query", () => {
    const { result } = renderHook(() => useLocation());
    expect(result.current.search).toBe("");
  });

  it("prefixes hash with #", () => {
    loc.hash = "pricing";
    const { result } = renderHook(() => useLocation());
    expect(result.current.hash).toBe("#pricing");
  });

  it("rebuilds a path with query and hash intact", () => {
    loc.pathname = "/dashboard";
    loc.searchStr = "?tab=sessions";
    loc.hash = "next";
    const { result } = renderHook(() => useLocation());
    const { pathname, search, hash } = result.current;
    expect(pathname + search + hash).toBe("/dashboard?tab=sessions#next");
  });
});
