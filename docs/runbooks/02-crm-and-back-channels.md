# Phase 2 — CRM & Back Channels

Today the app has several parallel funnels — growth leads, proposal requests,
intake forms, quiz results, bookings, specialist applications — each with its own
table and its own notion of "a person". This phase unifies them behind one
contact model and one server-side outbound path.

## Part 1 — The CRM data model

### `crm_contacts` — one row per human, ever

```sql
CREATE TABLE public.crm_contacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid,                       -- set once they register; null for leads
  email         citext NOT NULL,
  full_name     text,
  phone         text,
  locale        text DEFAULT 'fr',
  country       text,
  contact_type  text NOT NULL,              -- client | specialist | org_contact | press
  lifecycle     text NOT NULL DEFAULT 'lead', -- lead | qualified | active | churned
  source        text,                       -- organic | quiz | campaign:<slug> | referral
  first_touch   jsonb,                      -- utm set at first contact
  data_class    text NOT NULL DEFAULT 'C2',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email)
);

GRANT SELECT, INSERT, UPDATE ON public.crm_contacts TO authenticated;
GRANT ALL ON public.crm_contacts TO service_role;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage contacts" ON public.crm_contacts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own contact record" ON public.crm_contacts
  FOR SELECT TO authenticated USING (user_id = auth.uid());
```

### `crm_organisations`

B2B counterparty: name, sector, size, billing details, primary contact, contract
state. Links to `crm_contacts` many-to-one.

### `crm_deals`

```
id, contact_id, organisation_id, pipeline, stage, value_mad, currency,
expected_close, owner_id, lost_reason, created_at, updated_at
```

Pipelines to define: `b2c_first_session`, `b2b_program`, `specialist_onboarding`,
`training_enrolment`. Stages per pipeline, stored in a small `crm_stages` lookup
so they are editable without a migration.

### `crm_activities` — the timeline

```
id, contact_id, deal_id, kind, subject, body, occurred_at, actor_id, metadata
```
`kind`: `email_sent`, `email_opened`, `form_submitted`, `quiz_completed`,
`booking_created`, `session_held`, `call_logged`, `note`, `invoice_sent`,
`payment_received`. Everything the platform does to or with a person lands here.

### `crm_consents` — the gate on all marketing

```sql
CREATE TABLE public.crm_consents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id   uuid NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  purpose      text NOT NULL,   -- newsletter | product_updates | research | b2b_outreach
  granted      boolean NOT NULL,
  basis        text NOT NULL,   -- consent | contract | legitimate_interest
  evidence     jsonb NOT NULL,  -- {form, url, ip, ts, wording_version}
  recorded_at  timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz
);
```

**Rule:** no marketing send happens without a matching `granted = true` row for
that purpose. The evidence blob must include the exact wording version shown, or
you cannot defend the consent later.

### Migration of existing funnels

Backfill `crm_contacts` from `growth_leads`, `proposal_requests`, intake
submissions, and `profiles`, deduplicating on lowercased email. Keep the source
tables — they stay the record of the specific submission; the CRM row is the
identity that ties them together via `crm_activities`.

## Part 2 — Back channels

**Principle: the browser never talks to a third party.** No pixels firing
directly with PII, no client-side Resend calls, no analytics receiving names.
Everything outbound goes through the server, is logged, and is consent-checked.

### The event bus

```sql
CREATE TABLE public.event_outbox (
  id            bigserial PRIMARY KEY,
  event_type    text NOT NULL,
  payload       jsonb NOT NULL,
  contact_id    uuid,
  status        text NOT NULL DEFAULT 'pending', -- pending|sent|failed|skipped
  attempts      int NOT NULL DEFAULT 0,
  last_error    text,
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz
);
GRANT ALL ON public.event_outbox TO service_role;
ALTER TABLE public.event_outbox ENABLE ROW LEVEL SECURITY;
-- no authenticated policy: server-side only
```

Flow:

```text
browser  ──POST──▶  createServerFn  ──▶  event_outbox row
                          │
                          └──▶ crm_activities row (always)

pg_cron ─every 1m─▶ /api/public/outbox/drain
                          │  consent check per event
                          ├──▶ Resend        (email)
                          ├──▶ analytics     (server-side, no PII)
                          ├──▶ WhatsApp API  (when live)
                          └──▶ audit_log entry per dispatch
```

Why an outbox and not direct calls: retries are free, a vendor outage never loses
an event, every send is auditable, and consent is enforced in exactly one place.

### The drain endpoint

`src/routes/api/public/outbox/drain.ts` — a TanStack server route (not an edge
function), authenticated with the cron secret header, batch size ~50, exponential
backoff on `attempts`, and `status = 'skipped'` with a reason when consent is
missing. Skipped is a normal outcome, not an error.

### Consent check, in one function

```ts
// src/lib/crm/consent.server.ts
export async function mayContact(contactId: string, purpose: string) {
  // latest crm_consents row for (contact, purpose), granted && !withdrawn_at
  // transactional purposes (booking confirmation, invoice) bypass:
  //   basis = 'contract', no opt-in required, still logged
}
```
Every dispatcher calls it. No exceptions, no inline checks elsewhere.

### Retiring client-side third parties

Audit and move server-side:
```bash
rg -n "gtag|dataLayer|posthog|fetch\(['\"]https://" src/ | rg -v "supabase|localhost"
```
GTM and PostHog stay for page-level behaviour but must never receive email,
phone, name, or any clinical signal. Identify users by an opaque `contact_id`,
never by email hash.

## Part 3 — The admin CRM surface

`/admin/crm`, admin-gated:

- Contacts list with filters (type, lifecycle, source, consent state) and CSV
  export — reuse `src/lib/admin/csv.ts`.
- Contact detail: identity, consent state, full activity timeline, linked deals,
  bookings, invoices.
- Pipeline board per pipeline, drag between stages, writing a `crm_activities`
  row on every move.
- Every view respects Phase 1's tiers: an admin sees that a session happened,
  never what was said in it.

## Deliverables

- [ ] `crm_contacts`, `crm_organisations`, `crm_deals`, `crm_activities`,
      `crm_consents`, `crm_stages` with GRANTs, RLS, audit triggers
- [ ] Backfill from existing funnel tables
- [ ] `event_outbox` + drain route + cron
- [ ] Single `mayContact()` consent gate, used by every dispatcher
- [ ] No third-party call from the browser carrying PII
- [ ] `/admin/crm` with list, detail, pipeline, export
