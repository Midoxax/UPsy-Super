// Whether this visitor can afford a decorative WebGL scene.

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

type NetworkInfo = { saveData?: boolean; effectiveType?: string };
type CapabilityNavigator = Navigator & {
  connection?: NetworkInfo;
  deviceMemory?: number;
};

/**
 * A Three.js scene costs ~850 KB of JavaScript to render decoration. That is a
 * fair trade on a laptop and a bad one on a mid-range phone over mobile data,
 * where it delays the copy and the CTA the page exists to deliver. So we ask
 * whether this visitor can afford it rather than assuming they can.
 */
export function canAffordWebGL(): boolean {
  if (prefersReducedMotion) return false;
  if (typeof navigator === "undefined") return false;

  const nav = navigator as CapabilityNavigator;

  // Data Saver is an explicit request not to spend the user's bytes.
  if (nav.connection?.saveData) return false;
  // Below 4g, the scene alone is measured in seconds.
  if (nav.connection?.effectiveType && nav.connection.effectiveType !== "4g")
    return false;
  // Low-memory handsets struggle with WebGL even on a good connection.
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4)
    return false;

  return true;
}
