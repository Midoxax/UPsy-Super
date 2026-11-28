import { useEffect, useRef } from "react";
import { stripLocalePrefix } from "@/lib/i18n/utils";

/**
 * ScrollDynamics: the scroll feel of the public pages, applied site-wide.
 *
 * - A thin progress bar at the top of the page follows the scroll.
 * - Each top-level section below the fold rises in when it enters the view,
 *   and the cards of its first grid follow one after another.
 *
 * Content is never hidden before the page has painted: only sections that
 * start below the fold are prepared, after hydration, so nothing above the
 * fold waits for JavaScript. Skipped: app areas (dashboards, forms, portals),
 * sections that animate themselves (framer elements still hidden, or
 * data-no-reveal), print, and visitors who prefer reduced motion.
 */

// App areas where content should stay put.
const APP_AREAS = [
  "/admin",
  "/ai-assistant",
  "/apply",
  "/assessment-lab",
  "/assessments",
  "/auth",
  "/booking",
  "/card",
  "/center",
  "/dashboard",
  "/intake",
  "/invite",
  "/league",
  "/lsspm",
  "/legal",
  "/my-space",
  "/notifications",
  "/ops",
  "/passport",
  "/privacy",
  "/publish-profile",
  "/reset-password",
  "/session",
  "/terms",
  "/unsubscribe",
];

const isAppArea = (pathname: string) => {
  const p = stripLocalePrefix(pathname);
  return APP_AREAS.some((a) => p === a || p.startsWith(a + "/"));
};

export default function ScrollDynamics({ pathname }: { pathname: string }) {
  const bar = useRef<HTMLDivElement>(null);
  const enabled = !isAppArea(pathname);

  // Progress bar.
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = bar.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // Only on pages long enough to be worth a progress bar.
      const visible = max > window.innerHeight * 0.6;
      el.style.opacity = visible ? "1" : "0";
      el.style.transform = `scaleX(${visible ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, pathname]);

  // Section reveals.
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.getElementById("main-content");
    if (!main) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const s = e.target as HTMLElement;
          s.dataset.reveal = "in";
          io.unobserve(s);
          // Once revealed, hand the section back: its own transitions
          // (card hovers) and transforms apply again.
          window.setTimeout(() => {
            s.dataset.reveal = "done";
            s.querySelectorAll<HTMLElement>("[data-reveal-item]").forEach(
              (c) => {
                delete c.dataset.revealItem;
                c.style.removeProperty("--reveal-i");
              },
            );
          }, 1800);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    const prepare = () => {
      if (
        main.closest("[data-no-reveal]") ||
        main.querySelector("[data-no-reveal-page]")
      )
        return;
      const sections = main.querySelectorAll<HTMLElement>(
        "section:not([data-reveal]):not([data-no-reveal])",
      );
      for (const s of sections) {
        if (s.parentElement?.closest("section")) continue; // top-level sections only
        // Already on screen (or above): leave it as it is.
        if (s.getBoundingClientRect().top < window.innerHeight) {
          s.dataset.reveal = "skip";
          continue;
        }
        // Sections that animate themselves.
        if (s.querySelector('[style*="opacity: 0"], [style*="opacity:0"]')) {
          s.dataset.reveal = "skip";
          continue;
        }
        const grid = s.querySelector<HTMLElement>(".grid");
        if (grid && grid.children.length >= 2 && grid.children.length <= 12) {
          Array.from(grid.children).forEach((c, i) => {
            (c as HTMLElement).dataset.revealItem = "";
            (c as HTMLElement).style.setProperty("--reveal-i", String(i));
          });
        }
        s.dataset.reveal = "pending";
        io.observe(s);
      }
    };

    // Route content loads lazily: prepare what is there, then what arrives.
    let frame = 0;
    const schedule = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          prepare();
        });
    };
    schedule();
    const mo = new MutationObserver(schedule);
    mo.observe(main, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, pathname]);

  if (!enabled) return null;
  return (
    <div
      ref={bar}
      aria-hidden="true"
      className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left opacity-0"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
