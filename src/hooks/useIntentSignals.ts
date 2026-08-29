import { useEffect, useRef } from "react";
import {
  useIntentStore,
  persistScrollDepth,
  type UserIntent,
} from "@/stores/intentStore";
import { initTracking, track } from "@/lib/tracking";

const CLASSIFY_DELAY_MS = 4000;
const VALID_INTENTS: UserIntent[] = [
  "EXPLORING",
  "READY_TO_ACT",
  "RESEARCHING",
  "SKEPTICAL",
];

/**
 * useIntentSignals
 *
 * Collects behavioral signals for 4 seconds, classifies intent, locks.
 * Uses data-track-id attributes for click tracking (not text content).
 * Supports ?intent= debug override.
 */
export function useIntentSignals(): void {
  const {
    isLocked,
    sessionId,
    updateSignals,
    classifyAndLock,
    forceIntent,
  } = useIntentStore();
  const startTime = useRef(Date.now());
  const maxScrollDepth = useRef(0);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // ── Initialize tracking ──
    initTracking(sessionId);
    track("page_view", { page: "homepage" });

    // ── Debug override via ?intent= ──
    const params = new URLSearchParams(window.location.search);
    const debugIntent = params.get("intent")?.toUpperCase() as
      | UserIntent
      | undefined;
    if (debugIntent && VALID_INTENTS.includes(debugIntent)) {
      forceIntent(debugIntent);
      track("intent_debug_override", { intent: debugIntent });
      return;
    }

    if (isLocked) return;

    // ── Scroll depth tracking ──
    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const depth = (window.scrollY / scrollHeight) * 100;
      if (depth > maxScrollDepth.current) {
        maxScrollDepth.current = depth;
        updateSignals({ scrollDepthPercent: depth });
      }
    };

    // ── Click tracking via data-track-id ──
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Walk up the DOM to find the nearest data-track-id
      const tracked = target.closest("[data-track-id]");
      let trackId = tracked?.getAttribute("data-track-id") || "";

      // Fallback: read href from nearest link
      if (!trackId) {
        const link = target.closest("a");
        trackId = link?.getAttribute("href") || "";
      }

      if (trackId) {
        const store = useIntentStore.getState();
        updateSignals({
          clickedTargets: [...store.signals.clickedTargets, trackId],
        });
      }
    };

    // ── Dwell time update ──
    const dwellInterval = setInterval(() => {
      updateSignals({ dwellTimeMs: Date.now() - startTime.current });
    }, 1000);

    // ── Attach listeners ──
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("click", handleClick, { passive: true });

    // ── Classification timer ──
    const classifyTimer = setTimeout(() => {
      updateSignals({ dwellTimeMs: Date.now() - startTime.current });
      classifyAndLock();

      const state = useIntentStore.getState();
      track("intent_classified", {
        intent: state.intent,
        confidence: state.confidence,
        signals: { ...state.signals },
      });

      // Log low confidence
      if (state.confidence < 0.3) {
        track("intent_low_confidence", {
          intent: state.intent,
          confidence: state.confidence,
        });
      }

      // Detach after lock
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClick);
      clearInterval(dwellInterval);
    }, CLASSIFY_DELAY_MS);

    // ── Persist on unload ──
    const handleUnload = () => {
      persistScrollDepth(maxScrollDepth.current);
      const state = useIntentStore.getState();
      track(
        "session_end",
        {
          intent: state.intent,
          confidence: state.confidence,
          scrollDepth: maxScrollDepth.current,
          dwellTimeMs: Date.now() - startTime.current,
        },
        false // allow duplicate — always fire on unload
      );
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClick);
      window.removeEventListener("beforeunload", handleUnload);
      clearInterval(dwellInterval);
      clearTimeout(classifyTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
