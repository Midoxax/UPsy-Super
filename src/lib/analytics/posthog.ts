/**
 * PostHog initializer — privacy-first, EU-hosted, optional.
 *
 * Only loads if both VITE_POSTHOG_KEY and VITE_POSTHOG_HOST are set.
 * Cookie-less, IP anonymized — Law 09-08 / GDPR compliant.
 * PII-scrubbing wrapper enforced.
 */

let posthogInstance: any = null;
let initialized = false;

// Events and properties recorded before PostHog is ready (it loads only after
// the visitor accepts analytics, often a few seconds into the visit). They are
// sent once it starts, and dropped if it never does, so nothing leaves the
// browser without consent. The hero experiment's exposure fires on first
// render, before any consent click, and would otherwise be lost every time.
const MAX_PENDING = 50;
const pendingEvents: Array<[string, Record<string, unknown>]> = [];
const pendingProps: Record<string, unknown> = {};

const PII_KEYS = new Set([
  "email",
  "phone",
  "full_name",
  "name",
  "first_name",
  "last_name",
  "address",
  "ip",
  "password",
  "notes",
  "content",
  "message",
]);

function scrub(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (PII_KEYS.has(k.toLowerCase())) continue;
    if (typeof v === "string" && /@/.test(v)) continue; // email-like
    out[k] = v;
  }
  return out;
}

export async function initPostHog(): Promise<void> {
  if (initialized) return;
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  const host = import.meta.env.VITE_POSTHOG_HOST as string | undefined;
  if (!key || !host) return; // silently skip if not configured

  try {
    const mod = await import("posthog-js");
    posthogInstance = mod.default;
    posthogInstance.init(key, {
      api_host: host,
      persistence: "memory", // cookie-less
      disable_session_recording: true,
      autocapture: false,
      // The app changes pages client-side; `true` records only the landing
      // page, so a visit home -> profile -> booking looked like one page.
      capture_pageview: "history_change",
      ip: false, // anonymize IP
      property_blacklist: ["$ip", "$geoip_city_name", "$geoip_postal_code"],
    });
    initialized = true;
    if (Object.keys(pendingProps).length)
      posthogInstance.register(pendingProps);
    for (const [name, props] of pendingEvents.splice(0))
      posthogInstance.capture(name, props);
  } catch (e) {
    if (import.meta.env.DEV) console.warn("[posthog] init failed", e);
  }
}

/** Stops capture after consent is withdrawn (memory persistence: nothing to clear). */
export function optOutPostHog(): void {
  if (!initialized || !posthogInstance) return;
  posthogInstance.opt_out_capturing();
}

export function captureEvent(
  name: string,
  properties: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return; // server render: never buffer
  const clean = scrub(properties);
  if (!initialized || !posthogInstance) {
    if (pendingEvents.length < MAX_PENDING) pendingEvents.push([name, clean]);
    return;
  }
  posthogInstance.capture(name, clean);
}

/**
 * Attach properties to every later event of this visit (PostHog "super
 * properties"), e.g. the experiment variant a visitor saw, so a booking made
 * three pages later can still be credited to that variant.
 */
export function registerProperties(properties: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const clean = scrub(properties);
  if (!initialized || !posthogInstance) {
    Object.assign(pendingProps, clean);
    return;
  }
  posthogInstance.register(clean);
}

export function identifyAnonymous(distinctId: string): void {
  if (!initialized || !posthogInstance) return;
  posthogInstance.identify(distinctId, {});
}
