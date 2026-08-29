# Phase 3 — Payments, Auto-Entrepreneur Status & Legal

Money reaches a Moroccan bank account directly. No card processor sits in the
middle, which removes PCI scope but puts reconciliation on you.

> Everything about tax and contracts here needs sign-off from a Moroccan
> accountant and lawyer. The runbook prepares the work; it does not replace the
> review.

## Part 1 — What auto-entrepreneur status allows

Check these against current law with your accountant before building:

- **Revenue ceiling.** The regime caps annual turnover (historically 200 000 MAD
  for services). Exceeding it forces conversion to another structure — the
  platform should track cumulative annual revenue and warn well before the limit.
- **Flat-rate tax** on turnover for services, declared monthly or quarterly via
  the Auto-Entrepreneur portal.
- **No VAT** while under the regime — invoices must therefore carry **no VAT
  line** and must state the exemption.
- **Invoice requirements:** sequential number with no gaps, issue date, your name
  and auto-entrepreneur registration number, ICE, client identity, description,
  amount in MAD, and the exemption mention.
- **Retention:** keep invoices and books for the statutory period (10 years is the
  safe assumption for commercial records).

**The critical constraint:** an auto-entrepreneur invoicing clients for sessions
delivered by *other* psychologists is acting as an intermediary. That is a
different legal and tax relationship than invoicing for your own work. Two clean
models:

- **Model A — Marketplace/agency:** the specialist invoices the client; you invoice
  the specialist a commission. You never hold client funds. Simplest, and it fits
  auto-entrepreneur status.
- **Model B — Principal:** you invoice the client for the session and pay the
  specialist. This makes the session revenue *yours*, consuming your ceiling fast,
  and creates employment-classification risk with specialists.

**Recommendation: Model A**, with the platform generating both documents. Confirm
with the accountant, then encode the choice — it determines every table below.

## Part 2 — Payment flow (bank transfer)

```text
booking confirmed
   ▶ invoice generated (sequential, PDF, emailed)
   ▶ payment instructions: RIB + unique reference  UPSY-2026-000123
   ▶ client transfers
   ▶ statement imported / matched on reference
   ▶ invoice marked paid  ▶ session unlocked / receipt issued
   ▶ (Model A) commission invoice raised to the specialist
```

### Schema

```sql
CREATE TABLE public.invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number          text NOT NULL UNIQUE,          -- UPSY-2026-000123, gapless
  series          text NOT NULL DEFAULT 'UPSY',
  issued_at       date NOT NULL DEFAULT current_date,
  due_at          date,
  contact_id      uuid REFERENCES public.crm_contacts(id),
  organisation_id uuid,
  booking_id      uuid,
  kind            text NOT NULL,                 -- client_session | commission | b2b_program | training
  currency        text NOT NULL DEFAULT 'MAD',
  subtotal_mad    numeric(12,2) NOT NULL,
  vat_mad         numeric(12,2) NOT NULL DEFAULT 0,   -- 0 under the regime
  total_mad       numeric(12,2) NOT NULL,
  status          text NOT NULL DEFAULT 'issued', -- issued|paid|partially_paid|void
  payment_ref     text NOT NULL UNIQUE,           -- what the client puts on the transfer
  pdf_path        text,
  legal_mentions  text NOT NULL,                  -- frozen at issue time
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id    uuid REFERENCES public.invoices(id),
  amount_mad    numeric(12,2) NOT NULL,
  received_at   date NOT NULL,
  method        text NOT NULL DEFAULT 'bank_transfer',
  bank_ref      text,
  matched_by    uuid,             -- null = auto-matched
  matched_at    timestamptz,
  raw_statement jsonb
);
```

GRANTs and RLS: `service_role` full; `authenticated` SELECT only on own invoices
(`contact_id` resolving to `auth.uid()`); admins full via `has_role`. Audit
triggers on both tables (class C3).

### Gapless numbering

