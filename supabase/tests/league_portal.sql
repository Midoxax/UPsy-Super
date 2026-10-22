-- Behaviour test for 20261022100100_league_portal.sql.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;

CREATE FUNCTION pg_temp.as_user(_id uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', _id::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', _id, 'role', 'authenticated')::text, true);
END $$;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000b101', 'opted-in@league.test'),
  ('00000000-0000-0000-0000-00000000b102', 'private@league.test'),
  ('00000000-0000-0000-0000-00000000b103', 'reviewer@league.test'),
  ('00000000-0000-0000-0000-00000000b104', 'nobody@league.test');
INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-00000000b103', 'league');

INSERT INTO public.psychologist_applications
  (user_id, email, full_name, status, source, phone, date_of_birth,
   doc_diploma_url, doc_cin_url, doc_rib_url, auto_check_flags)
VALUES
  ('00000000-0000-0000-0000-00000000b101', 'opted-in@league.test', 'Dr Opted In', 'pending', 'lsspm',
   '+212600000000', '1990-01-01',
   '00000000-0000-0000-0000-00000000b101/diploma.pdf', '00000000-0000-0000-0000-00000000b101/cin.pdf',
   '00000000-0000-0000-0000-00000000b101/rib.pdf', '[{"severity":"warn"},{"severity":"warn"}]'),
  ('00000000-0000-0000-0000-00000000b102', 'private@league.test', 'Dr Private', 'pending', NULL,
   NULL, NULL, '00000000-0000-0000-0000-00000000b102/diploma.pdf', NULL, NULL, '[]');

INSERT INTO storage.buckets (id, name) VALUES ('accreditation-docs', 'accreditation-docs') ON CONFLICT DO NOTHING;
INSERT INTO storage.objects (bucket_id, name) VALUES
  ('accreditation-docs', '00000000-0000-0000-0000-00000000b101/diploma.pdf'),
  ('accreditation-docs', '00000000-0000-0000-0000-00000000b101/cin.pdf'),
  ('accreditation-docs', '00000000-0000-0000-0000-00000000b101/rib.pdf'),
  ('accreditation-docs', '00000000-0000-0000-0000-00000000b102/diploma.pdf');

SET LOCAL ROLE authenticated;

-- Before any consent, the League sees nothing.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000b103');
SELECT pg_temp.expect((SELECT count(*) FROM public.league_applications()) = 0,
  'no file is visible without consent');
SELECT pg_temp.expect((SELECT count(*) FROM storage.objects WHERE bucket_id = 'accreditation-docs') = 0,
  'no document is readable without consent');

-- The psychologist opts in.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000b101');
SELECT pg_temp.expect(public.set_league_share(true), 'psychologist can opt in');
RESET ROLE;
SELECT pg_temp.expect((SELECT league_share_consented_at IS NOT NULL FROM public.psychologist_applications
  WHERE user_id = '00000000-0000-0000-0000-00000000b101'), 'consent time is recorded');
SET LOCAL ROLE authenticated;

SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000b103');
SELECT pg_temp.expect((SELECT count(*) FROM public.league_applications()) = 1,
  'the opted-in file, and only it, is listed');
SELECT pg_temp.expect((SELECT upsy_score FROM public.league_applications()) = 84,
  'UPSY score counts the auto-check flags (100 - 2 warnings x 8)');
SELECT pg_temp.expect(
  (SELECT string_agg(name, ',' ORDER BY name) FROM storage.objects WHERE bucket_id = 'accreditation-docs')
    = '00000000-0000-0000-0000-00000000b101/diploma.pdf',
  'League reads the diploma, never the CIN or RIB');
SELECT pg_temp.expect(
  (SELECT to_jsonb(l)::text FROM public.league_applications() l) NOT LIKE '%+212600000000%'
  AND (SELECT to_jsonb(l)::text FROM public.league_applications() l) NOT LIKE '%1990-01-01%',
  'phone and date of birth are not exposed');
SELECT pg_temp.expect((public.league_recruitment_stats('lsspm') ->> 'started')::int = 1,
  'campaign funnel counts the League source');

INSERT INTO public.league_reviews (application_id, reviewer_id, score_training, score_experience,
  score_documents, score_specialisation, score_ethics, recommendation, member_status)
SELECT id, '00000000-0000-0000-0000-00000000b103', 5, 4, 4, 3, 5, 'recommended', 'member'
FROM public.league_applications();
SELECT pg_temp.expect((SELECT league_avg FROM public.league_applications()) = 84,
  'League score is the rubric total out of 100');

RESET ROLE;
SELECT set_config('test.private_app', id::text, true) FROM public.psychologist_applications
  WHERE user_id = '00000000-0000-0000-0000-00000000b102';
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  INSERT INTO public.league_reviews (application_id, reviewer_id, score_training, score_experience,
    score_documents, score_specialisation, score_ethics, recommendation)
  VALUES (current_setting('test.private_app')::uuid, '00000000-0000-0000-0000-00000000b103', 1, 1, 1, 1, 1, 'more_info');
  RAISE EXCEPTION 'FAILED: reviewed a file that was not shared';
EXCEPTION WHEN insufficient_privilege OR check_violation THEN RAISE NOTICE 'ok: cannot review an unshared file'; END $$;

SELECT pg_temp.expect((SELECT (my_review ->> 'member_status') FROM public.league_applications()) = 'member',
  'the reviewer sees their own review on the file');

-- An ordinary user gets nothing.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000b104');
DO $$ BEGIN
  PERFORM public.league_applications();
  RAISE EXCEPTION 'FAILED: non-reviewer listed League files';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: only League reviewers list files'; END $$;
SELECT pg_temp.expect((SELECT count(*) FROM public.league_reviews) = 0, 'reviews are hidden from others');

-- Withdrawing consent cuts access at once.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000b101');
SELECT public.set_league_share(false);
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000b103');
SELECT pg_temp.expect((SELECT count(*) FROM public.league_applications()) = 0
  AND (SELECT count(*) FROM storage.objects WHERE bucket_id = 'accreditation-docs') = 0,
  'withdrawn consent hides the file and its documents');

ROLLBACK;
