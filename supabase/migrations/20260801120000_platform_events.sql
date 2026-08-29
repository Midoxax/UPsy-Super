-- Platform event backbone (transactional outbox).
--
-- WHY THIS EXISTS
--
-- Without it, the first time a second system needs to know a booking happened,
-- someone writes a webhook from the booking code to the CRM. Then finance needs
-- revenue, so a nightly script reads the tables directly. Then partners need
-- reporting, so another job runs. Within two years there are dozens of
-- point-to-point integrations, nobody knows which external system depends on
-- which column, and the schema can no longer change without breaking something
-- invisible.
--
-- The rule this table enforces: every business event is published exactly once,
-- here, and every other system is a subscriber. Domain code never learns that a
-- CRM exists — it publishes `booking.confirmed`. Swapping HubSpot for Salesforce
-- becomes one connector rather than forty call sites.
--
-- WHY A TABLE AND NOT A QUEUE
--
-- This is the transactional outbox pattern. The event is written in the same
-- database transaction as the business change it describes, so the two cannot
-- disagree: a rolled-back booking cannot emit `booking.confirmed`, and a
-- committed booking cannot silently fail to. Publishing to an external broker
-- from application code gives up that guarantee — the broker call can succeed
-- while the transaction aborts, or vice versa. A relay drains this table to
-- whatever transport is appropriate later; the correctness boundary stays here.
--
-- This deliberately does NOT introduce Kafka or a managed bus. At current
-- volume a table plus a relay is correct, and the migration path to a broker is
-- to change the relay, not the producers.
--
-- RELATIONSHIP TO audit_log
--
-- Separate concerns, deliberately not merged. audit_log answers "who did what"
-- for compliance and is immutable evidence. platform_events answers "what
-- happened" for integration and is a delivery mechanism with retries and
-- consumer state. Merging them produces a table that is a bad audit trail
-- (mutable, prunable) and a bad event log (carries actor detail consumers do
-- not need).

-- ---------------------------------------------------------------------------
-- Event envelope
-- ---------------------------------------------------------------------------

CREATE TABLE public.platform_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dotted domain.action, e.g. 'booking.confirmed'. The vocabulary is a
  -- published contract; see src/lib/events/catalogue.ts.
  event_type    text        NOT NULL,

  -- Envelope version, independent of payload content. Adding a payload field is
  -- backwards compatible and keeps v1; removing or retyping one is v2, so a
  -- consumer can branch on this rather than guess from shape.
  event_version integer     NOT NULL DEFAULT 1,

  -- What the event is about, e.g. ('booking', <uuid>). Lets a consumer
  -- reconstruct an entity's history without knowing every event type.
  subject_type  text        NOT NULL,
  subject_id    uuid,

  -- Business facts only. Never PHI, never clinical content: this table fans out
  -- to CRMs, warehouses and partner webhooks, so anything placed here should be
  -- assumed to leave the clinical boundary. Reference clinical records by id and
  -- let an authorised consumer fetch them through a governed path.
  payload       jsonb       NOT NULL DEFAULT '{}'::jsonb,

  -- Tenant dimension, present from the first row.
  --
  -- Nullable today because single-tenant rows are legitimate, but the column
  -- exists now on purpose: the approved architecture makes tenancy the most
  -- time-sensitive schema decision, and backfilling a tenant column across a
  -- high-volume event table later is materially harder than adding it here.
  -- This is an extension point, not an implementation of multi-tenancy.
  tenant_id     uuid,

  -- Provenance for debugging and for correlating a chain of events triggered by
  -- one user action. Actor is who caused it; correlation ties the chain.
  actor_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  correlation_id uuid,

  occurred_at   timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now(),

  -- Producer-supplied idempotency key. A retried edge function or a webhook
  -- delivered twice must not create a second event.
  idempotency_key text,

  CONSTRAINT platform_events_type_format
    CHECK (event_type ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'),
  CONSTRAINT platform_events_version_positive
    CHECK (event_version >= 1)
);

COMMENT ON TABLE public.platform_events IS
  'Transactional outbox. Every business event is published here exactly once; all other systems (CRM, warehouse, webhooks, notifications) are subscribers. Never place PHI or clinical content in payload.';

