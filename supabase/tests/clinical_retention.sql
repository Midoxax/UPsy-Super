-- Behaviour test for 20261019191000_clinical_retention.sql.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;

-- c1: inactive for 11 years           -> purged
-- c2: same old records, signed in recently -> kept
-- c3: account deleted, records 11 years old -> purged
-- c4: recent records                   -> kept
INSERT INTO auth.users (id, email, last_sign_in_at) VALUES
  ('00000000-0000-0000-0000-0000000000b9', 'psy@test', now()),
  ('00000000-0000-0000-0000-0000000000c1', 'old@test', now() - interval '11 years'),
  ('00000000-0000-0000-0000-0000000000c2', 'back@test', now() - interval '1 month'),
  ('00000000-0000-0000-0000-0000000000c4', 'new@test', now() - interval '1 day');
INSERT INTO public.psychologist_profiles (id, full_name, slug)
  VALUES ('00000000-0000-0000-0000-0000000000b9', 'Dr Ret', 'dr-ret');
INSERT INTO public.assessments (id, title) VALUES ('00000000-0000-0000-0000-0000000000f5', 'PHQ-9');

CREATE FUNCTION pg_temp.seed(_c uuid, _at timestamptz) RETURNS void LANGUAGE plpgsql AS $$
DECLARE _s uuid := gen_random_uuid(); _a uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.sessions (id, client_id, psychologist_id, date_time, created_at, notes)
    VALUES (_s, _c, '00000000-0000-0000-0000-0000000000b9', _at, _at, 'free-text notes');
  INSERT INTO public.session_notes (session_id, psychologist_id, content, created_at)
    VALUES (_s, '00000000-0000-0000-0000-0000000000b9', 'note', _at);
  INSERT INTO public.reviews (session_id, client_id, psychologist_id, rating)
    VALUES (_s, _c, '00000000-0000-0000-0000-0000000000b9', 5);
  -- These cascade from auth.users, so a deleted account has none of them.
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = _c) THEN
    INSERT INTO public.assessment_results (user_id, assessment_id, created_at)
      VALUES (_c, '00000000-0000-0000-0000-0000000000f5', _at);
    INSERT INTO public.mood_entries (user_id, mood_score, created_at) VALUES (_c, 5, _at);
    INSERT INTO public.treatment_plans (client_id, psychologist_id, created_at, updated_at)
      VALUES (_c, '00000000-0000-0000-0000-0000000000b9', _at, _at);
  END IF;
  INSERT INTO public.journal_entries (user_id, content, created_at, updated_at) VALUES (_c, 'entry', _at, _at);
  INSERT INTO public.client_anamneses (id, client_id, created_at, updated_at) VALUES (_a, _c, _at, _at);
  INSERT INTO public.crisis_alerts (client_id, alert_type, intake_form_id, created_at) VALUES (_c, 'test', _a, _at);
END $$;

SELECT pg_temp.seed('00000000-0000-0000-0000-0000000000c1', now() - interval '11 years');
SELECT pg_temp.seed('00000000-0000-0000-0000-0000000000c2', now() - interval '11 years');
SELECT pg_temp.seed('00000000-0000-0000-0000-0000000000c3', now() - interval '11 years');
SELECT pg_temp.seed('00000000-0000-0000-0000-0000000000c4', now() - interval '2 years');

-- Dry run reports, deletes nothing.
SELECT pg_temp.expect(
  (SELECT array_agg(subject_id ORDER BY subject_id)::text FROM public.purge_expired_clinical_records(true))
  = '{00000000-0000-0000-0000-0000000000c1,00000000-0000-0000-0000-0000000000c3}',
  'dry run selects the inactive client and the deleted account only');
SELECT pg_temp.expect((SELECT count(*) FROM public.session_notes) = 4, 'dry run deletes nothing');

-- Real run.
SELECT pg_temp.expect((SELECT count(*) FROM public.purge_expired_clinical_records()) = 2, 'purge reports two clients');

SELECT pg_temp.expect(NOT EXISTS (SELECT 1 FROM public.assessment_results WHERE user_id IN
  ('00000000-0000-0000-0000-0000000000c1','00000000-0000-0000-0000-0000000000c3')), 'expired questionnaires deleted');
SELECT pg_temp.expect(NOT EXISTS (SELECT 1 FROM public.client_anamneses WHERE client_id IN
  ('00000000-0000-0000-0000-0000000000c1','00000000-0000-0000-0000-0000000000c3')), 'expired intake forms deleted (crisis alerts first)');
SELECT pg_temp.expect((SELECT count(*) FROM public.session_notes) = 2, 'expired session notes deleted, others kept');
SELECT pg_temp.expect((SELECT count(*) FROM public.sessions WHERE client_id = '00000000-0000-0000-0000-0000000000c1' AND notes IS NULL) = 1,
  'appointment record kept, its notes cleared');
SELECT pg_temp.expect((SELECT count(*) FROM public.reviews) = 4, 'reviews untouched');
SELECT pg_temp.expect((SELECT count(*) FROM public.journal_entries WHERE user_id = '00000000-0000-0000-0000-0000000000c2') = 1,
  'recently active client keeps old records');
SELECT pg_temp.expect((SELECT count(*) FROM public.mood_entries WHERE user_id = '00000000-0000-0000-0000-0000000000c4') = 1,
  'recent records kept');
SELECT pg_temp.expect((SELECT count(*) FROM public.audit_log WHERE action = 'retention.purge'
  AND (metadata->>'rows_deleted')::int > 0) = 2, 'one audit row per purged client');
SELECT pg_temp.expect((SELECT count(*) FROM public.purge_expired_clinical_records()) = 0, 'second run has nothing to do');

-- Only the scheduler and service role may run it.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b9', true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  PERFORM public.purge_expired_clinical_records(true);
  RAISE EXCEPTION 'FAILED: authenticated user ran the purge';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: purge refused to app users'; END $$;
RESET ROLE;

SELECT pg_temp.expect((SELECT schedule FROM cron.job WHERE jobname = 'purge-expired-clinical-records') = '41 3 2 * *',
  'monthly job scheduled');
ROLLBACK;
