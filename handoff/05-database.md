# 5 — Database

106 migrations under `supabase/migrations/`, creating roughly 150 tables in
`public`. Structured inventory: `inventory/migrations.json`.

## The standard, restated because it is violated historically

Every `CREATE TABLE public.x` is followed, **in the same migration, in this
order**:

```sql
CREATE TABLE public.thing ( ... );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.thing TO authenticated;
GRANT ALL ON public.thing TO service_role;
-- GRANT SELECT ON public.thing TO anon;   -- only if a policy allows anon reads

ALTER TABLE public.thing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "..." ON public.thing FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);
```

RLS without GRANTs returns a permission error from the Data API. GRANTs
without RLS is a data leak. Both, always.

Other rules:

- No foreign keys to `auth.users`. Use a `profiles` table in `public`.
- Roles live in `user_roles` and are checked with the `has_role()` SECURITY
  DEFINER function. Never a role column on a profile.
- Time-dependent validation (`expire_at > now()`) uses a trigger, not a CHECK
  constraint — CHECKs must be immutable and break restores.
- Think about defaults and `NOT NULL` before shipping; a table that rejects
  the app's own inserts is the most common self-inflicted outage.
- Migrations are append-only. Once applied anywhere, never edit the file.

## Domain map

| Domain | Representative tables |
|--------|----------------------|
| Identity & access | `profiles`, `user_roles`, `crm_staff` |
| Directory & matching | psychologist profiles, specialities, accreditation tiers, matching requests, `leads` |
| Booking & sessions | `bookings`, availability, session proposals, meeting links, reminders |
| Clinical | intake/anamnesis, encrypted session notes, journals, screenings (GAD-7, PHQ-9), crisis flags |
| Finance | invoices with sequential numbering, transactions (MAD), payouts, coupons, subscriptions, platform pricing |
| CRM | `contacts`, `deals`, notes, `crm_consents`, `crm_automation_rules`, `crm_notifications`, `crm_email_messages` |
| Growth | `growth_leads`, `funnel_events`, `experiment_winners`, quiz results, `org_pulse_responses` |
| Gamification | XP events, `user_progress`, `user_badges`, streaks, quests, skill nodes, daily challenges |
| Learning | courses, modules, cohorts, certificates, `certificate_verifications` |
| OPS | `ops_workspaces`, `ops_events`, `ops_phases`, `ops_tasks` |
| Compliance & ops | `audit_log`, `app_logs`, DSR requests, legal document versions |

## Sensitivity tiers

| Tier | Examples | Rule |
|------|----------|------|
| **Clinical** | notes, intake, screenings, journals, crisis flags | Encrypted at rest. Never to an LLM, analytics, log, or URL. Access always audited. |
| **Personal** | contact details, bookings, invoices | RLS scoped to owner; staff access role-gated and audited. |
| **Operational** | ops tasks, app logs, funnel events | Staff-only; no direct personal identifiers. |
| **Public** | directory listings, published content, blog | Narrow `TO anon` SELECT with explicit safe-column projection. |

`docs/data-classification.md` holds the longer version.

## The audit trail

`audit_log` is append-only: an immutability trigger rejects UPDATE and DELETE,
writes come from database triggers so application code cannot bypass them,
retention is six years, and only admins can read it. Each row records who,
what record, what action, when, and from where.

Do not add an application write path that inserts directly. Do not add a
"cleanup" job. If a row is wrong, append a correcting row.

## Migration safety scan

`scripts/check-migrations-safety.mjs` statically scans every migration for the
standard above. `scripts/migrations-safety-baseline.json` snapshots the 102
pre-existing violations so CI fails only on **new** regressions.

```bash
node scripts/check-migrations-safety.mjs
```

Never regenerate the baseline to make a failure disappear. The baseline shrinks
only when a remediation migration actually fixes a historical table — and when
it does, regenerate it in that same PR and say so in the description.

## Migrating to a new Supabase project

Rehearse the whole sequence against a scratch project first, time it, and note
every manual step. Then schedule the real window.

```bash
# 1. Schema
supabase db dump --db-url "$SOURCE_DB_URL" --schema public,storage -f schema.sql
psql "$TARGET_DB_URL" -f schema.sql
# verify: extensions, enums, functions, triggers, RLS policies, GRANTs.
# GRANTs are the usual casualty.

# 2. Data
supabase db dump --db-url "$SOURCE_DB_URL" --data-only -f data.sql
psql "$TARGET_DB_URL" -f data.sql
# verify row counts table by table.

# 3. Auth users — plain dumps do not carry password hashes
supabase db dump --db-url "$SOURCE_DB_URL" --schema auth -f auth.sql
psql "$TARGET_DB_URL" -f auth.sql
# fallback: recreate via the Admin API and force a password reset.
# OAuth users re-link on next sign-in. Verify the admin role survived.

# 4. Storage objects (buckets come with the schema dump, objects do not)
supabase storage cp -r "ss://<bucket>" ./backup/<bucket> --experimental
supabase storage cp -r ./backup/<bucket> "ss://<bucket>" --experimental
# re-check that private buckets are still private.

# 5. Edge functions
supabase link --project-ref <NEW_REF>
supabase functions deploy
supabase secrets set --env-file ./functions.env

# 6. pg_cron jobs — recreate each by hand, pointing at the new host
```

Then the manual reconfiguration that never migrates: Google OAuth client,
Apple key, Resend sending domain, auth redirect allow-list, site URL, auth
email hook, password policy and HIBP.

**Before decommissioning the source: verify a note decrypt round-trip.** If the
encryption key did not carry over verbatim, every clinical note is lost and
there is no recovery.

Keep the source project **paused, not deleted**, for thirty days.

## Staging data

Never copy production clinical data into staging. Seed staging with generated
fixtures, or with an anonymised extract that drops every clinical table and
hashes personal identifiers. If a staging environment can be used to read a
real patient note, it is a breach waiting for a date.

## Open items

- 157 `SECURITY DEFINER` linter warnings. Each needs a review: does it need
  definer rights, and does it set `search_path = public`? Track in the backlog.
- 102 baselined migration-safety violations. Remediate by domain, highest
  sensitivity first.