CREATE UNIQUE INDEX platform_events_idempotency
  ON public.platform_events (event_type, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX platform_events_subject      ON public.platform_events (subject_type, subject_id);
CREATE INDEX platform_events_type_time    ON public.platform_events (event_type, occurred_at DESC);
CREATE INDEX platform_events_tenant       ON public.platform_events (tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX platform_events_correlation  ON public.platform_events (correlation_id) WHERE correlation_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Per-consumer delivery state
-- ---------------------------------------------------------------------------
--
-- Delivery state is per consumer, not per event. A CRM outage must not stall
-- the warehouse, and replaying events into a newly added consumer must not
-- re-deliver to existing ones. A status column on platform_events itself cannot
-- express that, which is why this is a separate table.

CREATE TABLE public.platform_event_deliveries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     uuid NOT NULL REFERENCES public.platform_events(id) ON DELETE CASCADE,

  -- Stable consumer name, e.g. 'crm', 'warehouse', 'partner_webhook'.
  consumer     text NOT NULL,

  status       text NOT NULL DEFAULT 'pending',
  attempts     integer NOT NULL DEFAULT 0,
  last_error   text,
  next_attempt_at timestamptz,
  delivered_at timestamptz,

  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT platform_event_deliveries_status
    CHECK (status IN ('pending', 'delivered', 'failed', 'skipped')),
  CONSTRAINT platform_event_deliveries_unique UNIQUE (event_id, consumer)
);

CREATE INDEX platform_event_deliveries_pending
  ON public.platform_event_deliveries (consumer, next_attempt_at)
  WHERE status = 'pending';

COMMENT ON TABLE public.platform_event_deliveries IS
  'Per-consumer delivery state. One row per (event, consumer) so a failing consumer cannot stall the others.';

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
--
-- Consistent with the rest of the platform: authorization is enforced in
-- Postgres, not in client code.
--
-- Deliberately no client-facing INSERT policy. Events assert that a business
-- fact occurred; a browser must never be able to claim one. Producers are edge
-- functions and database triggers running as service_role, which bypasses RLS.

ALTER TABLE public.platform_events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_event_deliveries  ENABLE ROW LEVEL SECURITY;

-- Admins may read the stream for operational debugging. No one may write, and
-- no non-admin may read: payloads describe business activity across all users.
CREATE POLICY "Admins read platform events"
  ON public.platform_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read event deliveries"
  ON public.platform_event_deliveries FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- Publisher
-- ---------------------------------------------------------------------------
--
-- SECURITY DEFINER so domain code and triggers can publish without a blanket
-- INSERT policy existing for clients. Fixed search_path per the project's
-- existing convention, so the function cannot be redirected by a caller-set
-- search_path.

CREATE OR REPLACE FUNCTION public.publish_event(
  p_event_type      text,
  p_subject_type    text,
  p_subject_id      uuid    DEFAULT NULL,
  p_payload         jsonb   DEFAULT '{}'::jsonb,
  p_tenant_id       uuid    DEFAULT NULL,
  p_actor_id        uuid    DEFAULT NULL,
  p_correlation_id  uuid    DEFAULT NULL,
  p_idempotency_key text    DEFAULT NULL,
  p_consumers       text[]  DEFAULT ARRAY['crm', 'warehouse']
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
  v_consumer text;
BEGIN
  INSERT INTO public.platform_events (
    event_type, subject_type, subject_id, payload,
    tenant_id, actor_id, correlation_id, idempotency_key
  )
  VALUES (
    p_event_type, p_subject_type, p_subject_id, COALESCE(p_payload, '{}'::jsonb),
    p_tenant_id, COALESCE(p_actor_id, auth.uid()), p_correlation_id, p_idempotency_key
  )
  -- Idempotent by contract: a retried producer gets the original event back
  -- rather than a duplicate or an error.
  ON CONFLICT (event_type, idempotency_key) WHERE idempotency_key IS NOT NULL
  DO NOTHING
  RETURNING id INTO v_event_id;

  IF v_event_id IS NULL THEN
    SELECT id INTO v_event_id
      FROM public.platform_events
     WHERE event_type = p_event_type
       AND idempotency_key = p_idempotency_key
     LIMIT 1;
    RETURN v_event_id;
  END IF;

  -- Fan out to consumers in the same transaction, so a committed event always
  -- has its delivery rows.
  FOREACH v_consumer IN ARRAY COALESCE(p_consumers, ARRAY[]::text[]) LOOP
    INSERT INTO public.platform_event_deliveries (event_id, consumer, next_attempt_at)
    VALUES (v_event_id, v_consumer, now())
    ON CONFLICT (event_id, consumer) DO NOTHING;
  END LOOP;

  RETURN v_event_id;
END;
$$;

COMMENT ON FUNCTION public.publish_event IS
  'Publishes a business event to the outbox and fans out delivery rows. Call inside the same transaction as the business change. Idempotent when p_idempotency_key is supplied.';

REVOKE ALL ON FUNCTION public.publish_event FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_event TO service_role;
