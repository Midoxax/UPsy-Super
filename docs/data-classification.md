# Data classification — U.Psy

Input to every RLS review, every DPA, and the CNDP file. Classes follow
`docs/runbooks/01-compliance-and-audit.md`.

| Class | Meaning | Rules |
|-------|---------|-------|
| **C1 Clinical** | Health data, special category | Owner + treating specialist only; admins see metadata, never content; never used for marketing; 6-year retention |
| **C2 Identity** | Identifies a person | RLS to owner + counterparty; minimised in every projection |
| **C3 Commercial** | Business / marketing | Consent-gated before any outreach |
| **C4 Operational** | System | No PII in payloads |

## Audited tables

`AFTER INSERT/UPDATE/DELETE` triggers write to `public.audit_log` via
`public.fn_audit(class, subject_column)`. The log stores **changed field names
only** — never values — so clinical content cannot be reconstructed from it.

| Table | Class | Subject column |
|-------|-------|----------------|
| session_notes | C1 | client_id |
| client_anamneses | C1 | user_id |
| journal_entries | C1 | user_id |
| mood_entries | C1 | user_id |
| assessment_results | C1 | user_id |
| crisis_alerts | C1 | user_id |
| intake_clinical_briefs | C1 | — |
| treatment_plans | C1 | client_id |
| discharge_summaries | C1 | client_id |
| homework_assignments | C1 | client_id |
| readiness_checkins | C1 | user_id |
| profiles | C2 | id |
| bookings | C2 | patient_id |
| documents | C2 | user_id |
| payment_transactions | C2 | patient_id |
| psychologist_applications | C2 | user_id |
| organization_members | C2 | — |
| user_roles | C2 | user_id |
| crm_contacts | C3 | user_id |
| crm_consents | C3 | — |

Other tables are C3 (leads, growth_leads, quiz scores, campaign events,
coupons, courses) or C4 (audit_log, edge_rate_limits, email_send_log,
platform_events, provisioning_attempts). `survey_responses` is **anonymised
C3**: it deliberately holds no link back to a person — the anonymity wall.

## Reads

Postgres has no SELECT trigger, so clinical reads are logged by the
application through `logSensitiveAccess()`
(`src/lib/compliance/auditAccess.ts` → `public.log_sensitive_access` RPC),
recorded as `action = 'select_sensitive'`.

Any new surface that displays another person's C1 data must call it. Grep
check before shipping a clinical view:

```bash
rg -n "session_notes|client_anamneses|treatment_plans" src --glob '!*.test.*'
```

## Privacy tiers

| Tier | Sees | Never sees |
|------|------|------------|
| Client | Own records only | Anyone else's anything |
| Specialist | C1/C2 for their own patients, while a care relationship exists | Other specialists' patients |
| Assistant | C2 scheduling fields | C1 content, financials |
| Admin | C2 metadata, C3, C4, the audit log | C1 content |

Enforcement: every policy is `TO authenticated` and goes through
`public.has_role()`; specialist access is relationship-scoped (a booking or
care assignment), never role-scoped.

## Retention

- `audit_log`: 6 years, then deleted by `public.purge_expired_audit_log()`
  on the monthly `purge-audit-log` cron. Append-only — no UPDATE/DELETE grant
  exists and `trg_audit_log_immutable` rejects both.
- Clinical records under a legal retention duty are **restricted**, not
  deleted, on an erasure request. Record the exception in the request's notes.

## Data-subject rights

`public.data_subject_requests` registers access / rectification / erasure /
portability / restriction / objection requests with a 30-day due date, worked
from `/admin/audit`. `public.privacy_preferences.processing_restricted` is the
flag every marketing query must honour.
