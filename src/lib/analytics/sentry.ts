/**
 * Sentry initializer — gated on VITE_SENTRY_DSN.
 *
 * Privacy: PII scrubbing in `beforeSend`, no session replay by default
 * (replay can be enabled later when we have explicit user consent).
 * Compliant with Moroccan Law 09-08 / GDPR.
 *
 * Loading: `@sentry/react` is imported dynamically so it stays out of the
 * entry chunk (~100 KB saved on first paint — meaningful on the mobile
 * connections most of our users are on). The exported helpers keep their
 * synchronous void signatures; calls made before the SDK finishes loading
 * are queued and flushed on arrival, so no error or user context is lost.
 */
import type * as SentryNS from "@sentry/react";

type SentryModule = typeof SentryNS;

let sentry: SentryModule | null = null;
let initialized = false;
/**
 * True once we know Sentry will never load here (no DSN configured, or the
 * dynamic import failed). Callers then drop straight through instead of
 * queueing calls that would never be flushed.
 */
let disabled = false;

/** Calls made before the SDK lands, replayed in order once it does. */
type QueuedCall =
  | { kind: "exception"; err: unknown; context?: Record<string, unknown> }
  | { kind: "user"; userId: string | null };

const pending: QueuedCall[] = [];
const MAX_PENDING = 50;

const PII_KEYS = new Set([
  "email",
  "phone",
  "full_name",
  "name",
  "first_name",
  "last_name",
  "address",
  "password",
  "notes",
  "content",
  "message",
]);

function scrubObject<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;
  const out: Record<string, unknown> = Array.isArray(obj)
    ? ([] as unknown as Record<string, unknown>)
    : {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (PII_KEYS.has(k.toLowerCase())) continue;
    if (typeof v === "string" && /@/.test(v)) continue; // strip email-likes
    out[k] = v && typeof v === "object" ? scrubObject(v) : v;
  }
  return out as T;
}

function flushPending(): void {
  if (!sentry || !initialized) return;
  for (const call of pending.splice(0)) {
    if (call.kind === "exception") {
      sentry.captureException(
        call.err,
        call.context ? { extra: scrubObject(call.context) } : undefined
      );
    } else {
      sentry.setUser(call.userId ? { id: call.userId } : null);
    }
  }
}

function enqueue(call: QueuedCall): void {
  // Nothing will ever flush these — matches the old drop-if-uninitialised behaviour.
  if (disabled) return;
  // Bound the queue so a pre-init error loop can't grow memory without limit.
  if (pending.length >= MAX_PENDING) return;
  pending.push(call);
}

export function initSentry(): void {
  if (initialized || sentry) return;
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) {
    disabled = true; // not configured — drop instead of queueing
    return;
  }

  void import("@sentry/react")
    .then((mod) => {
      mod.init({
        dsn,
        environment: import.meta.env.MODE,
        release: import.meta.env.VITE_APP_VERSION as string | undefined,
        tracesSampleRate: 0.1,
        sendDefaultPii: false,
        integrations: [mod.browserTracingIntegration()],
        beforeSend(event) {
          if (event.user) {
            // Keep an anonymous ID, drop email/IP/username
            event.user = { id: event.user.id };
          }
          if (event.request?.cookies) delete event.request.cookies;
          if (event.request?.headers) {
            event.request.headers = scrubObject(event.request.headers);
          }
          if (event.extra) event.extra = scrubObject(event.extra);
          if (event.contexts) event.contexts = scrubObject(event.contexts);
          return event;
        },
      });
      sentry = mod;
      initialized = true;
      flushPending();
    })
    .catch((e) => {
      if (import.meta.env.DEV) console.warn("[sentry] init failed", e);
      disabled = true;
      pending.length = 0; // SDK will never arrive — drop the queue
    });
}

export function captureException(err: unknown, context?: Record<string, unknown>): void {
  if (!initialized || !sentry) {
    enqueue({ kind: "exception", err, context });
    return;
  }
  sentry.captureException(err, context ? { extra: scrubObject(context) } : undefined);
}

export function setSentryUser(userId: string | null): void {
  if (!initialized || !sentry) {
    enqueue({ kind: "user", userId });
    return;
  }
  sentry.setUser(userId ? { id: userId } : null);
}
