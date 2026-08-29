/**
 * Host-agnostic security headers.
 *
 * These used to live in `vercel.json`, which meant the whole security posture of
 * the site was a property of one hosting provider. The app now builds to a
 * server bundle (Cloudflare Workers / Node), so the headers are applied by the
 * server entry instead: they survive a host migration, a preview deploy, and
 * `vite preview` identically.
 */

const CONNECT_SRC = [
  "'self'",
  "https://*.supabase.co",
  "wss://*.supabase.co",
  "https://ai.gateway.lovable.dev",
  "https://meet.jit.si",
  "https://*.posthog.com",
  "https://*.i.posthog.com",
  "https://www.googletagmanager.com",
  "https://*.google-analytics.com",
  "https://o4511311085633536.ingest.de.sentry.io",
].join(" ");

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://meet.jit.si https://*.posthog.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https: https://meet.jit.si",
  `connect-src ${CONNECT_SRC}`,
  "frame-src 'self' https://meet.jit.si",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

export const SECURITY_HEADERS: Record<string, string> = {
  "content-security-policy": CSP,
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
  "x-frame-options": "DENY",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy":
    "camera=(self), microphone=(self), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()",
  "x-dns-prefetch-control": "off",
  // Explicitly off: the legacy auditor is a known XSS vector, CSP replaces it.
  "x-xss-protection": "0",
};

/**
 * Applies the headers in place. Existing values win, so a route that
 * deliberately relaxes a header (an embeddable widget, say) is not overridden.
 */
export function applySecurityHeaders(response: Response, url: URL): Response {
  // Dev serves over http on localhost with an HMR socket and eval-heavy
  // tooling; applying the production policy there only produces noise.
  if (import.meta.env.DEV) return response;

  // A response with an immutable header list (some static-asset responses) has
  // to be cloned before it can be annotated.
  let target = response;
  try {
    target.headers.set("x-content-type-options", "nosniff");
  } catch {
    target = new Response(response.body, response);
  }

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (!target.headers.has(key)) target.headers.set(key, value);
  }

  if (url.pathname.startsWith("/api/") && !target.headers.has("cache-control")) {
    target.headers.set("cache-control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  }

  return target;
}
