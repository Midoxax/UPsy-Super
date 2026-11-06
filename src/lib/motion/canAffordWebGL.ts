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
  // Phones: the scene redraws every frame and drains battery and CPU for a
  // backdrop; the gradient behind it carries the design on small screens.
  if (
    window.matchMedia?.("(max-width: 767px)").matches ||
    window.matchMedia?.("(pointer: coarse)").matches
  )
    return false;
  // Few CPU cores: rendering competes with the page itself.
  if (
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency < 4
  )
    return false;
  // No real GPU: software rendering (SwiftShader, llvmpipe) turns every frame
  // into main-thread work and freezes the page.
  if (softwareRenderer()) return false;

  return true;
}

function softwareRenderer(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return true;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(
      ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "",
    ).toLowerCase();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|software|basic render/.test(renderer);
  } catch {
    return true;
  }
}