A sequence is not enough — a rolled-back transaction leaves a hole, and holes are
a red flag in a tax audit. Allocate the number in a `SECURITY DEFINER` function
that writes a counter row inside the same transaction as the insert, and never
reuse or renumber. Void, never delete: a cancelled invoice becomes `status =
'void'` and keeps its number.

### Reconciliation

Manual first, automated later:
1. Admin uploads the bank statement (CSV) at `/admin/finance/reconcile`.
2. Parser matches on `payment_ref`, falling back to amount + date + name
   similarity, and proposes matches.
3. Admin confirms; a `payments` row is written and the invoice status recalculated.
4. Unmatched transfers go to a review queue — never auto-assigned.

Add an aged-receivables view and an automatic reminder at D+7 and D+14 through the
Phase 2 outbox (transactional basis, no consent needed).

### Specialist payouts (Model A)

`specialist_payouts` already exists in the codebase — extend it to reference the
commission invoice, and produce a monthly statement per specialist: sessions
delivered, gross, commission, net, payment date.

## Part 3 — The contract set

Each document is versioned, published, and acceptance-recorded.

| Document | Signed by | Covers |
|----------|-----------|--------|
| **Client Terms of Service** | Client at signup | Scope, no-emergency clause, cancellation, refunds, liability limits |
| **Privacy Notice (09-08 + GDPR)** | Displayed, acknowledged | Purposes, legal basis, retention, subprocessors, rights, CNDP reference |
| **Informed Consent to Care** | Client before first session | Nature of care, confidentiality and its limits, recording policy, right to withdraw |
| **Specialist Agreement** | Each specialist | Independent-contractor status, accreditation duties, commission, confidentiality, insurance, IP, non-solicitation |
| **Organisation Contract** | B2B clients | Scope, per-seat/per-programme pricing, SLA, data processing, aggregate-only reporting |
| **DPA** | Both directions | You as processor for orgs; vendors as processors for you |
| **Cookie / tracking notice** | Displayed | Aligned with what Phase 2 actually sends |

Storage:

```sql
CREATE TABLE public.legal_documents (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text NOT NULL,          -- client_tos | privacy | consent_care | ...
  version    text NOT NULL,          -- 2026-08-01
  locale     text NOT NULL,          -- fr | en | ar
  body_md    text NOT NULL,
  effective_from date NOT NULL,
  UNIQUE (slug, version, locale)
);

CREATE TABLE public.legal_acceptances (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  uuid NOT NULL,
  document_id uuid NOT NULL REFERENCES public.legal_documents(id),
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip          inet,
  user_agent  text,
  method      text NOT NULL          -- checkbox | signature | click_through
);
```

Rules:
- Never edit a published version. Publish a new one; the old rows keep pointing at
  what the person actually agreed to.
- Re-acceptance is required when a material clause changes; a banner blocks the
  affected flow until accepted.
- All three locales (FR, EN, AR) ship together. FR is the legally controlling
  version for Moroccan clients — say so in the document.
- Surface everything at `/legal`, each document at its own URL, always the current
  version, with an archive of prior ones.

## Part 4 — Disclosures on the site

- Footer: legal name, auto-entrepreneur registration number, ICE, address, contact
  email, CNDP reference.
- Every clinical page: the "not for emergencies" line plus the SOS Amitié Maroc
  number, already used in the crisis protocol.
- Pricing pages: prices in MAD, exemption mention, cancellation terms.
- Specialist pages: accreditation tier explained, and that specialists are
  independent practitioners, not employees.

## Deliverables

- [ ] Accountant confirms Model A vs B and the invoicing structure
- [x] `invoices`, `payments`, `legal_documents`, `legal_acceptances` shipped
- [x] Gapless numbering function + void-never-delete rule
- [ ] Invoice PDF with all mandatory mentions (extend the existing generator)
- [x] `/admin/finance` — issue, reconcile, overdue flags (payout statements pending)
- [x] Revenue-ceiling tracker with an early warning
- [ ] Seven documents drafted, lawyer-reviewed, published in FR/EN/AR
- [ ] Acceptance recorded at every gate
