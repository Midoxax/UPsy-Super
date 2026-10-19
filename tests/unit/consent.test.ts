/**
 * Analytics must not start before the visitor accepts.
 *
 * GTM is loaded by window.__upsyLoadGTM (defined by the inline bootstrap in
 * __root.tsx) and PostHog by initPostHog(); both must stay untouched until
 * the stored choice is "granted", and a later "denied" must switch them off.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const posthog = vi.hoisted(() => ({
  initPostHog: vi.fn(async () => {}),
  optOutPostHog: vi.fn(),
}));
vi.mock("@/lib/analytics/posthog", () => posthog);

import {
  CONSENT_KEY,
  applyConsent,
  getConsent,
  setConsent,
} from "@/lib/consent";

type W = Window & {
  __upsyLoadGTM?: () => void;
  gtag?: (...a: unknown[]) => void;
};
const w = window as W;

beforeEach(() => {
  localStorage.clear();
  posthog.initPostHog.mockClear();
  posthog.optOutPostHog.mockClear();
  w.__upsyLoadGTM = vi.fn();
  w.gtag = vi.fn();
});

describe("analytics consent", () => {
  it("loads nothing while the visitor has not chosen", () => {
    expect(getConsent()).toBeNull();
    applyConsent();
    expect(w.__upsyLoadGTM).not.toHaveBeenCalled();
    expect(posthog.initPostHog).not.toHaveBeenCalled();
  });

  it("loads nothing after a refusal", () => {
    setConsent("denied");
    expect(localStorage.getItem(CONSENT_KEY)).toBe("denied");
    expect(w.__upsyLoadGTM).not.toHaveBeenCalled();
    expect(posthog.initPostHog).not.toHaveBeenCalled();
  });

  it("starts GTM and PostHog on acceptance, and on later visits", () => {
    setConsent("granted");
    expect(w.__upsyLoadGTM).toHaveBeenCalledTimes(1);
    expect(posthog.initPostHog).toHaveBeenCalledTimes(1);

    applyConsent(); // next page load reads the stored choice
    expect(posthog.initPostHog).toHaveBeenCalledTimes(2);
  });

  it("switches analytics off when consent is withdrawn", () => {
    setConsent("granted");
    setConsent("denied");
    expect(posthog.optOutPostHog).toHaveBeenCalled();
    expect(w.gtag).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: "denied",
    });
  });

  it("ignores unknown stored values", () => {
    localStorage.setItem(CONSENT_KEY, "yes");
    expect(getConsent()).toBeNull();
  });
});
