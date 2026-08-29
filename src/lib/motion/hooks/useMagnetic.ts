import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { SPRING } from "../tokens";
import { useReducedMotionSafe } from "./useReducedMotionSafe";

/**
 * Magnetic pointer attraction for premium CTAs.
 * Disabled for reduced motion or touch devices.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>(strength = 0.3) {
  const ref = useRef<T>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING.magnetic);
  const sy = useSpring(y, SPRING.magnetic);
  const reduced = useReducedMotionSafe();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      x.set((e.clientX - (r.left + r.width / 2)) * strength);
      y.set((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => { x.set(0); y.set(0); };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength, reduced, x, y]);

  return { ref, x: sx, y: sy };
}