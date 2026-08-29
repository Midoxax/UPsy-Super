/**
 * Localization resolution.
 *
 * These lock down the contract that failed in production: t() used to return
 * the key itself on a miss, so `t("x") || "Default"` — the form used at 326 of
 * 404 call sites — could never reach its fallback, because a key is truthy.
 * That is how the literal string "pricing.heroTitle" ended up rendered as a
 * page heading.
 *
 * The rule under test: requested locale → English → empty string.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocaleProvider, useLocale } from "@/contexts/LocaleContext";

// The provider loads DB overrides on mount; keep tests offline and
// deterministic by stubbing the query to resolve empty.
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
  },
}));

// The provider reaches the router only through the compat shim; stubbing it
// keeps these tests about locale resolution rather than router setup.
const locationState = vi.hoisted(() => ({ pathname: "/", search: "", hash: "" }));
vi.mock("@/lib/router-compat", () => ({
  useLocation: () => locationState,
  useNavigate: () => vi.fn(),
}));

function Probe({ k }: { k: string }) {
  const { t } = useLocale();
  // Deliberately the real call-site shape, not just t(k).
  return <span data-testid="out">{t(k) || "INLINE_DEFAULT"}</span>;
}

function renderAt(path: string, key: string) {
  locationState.pathname = path;
  locationState.search = "";
  locationState.hash = "";
  return render(
    <LocaleProvider>
      <Probe k={key} />
    </LocaleProvider>
  );
}

// The provider writes an `lng` cookie on first visit and prefers it over the
// URL on every later mount. jsdom keeps document.cookie for the whole file, so
// without this each test would inherit the previous test's language.
beforeEach(() => {
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (name) document.cookie = `${name}=; Max-Age=0; path=/`;
  }
  document.documentElement.dir = "ltr";
});

const out = () => screen.getByTestId("out").textContent;


describe("t() resolution", () => {
  beforeEach(() => localStorage.clear());

  it("returns the translation for the active locale", () => {
    renderAt("/", "nav.home");
    expect(out()).toBe("Home");
  });

  it("returns French copy under /fr", () => {
    renderAt("/fr", "nav.home");
    expect(out()).not.toBe("Home");
    expect(out()).not.toBe("INLINE_DEFAULT");
    expect(out()!.length).toBeGreaterThan(0);
  });

  it("never renders the key itself when a translation is missing", () => {
    // The exact regression: a missing key must not reach the user as an
    // identifier. This is the assertion that would have caught /pricing.
    renderAt("/", "definitely.not.a.real.key");
    expect(out()).not.toBe("definitely.not.a.real.key");
  });

  it("falls through to the inline default on a total miss", () => {
    renderAt("/", "definitely.not.a.real.key");
    expect(out()).toBe("INLINE_DEFAULT");
  });

  it("falls back to English rather than emptiness when only the locale is missing", () => {
    // A key present in English but absent in Arabic should show English copy,
    // not blank space and not an identifier.
    renderAt("/ar", "nav.home");
    expect(out()).not.toBe("INLINE_DEFAULT");
    expect(out()!.trim().length).toBeGreaterThan(0);
  });

  it("returns a falsy value for a miss, so `||` chains work at all", () => {
    // Guards the property the 326 call sites depend on. If someone
    // "helpfully" restores key-returning, this fails loudly.
    renderAt("/", "another.missing.key");
    expect(out()).toBe("INLINE_DEFAULT");
  });
});

describe("RTL", () => {
  it("sets dir=rtl on the document for Arabic and not for English", async () => {
    renderAt("/ar", "nav.home");
    // LocaleProvider drives document direction; assert the real side effect
    // rather than an internal, since layout mirroring depends on it.
    await vi.waitFor(() => expect(document.documentElement.dir).toBe("rtl"));
  });

  it("leaves direction ltr for French", async () => {
    renderAt("/fr", "nav.home");
    await vi.waitFor(() => expect(document.documentElement.dir).not.toBe("rtl"));
  });
});
