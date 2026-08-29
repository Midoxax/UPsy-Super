/**
 * PostHog initializer — privacy-first, EU-hosted, optional.
 *
 * Only loads if both VITE_POSTHOG_KEY and VITE_POSTHOG_HOST are set.
 * Cookie-less, IP anonymized — Law 09-08 / GDPR compliant.
 * PII-scrubbing wrapper enforced.
 */

let posthogInstance: any = null;
let initialized = false;

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
      capture_pageview: true,
      ip: false, // anonymize IP
      property_blacklist: ["$ip", "$geoip_city_name", "$geoip_postal_code"],
    });
    initialized = true;
  } catch (e) {
    if (import.meta.env.DEV) console.warn("[posthog] init failed", e);
  }
}

export function captureEvent(name: string, properties: Record<string, unknown> = {}): void {
  if (!initialized || !posthogInstance) return;
  posthogInstance.capture(name, scrub(properties));
}

export function identifyAnonymous(distinctId: string): void {
  if (!initialized || !posthogInstance) return;
  posthogInstance.identify(distinctId, {});
}
