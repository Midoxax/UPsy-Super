# 8 — Security & compliance

U.Psy holds clinical records. The binding regimes are **GDPR** (EU users and
EU-hosted data) and **Moroccan Law 09-08** (local operation). **HIPAA** does
not apply automatically to a Moroccan operation — it matters only if U.Psy
serves US covered entities. It is treated here as a target standard, not a
current obligation, and the runbook says where GDPR and 09-08 are the ones that
actually bite.

Longer form: `docs/runbooks/01-compliance-and-audit.md`.

## Data classification

| Tier | Contents | Handling |
|------|----------|----------|
| **Clinical** | session notes, intake/anamnesis, journals, screening scores, crisis flags | Encrypted at rest. Never leaves the Supabase boundary. Never to an LLM, analytics, log line, error report, or URL. Every access audited. |
| **Personal** | names, contact details, bookings, invoices, consent records | RLS scoped to the owner. Staff access role-gated and audited. Minimised in exports. |
| **Operational** | ops tasks, app logs, funnel events, experiment assignments | Staff-only. No direct personal identifiers. |
| **Public** | directory listings, published content, blog, pricing | Narrow `TO anon` SELECT with explicit safe-column projection. |

`docs/data-classification.md` maps this onto specific tables.

## Privacy tiers and access model

| Tier | Can see |
|------|---------|
| Client | only their own records |
| Specialist | only clients assigned to them, and only for the duration of the engagement |
| Assistant | operational metadata; never clinical free text |
| Admin | everything, and every look is logged |

Enforced by RLS policies scoped to `auth.uid()` and by
`has_role(auth.uid(), '<role>')` for staff tiers. Roles live in `user_roles`,
never on a profile — a role column on a user-editable row is a privilege
escalation waiting to be found.

Notable hardening already in place: patient phone/email hidden from
specialists until assignment, `certificate_verifications` no longer exposes
recipient names publicly, `org_pulse_responses` gives org owners aggregates
only so anonymity holds, gamification tables locked to self-writes, and
`ops_workspaces` creation restricted.

## Audit trail

`audit_log`: who, what record, what action, when, from where. Written by
database triggers so no application path can bypass it. An immutability trigger
rejects UPDATE and DELETE. Retention **six years**. Readable by admins only.

Never add an application insert path, a purge job, or an "archive" that moves
rows out. Corrections are appended, not edited.

`src/lib/compliance/auditAccess.ts` is the read helper; `AuditTrail.tsx` is the
admin surface with filtering and CSV export.

## Data-subject requests

`dsr_submit()` handles export, correction and deletion requests. Every step is
logged for six years. Deletion is honoured except where a legal retention
obligation overrides it (invoices, audit records) — in that case the response
must say which records are retained and on what basis, rather than silently
keeping them.

Consent receipts live on the CRM contact record: per funnel, per campaign, per
newsletter opt-in, with evidence fields and timestamps.
`crm_consent_evidence()` is the manager-only RPC that produces an auditable
export.

Every form that collects personal data carries the Law 09-08 privacy notice.
This is not optional and it is not a footer link.

## Secrets

- Server secrets have no `VITE_` prefix and are read inside handlers.
- `scripts/check-env-safety.mjs` fails CI if a server-only name is reachable
  from client code. Do not weaken it to unblock a build.
- The secret-scanning step in `security-scan.yml` runs daily and on PR.
- Rotation: create → set → deploy → verify → revoke. Never revoke first.
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. It is used only for genuinely
  privileged work — Auth Admin calls, verified webhook writes, maintenance —
  never as the default read client, and never to decide whether the caller is
  an admin.

## Subprocessors — DPA checklist

HIPAA and GDPR are contract questions before they are code questions.

| Subprocessor | Role | Agreement needed |
|--------------|------|------------------|
| Cloudflare | hosting, edge | DPA + SCCs |
| Supabase | database, auth, storage | DPA + SCCs; EU region |
| Resend | transactional email | DPA |
| Google (OAuth, Maps, Analytics) | identity, mapping, analytics | DPA; confirm no clinical data in scope |
| AI provider (currently Lovable gateway) | inference | DPA; **confirm no training on submitted data** |
| Video (Jitsi) | sessions | DPA or self-host |
| GitHub | source control | DPA |

Keep signed copies in one place and record the signature date. An unsigned DPA
with a live data flow is the finding an auditor opens with.

## AI and clinical data

The AI features (`ai-assistant`, `generate-clinical-brief`, `session-summary`,
`journal-synthesize`, `crisis-screening`, `recommend`, the OPS director) call an
external gateway. The rules:

- Clinical free text is not sent unless the specific feature requires it, the
  user has consented, and the provider contract forbids training on it.
- Never send identifiers alongside clinical content.
- The crisis protocol (SOS Amitié Maroc) must trigger deterministically, not at
  the model's discretion.
- Log the fact of a call, never the payload.

## Incident runbook

1. **Contain.** Revoke the implicated credential, disable the affected route or
   feature flag, or roll back (`rollback.yml`).
2. **Assess.** What data, whose, how many, over what window. Query `audit_log`
   and `app_logs` — this is what they are for.
3. **Preserve.** Snapshot logs and the database state before remediating.
4. **Notify.** GDPR: supervisory authority within 72 hours of becoming aware if
   there is a risk to individuals; affected individuals without undue delay if
   the risk is high. Law 09-08: notify the CNDP. Do not let the 72 hours be
   consumed by internal debate.
5. **Remediate and record.** Fix, then write the post-mortem: timeline, root
   cause, what prevented earlier detection, what changes so it cannot recur.

## Standing security work

- Review the 157 `SECURITY DEFINER` warnings: each must justify definer rights
  and set `search_path = public`.
- Remediate the 102 baselined migration-safety violations, most sensitive
  tables first.
- Quarterly: access review (who still needs admin), secret rotation, dependency
  audit, restore drill.
