/**
 * Google Tag Manager (GTM) integration.
 *
 * The container ID (a public value, not a secret) lives as a constant in
 * src/routes/__root.tsx alongside the loader snippet. This module exposes
 * a lightweight `dataLayer` helper that degrades gracefully if GTM fails
 * to load for any reason (blocked, offline, etc.).
 */

export interface GTMEvent {
  event: string;
  [key: string]: unknown;
}

/**
 * Safely push an event to the GTM dataLayer.
 * No-op if dataLayer is not present (e.g., GTM not configured).
 */
export function pushDataLayer(event: GTMEvent): void {
  if (typeof window === "undefined") return;

  const dataLayer = (window as any).dataLayer;
  if (!Array.isArray(dataLayer)) return;

  dataLayer.push(event);

  if (import.meta.env.DEV) {
    console.debug("[gtm] pushDataLayer", event);
  }
}

/**
 * Track a CTA click.
 */
export function trackCTAClick(
  label: string,
  location: string,
  pagePath: string,
  extra: Record<string, unknown> = {}
): void {
  pushDataLayer({
    event: "cta_click",
    cta_label: label,
    cta_location: location,
    page_path: pagePath,
    ...extra,
  });
}

/**
 * Track the Mental Performance Score start action.
 * @deprecated Prefer trackCTAClick with `cta_action: "score_start"`.
 */
export function trackScoreStart(location: string, pagePath: string): void {
  pushDataLayer({
    event: "score_start",
    cta_label: "Start Free",
    cta_location: location,
    page_path: pagePath,
  });
}

/**
 * Track psychologist booking intent.
 * @deprecated Prefer trackCTAClick with `cta_action: "book_intent"`.
 */
export function trackBookIntent(location: string, pagePath: string): void {
  pushDataLayer({
    event: "book_intent",
    cta_label: "Book a Call",
    cta_location: location,
    page_path: pagePath,
  });
}
