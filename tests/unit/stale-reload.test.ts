/** Recovery after a deploy: reload again on a later deploy, never loop. */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { reloadOnce, isChunkLoadError } from "@/lib/staleReload";

describe("reloadOnce", () => {
  beforeEach(() => {
    sessionStorage.clear();
    Object.defineProperty(window, "location", {
      value: { reload: vi.fn() },
      writable: true,
    });
  });

  it("reloads, refuses a second time within a minute, reloads again later", () => {
    const t = 1_000_000;
    expect(reloadOnce("k", t)).toBe(true);
    expect(reloadOnce("k", t + 30_000)).toBe(false);
    // The old once-per-session guard left the tab stuck here, at the next deploy.
    expect(reloadOnce("k", t + 61_000)).toBe(true);
    expect(window.location.reload).toHaveBeenCalledTimes(2);
  });
});

describe("isChunkLoadError", () => {
  it("recognises missing-chunk errors across browsers", () => {
    for (const m of [
      "Failed to fetch dynamically imported module: https://upsy.ma/assets/x.js",
      "Importing a module script failed.",
      "error loading dynamically imported module",
      "Unable to preload CSS for /assets/a.css",
    ])
      expect(isChunkLoadError(new Error(m))).toBe(true);
    expect(
      isChunkLoadError(new Error("Cannot read properties of undefined")),
    ).toBe(false);
  });
});
