import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

// jsdom ships no matchMedia. Theme resolution depends on it, so provide a
// controllable stub rather than a permanently-false one — several tests need
// to assert behaviour when the OS reports dark.
export function mockMatchMedia(prefersDark: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const mql = {
    matches: prefersDark,
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.delete(cb),
    addListener: () => {}, removeListener: () => {}, onchange: null,
    dispatchEvent: () => false,
  } as unknown as MediaQueryList;
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mql));
  return {
    /** Simulate the OS theme flipping mid-session. */
    flip(toDark: boolean) {
      (mql as { matches: boolean }).matches = toDark;
      listeners.forEach((cb) => cb({ matches: toDark } as MediaQueryListEvent));
    },
  };
}
