import { useEffect, useRef } from "react";

/**
 * Resets the scroll position of a scrollable panel (Dialog/Sheet/Drawer content)
 * back to the top whenever `open` transitions to true, or any extra dep changes
 * (e.g. step index advancing in a multi-step form).
 *
 * Attach the returned ref to the scrollable element (the one with
 * `overflow-y-auto`). Works for DialogContent, SheetContent, Drawer panels, etc.
 *
 * Behavior:
 * - Uses requestAnimationFrame so the reset runs after the panel mounts its
 *   content, avoiding a flash of mid-scroll position.
 * - Honors prefers-reduced-motion by using "auto" rather than smooth scrolling.
 */
export function useScrollResetOnOpen<T extends HTMLElement = HTMLDivElement>(
  open: boolean,
  extraDeps: ReadonlyArray<unknown> = [],
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ...extraDeps]);

  return ref;
}

export default useScrollResetOnOpen;