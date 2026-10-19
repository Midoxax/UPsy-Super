/**
 * Analytics consent.
 *
 * Nothing optional runs before the visitor chooses: Google Tag Manager is
 * not even fetched (see CONSENT_BOOTSTRAP in src/routes/__root.tsx) and
 * PostHog is not initialised. Error reporting (Sentry) is not gated: it is
 * needed to keep the service working and is scrubbed of personal data.
 *
 * The choice lives in localStorage, per browser. It is re-asked when
 * CONSENT_KEY changes (bump the version if what we ask consent for changes).
 */
import { initPostHog, optOutPostHog } from "@/lib/analytics/posthog";

export const CONSENT_KEY = "upsy-consent-v1";
export type ConsentChoice = "granted" | "denied";

const CHANGE_EVENT = "upsy:consent-change";
const OPEN_EVENT = "upsy:consent-open";

type ConsentWindow = Window & {
  __upsyLoadGTM?: () => void;
  gtag?: (...args: unknown[]) => void;
};

export function getConsent(): ConsentChoice | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    // Storage blocked: treat as undecided, so nothing optional loads.
    return null;
  }
}

/** Starts whatever the stored choice allows. Safe to call repeatedly. */
export function applyConsent(choice: ConsentChoice | null = getConsent()) {
  if (typeof window === "undefined") return;
  const w = window as ConsentWindow;
  if (choice === "granted") {
    w.__upsyLoadGTM?.();
    void initPostHog();
  } else if (choice === "denied") {
    // Withdrawal after an earlier "yes": GTM's script cannot be unloaded, so
    // tell its tags consent is gone, and stop PostHog for this page.
    w.gtag?.("consent", "update", { analytics_storage: "denied" });
    optOutPostHog();
  }
}

export function setConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Not persisted; the choice still applies to this page view.
  }
  applyConsent(choice);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: choice }));
}

/** Re-opens the banner (footer "Cookie settings" link). */
export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export const consentEvents = { change: CHANGE_EVENT, open: OPEN_EVENT };
