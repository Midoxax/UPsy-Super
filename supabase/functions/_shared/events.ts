/**
 * Event publisher for edge functions.
 *
 * The only sanctioned way to publish a platform event. Domain code calls this;
 * it never talks to a CRM, a warehouse or a webhook directly. That indirection
 * is the whole point — swapping an integration becomes a change to one
 * consumer, not to every producer.
 *
 * Usage, inside a domain function:
 *
 *   await publishEvent(supabase, {
 *     name: "booking.confirmed",
 *     subjectId: booking.id,
 *     payload: { specialist_id, scheduled_for, modality: "video" },
 *     actorId: user.id,
 *     idempotencyKey: `booking-confirmed-${booking.id}`,
 *   });
 *
 * Publish in the same transaction as the business change wherever the caller
 * controls one. Outside a transaction, supply an idempotency key so a retry
 * cannot duplicate the event.
 */
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  DEFAULT_ROUTING,
  SUBJECT_TYPES,
  EVENT_NAME_PATTERN,
  type EventConsumer,
  type EventName,
  type EventPayloads,
} from "../../../src/lib/events/catalogue.ts";

export interface PublishOptions<N extends EventName> {
  name: N;
  payload: EventPayloads[N];
  /** The entity this event is about. */
  subjectId?: string;
  /** Who caused it. Defaults to the calling user server-side. */
  actorId?: string;
  /** Ties a chain of events back to one originating action. */
  correlationId?: string;
  /** Present from day one; null until multi-tenancy is switched on. */
  tenantId?: string | null;
  /**
   * Required for at-least-once producers. With it, a retry returns the original
   * event rather than creating a duplicate.
   */
  idempotencyKey?: string;
  /** Overrides DEFAULT_ROUTING. Rarely needed; prefer changing the catalogue. */
  consumers?: readonly EventConsumer[];
}

export interface PublishResult {
  eventId: string | null;
  /** False when publishing failed. Never throws — see below. */
  ok: boolean;
  error?: string;
}

/**
 * Publishes an event.
 *
 * Never throws. A failed publish must not roll back a booking that genuinely
 * happened or fail a payment that genuinely cleared — the business outcome is
 * more important than its notification. Failures are returned and logged so a
 * reconciliation job can detect the gap, which is the correct trade for an
 * outbox whose consumers are all non-critical-path.
 *
 * If a future consumer ever becomes critical-path, that consumer should block
 * on its own delivery row rather than this call changing behaviour.
 */
export async function publishEvent<N extends EventName>(
  supabase: SupabaseClient,
  options: PublishOptions<N>,
): Promise<PublishResult> {
  const { name, payload, subjectId, actorId, correlationId, tenantId, idempotencyKey } = options;

  const subjectType = SUBJECT_TYPES[name];
  if (!subjectType) {
    // An unknown name means the catalogue was not updated — a programming
    // error, surfaced loudly rather than written as an orphan event nobody
    // consumes.
    const error = `Unknown event "${name}". Add it to src/lib/events/catalogue.ts first.`;
    console.error("[events]", error);
    return { eventId: null, ok: false, error };
  }
  if (!EVENT_NAME_PATTERN.test(name)) {
    const error = `Event name "${name}" is not domain.action`;
    console.error("[events]", error);
    return { eventId: null, ok: false, error };
  }

  const consumers = options.consumers ?? DEFAULT_ROUTING[name] ?? [];

  try {
    const { data, error } = await supabase.rpc("publish_event", {
      p_event_type: name,
      p_subject_type: subjectType,
      p_subject_id: subjectId ?? null,
      p_payload: payload ?? {},
      p_tenant_id: tenantId ?? null,
      p_actor_id: actorId ?? null,
      p_correlation_id: correlationId ?? null,
      p_idempotency_key: idempotencyKey ?? null,
      p_consumers: consumers as string[],
    });

    if (error) {
      console.error("[events] publish failed", { name, error: error.message });
      return { eventId: null, ok: false, error: error.message };
    }
    return { eventId: data as string, ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[events] publish threw", { name, message });
    return { eventId: null, ok: false, error: message };
  }
}
