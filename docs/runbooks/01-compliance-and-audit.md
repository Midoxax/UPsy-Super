# Phase 1 — Compliance, Privacy Tiers & Audit Trail

Do this before adding CRM, payments, or training tables. Every later phase
inherits these decisions.

## Which laws actually bind you

| Regime | Applies when | Status for U.Psy |
|--------|--------------|------------------|
| **Loi 09-08** (Morocco) | Processing personal data in Morocco | **Binding.** CNDP declaration required for health data. |
| **GDPR** | Offering services to people in the EU | **Binding** the moment an EU resident books. |
| **HIPAA** (US) | You are a covered entity or a business associate of one | **Not automatic.** Only if you contract with US healthcare orgs. |

Build to GDPR + 09-08 as the floor. HIPAA-style controls (audit trail, minimum
necessary access, BAAs) are then mostly already satisfied, which is what makes
the US market reachable later. Say "HIPAA-aligned", never "HIPAA-certified" —
there is no such certification.

## Step 1 — Classify every table

Create `docs/data-classification.md` with one row per table:

| Class | Meaning | Examples | Rules |
|-------|---------|----------|-------|
| **C1 Clinical** | Health data, special category | session notes, anamnesis, screenings, journal entries, crisis flags | Encrypted at rest, admin cannot read content, never used for marketing, never leaves the boundary, 6-year retention then destruction |
| **C2 Identity** | Identifies a person | profiles, emails, phones, bookings | RLS to owner + counterparty only, minimised in every projection |
| **C3 Commercial** | Business/marketing | leads, quiz scores, campaign events, org contracts | Consent-gated for marketing use |
| **C4 Operational** | System | audit log, job runs, error traces | No PII in payloads |

Generate the starting list:
```bash
psql "$DB_URL" -c "\dt public.*" > /tmp/tables.txt
```
Then classify each by hand. This document is the input to every RLS review.

## Step 2 — Privacy tiers

Four roles, already backed by `public.user_roles` + `public.has_role()`:

| Tier | Sees | Never sees |
|------|------|------------|
| **Client** | Own records only | Anyone else's anything |
| **Specialist** | C1/C2 for **their own** patients, only while an active care relationship exists | Other specialists' patients; platform-wide data |
| **Assistant** | C2 limited to scheduling fields (name, slot, session type) | C1 clinical content, financials |
| **Admin** | C2 metadata, C3, C4 | **C1 content** — admins see that a note exists, never what it says |

Enforcement rules:

- Every policy is `TO authenticated` and goes through `public.has_role()`
  (SECURITY DEFINER, `search_path = public`) — never a subquery on `user_roles`
  inside the policy, which recurses.
- Specialist access is **relationship-scoped, not role-scoped**: the policy must
  check that a booking or care assignment links the specialist to that patient,
  not merely that the caller has the `psychologist` role.
- Add an `assistant` role to `app_role` if it does not exist yet, and give it
  read-only views rather than base-table access.
- Admin ≠ clinical access. Clinical content stays encrypted with a key the
  application uses per-request; admin dashboards read metadata tables only.

## Step 3 — The audit trail

Six-year, append-only, trigger-written. Application code must not be able to skip
it, so it lives in the database.

```sql
CREATE TABLE public.audit_log (
  id          bigserial PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_id    uuid,                       -- auth.uid() at time of action
  actor_role  text,                       -- resolved role, denormalised
  action      text NOT NULL,              -- INSERT | UPDATE | DELETE | SELECT_SENSITIVE
  table_name  text NOT NULL,
  record_id   text,
  data_class  text NOT NULL,              -- C1..C4 from step 1
  changed     jsonb,                      -- changed KEYS only, never C1 values
  request_ip  inet,
  user_agent  text
);

CREATE INDEX ON public.audit_log (occurred_at DESC);
CREATE INDEX ON public.audit_log (actor_id, occurred_at DESC);
CREATE INDEX ON public.audit_log (table_name, record_id);

GRANT SELECT ON public.audit_log TO authenticated;   -- narrowed by policy below
GRANT INSERT ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Admins read. Nobody updates or deletes: no UPDATE/DELETE policy exists,
-- and no UPDATE/DELETE grant is issued. That is the append-only guarantee.
CREATE POLICY "Admins read audit log" ON public.audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Subjects may read entries about their own records (GDPR art. 15).
CREATE POLICY "Users read own audit entries" ON public.audit_log
  FOR SELECT TO authenticated
  USING (actor_id = auth.uid());
```

