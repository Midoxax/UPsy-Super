/**
 * UPsy Event Tracking System
 *
 * Provider-agnostic event bus with deduplication.
 * Buffers events internally for future integration with
 * PostHog, Mixpanel, or any analytics provider.
 */

export interface TrackingEvent {
  name: string;
  payload: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
}

// ─── Internal State ───
const eventBuffer: TrackingEvent[] = [];
const firedKeys = new Set<string>();
let sessionId = "";

/**
 * Initialize the tracking system with a session ID.
 */
export function initTracking(sid: string): void {
  sessionId = sid;
}

/**
 * Generate a deduplication key for an event.
 * Events with the same name + payload fire only once.
 */
function dedupeKey(name: string, payload: Record<string, unknown>): string {
  // For high-cardinality events (timestamps vary), only dedupe on name + stable keys
  const stablePayload: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (k !== "timestamp" && k !== "dwellTimeMs") {
      stablePayload[k] = v;
    }
  }
  return `${name}::${JSON.stringify(stablePayload)}`;
}

/**
 * Track an event. Duplicate events (same name + stable payload) are silently skipped.
 * @param deduplicate - if true (default), prevents duplicate events. Set false for events that should repeat.
 */
export function track(
  name: string,
  payload: Record<string, unknown> = {},
  deduplicate = true
): void {
  if (deduplicate) {
    const key = dedupeKey(name, payload);
    if (firedKeys.has(key)) return;
    firedKeys.add(key);
  }

  const event: TrackingEvent = {
    name,
    payload,
    timestamp: Date.now(),
    sessionId,
  };
  eventBuffer.push(event);

  if (import.meta.env.DEV) {
    console.debug(`[track] ${name}`, payload);
  }
}

/**
 * Get all buffered events (read-only).
 */
export function getEventBuffer(): ReadonlyArray<TrackingEvent> {
  return eventBuffer;
}

/**
 * Flush buffer (for sending to external provider).
 */
export function flushEventBuffer(): TrackingEvent[] {
  return eventBuffer.splice(0);
}

/**
 * Reset deduplication (for testing or new sessions).
 */
export function resetDeduplication(): void {
  firedKeys.clear();
}
