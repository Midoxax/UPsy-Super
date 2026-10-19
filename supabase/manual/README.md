# Production database: state and manual steps

Production (project `skxxvgjjdshcopybokdt`) was not built from `supabase/migrations`.
Its migration history has about 20 entries; this folder has over 100. So the
deploy workflow does **not** run `supabase db push`. It would replay old
migrations against the live schema. Auto-apply stays off until the repository
variable `SUPABASE_AUTO_MIGRATE` is set to `true` (see below).

## Applied to production on 2026-10-19

These went through the Supabase connector and appear in production's migration
history:

| Name | Effect |
| --- | --- |
| `fix_log_sensitive_change` | Clinical records (session notes, questionnaires, intake forms, plans, homework, discharge summaries, mood) can be saved again. Every save had failed since the audit trigger was added. |
| `break_glass_clinical_access_functions` | `admin_break_glass_read()` and `admin_session_counts()` |
| `break_glass_files_and_activity` | `admin_break_glass_files()` and the 15-minute folder access; the admin activity view no longer returns questionnaire scores. |
| `storage_buckets_baseline` | Creates the four storage buckets (production had none) and their access rules. |

## Still to run by hand

`2026-10-19_finish_privacy_rollout.sql` holds the steps that remove or delete
things, which the connector will not run without an interactive confirmation:

1. removes duplicate audit triggers;
2. removes routine admin read access to clinical tables (break-glass replaces it);
3. adds the 10-year clinical retention table, function and monthly job.

Run it in Supabase > SQL Editor > New query: paste the whole file, then Run.
It is one transaction, and every statement is idempotent.

Also upload the email logo: Supabase > Storage > `email-assets` > upload
`logo.png`. The sign-up, password and magic-link emails load it from there.

## Turning on automatic migrations

Only after production's history matches this folder:

1. `npx supabase link --project-ref skxxvgjjdshcopybokdt`
2. `npx supabase db diff --linked` must show no schema change you don't expect.
3. Mark each version in `supabase/migrations` as applied:
   `npx supabase migration repair --status applied <version> ...`
4. `npx supabase db push --dry-run` must report nothing to apply.
5. Add the secrets `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD`, and the
   repository **variable** `SUPABASE_AUTO_MIGRATE=true`.