The generic trigger:

```sql
CREATE OR REPLACE FUNCTION public.fn_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_class text := TG_ARGV[0];
  v_keys  jsonb;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- keys only; never values for C1
    SELECT jsonb_agg(key) INTO v_keys
    FROM jsonb_each(to_jsonb(NEW))
    WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key;
  END IF;

  INSERT INTO public.audit_log
    (actor_id, actor_role, action, table_name, record_id, data_class, changed)
  VALUES (
    auth.uid(),
    (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE((to_jsonb(NEW) ->> 'id'), (to_jsonb(OLD) ->> 'id')),
    v_class,
    CASE WHEN v_class = 'C1' THEN jsonb_build_object('keys', v_keys) ELSE v_keys END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- attach per table, passing its class
CREATE TRIGGER audit_session_notes
  AFTER INSERT OR UPDATE OR DELETE ON public.session_notes
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit('C1');
```

Attach to every C1 and C2 table. Reads of C1 (a specialist opening a note) are
logged from the server function that decrypts, since Postgres has no SELECT
trigger — that call site writes `action = 'SELECT_SENSITIVE'`.

### Retention

```sql
-- monthly, via pg_cron
DELETE FROM public.audit_log WHERE occurred_at < now() - interval '6 years';
```
Six years matches Moroccan medical-record practice and exceeds GDPR's
"no longer than necessary". Document the number and stick to it.

### Admin-facing view

Add `/admin/audit` (admin-gated) with filters on actor, table, record, and date
range, plus CSV export. "Who accessed what" must be answerable in under a minute
or the audit trail is theatre.

## Step 4 — Encryption

**At rest, column level.** `encrypt-note` / `decrypt-note` edge functions already
exist. Extend the same pattern to anamnesis, journal entries, and screening
free-text. Rules:
- The key lives in secrets, never in the database.
- Rotation: keep a `key_version` column so old rows stay decryptable.
- Losing the key destroys the data. Back it up offline, in two places.

**In transit.** TLS everywhere; HSTS on the host; no PII in URLs, query strings,
logs, or analytics events. Audit with:
```bash
rg -n "console\.log|logger\.(info|debug)" supabase/functions | rg -i "email|phone|note|name"
```

## Step 5 — Subprocessor contracts

Every vendor touching personal data needs a signed DPA (and a BAA if you ever
serve US covered entities). Track them:

| Vendor | Role | Data | DPA | BAA |
|--------|------|------|-----|-----|
| Supabase | Database, auth, storage | C1–C4 | ☐ | ☐ |
| Vercel / Cloudflare | Hosting | C2, C4 | ☐ | ☐ |
| Resend | Email | C2 | ☐ | ☐ |
| AI provider | Inference | C3 only — never C1 | ☐ | ☐ |
| Jitsi / video | Sessions | C1 in transit | ☐ | ☐ |

No signed DPA means that vendor must not receive personal data. This is a
contract problem before it is a code problem.

## Step 6 — Data-subject rights

Each needs a working, tested path:

| Right | Implementation |
|-------|----------------|
| Access | Server fn exporting everything about the caller as JSON |
| Rectification | Existing profile edit flows |
| Erasure | Cascading delete + audit entry recording that erasure occurred. Clinical records under a legal retention duty are *restricted*, not deleted — document the exception. |
| Portability | Same export, machine-readable |
| Restriction / objection | A `processing_restricted` flag honoured by marketing queries |

## Step 7 — CNDP

Health data processing in Morocco requires prior authorisation from the CNDP, not
just a declaration. Start the file early; it takes time. Include the data
classification, the privacy tiers, retention periods, and the subprocessor list —
all produced by the steps above.

## Deliverables

- [ ] `docs/data-classification.md`
- [ ] `audit_log` table + triggers on all C1/C2 tables
- [ ] `/admin/audit` view with export
- [ ] Column encryption extended beyond session notes
- [ ] Signed DPA per subprocessor
- [ ] Working export + erasure endpoints
- [ ] CNDP file submitted
