/**
 * Events recorded before consent wait in memory and are sent only once
 * PostHog starts (after the visitor accepts analytics). Without consent they
 * never leave the browser.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const ph = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  register: vi.fn(),
  opt_out_capturing: vi.fn(),
}));
vi.mock("posthog-js", () => ({ default: ph }));

beforeEach(() => {
  vi.resetModules();
  Object.values(ph).forEach((f) => f.mockClear());
  vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
  vi.stubEnv("VITE_POSTHOG_HOST", "https://eu.i.posthog.com");
});

describe("PostHog buffering", () => {
  it("holds events and properties until init, then sends them, scrubbed", async () => {
    const m = await import("@/lib/analytics/posthog");
    m.registerProperties({ exp_home_hero_v1: "b" });
    m.captureEvent("experiment_view", {
      experiment_variant: "b",
      email: "x@y.z",
    });
    expect(ph.capture).not.toHaveBeenCalled();

    await m.initPostHog();
    expect(ph.init.mock.calls[0][1].capture_pageview).toBe("history_change");
    expect(ph.register).toHaveBeenCalledWith({ exp_home_hero_v1: "b" });
    expect(ph.capture).toHaveBeenCalledWith("experiment_view", {
      experiment_variant: "b",
    });
  });

  it("sends nothing when PostHog never starts (no consent)", async () => {
    const m = await import("@/lib/analytics/posthog");
    m.captureEvent("cta_click", { cta_label: "x" });
    m.registerProperties({ exp: "a" });
    expect(ph.capture).not.toHaveBeenCalled();
    expect(ph.register).not.toHaveBeenCalled();
  });
});
