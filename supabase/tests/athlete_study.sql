-- Behaviour test for 20261027120000_athlete_study.sql.
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
  ('00000000-0000-0000-0000-00000000d101', 'athlete@study.test'),
  ('00000000-0000-0000-0000-00000000d102', 'minor@study.test'),
  ('00000000-0000-0000-0000-00000000d103', 'admin@study.test'),
  ('00000000-0000-0000-0000-00000000d104', 'quitter@study.test');
INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-00000000d103', 'admin');

SET LOCAL ROLE authenticated;

-- Not enrolled: no answers accepted.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000d101');
DO $$ BEGIN
  INSERT INTO public.study_responses (user_id, instrument, period_start, answers, score)
    VALUES ('00000000-0000-0000-0000-00000000d101', 'who5', current_date, '{3,3,3,3,3}', 60);
  RAISE EXCEPTION 'FAILED: answered before enrolling';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: no answers before consent'; END $$;

-- Under 18 is refused.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000d102');
DO $$ BEGIN
  PERFORM public.study_enroll('v1', extract(year FROM now())::int - 16, 'female', 'Tennis', 'competitive');
  RAISE EXCEPTION 'FAILED: a minor enrolled';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM LIKE 'FAILED%' THEN RAISE; END IF;
  RAISE NOTICE 'ok: minors cannot enrol';
END $$;

-- Enrol, answer, and get a stable code.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000d101');
SELECT public.study_enroll('v1', 1998, 'male', 'Football', 'national') AS code \gset
SELECT pg_temp.expect(:'code' ~ '^UPS-[0-9A-F]{6}$', 'participant code is UPS- plus 6 hex');
SELECT pg_temp.expect(public.study_enroll('v1', 1998, 'male', 'Football', 'national') = :'code',
  'enrolling again keeps the same code');

INSERT INTO public.study_responses (user_id, instrument, period_start, answers, score)
  VALUES ('00000000-0000-0000-0000-00000000d101', 'who5', current_date, '{4,4,3,3,4}', 72);
INSERT INTO public.study_responses (user_id, instrument, period_start, answers, score, subscores)
  VALUES ('00000000-0000-0000-0000-00000000d101', 'sleep', current_date, '{7.5,6,1}', 6, '{"hours":7.5}');
INSERT INTO public.readiness_checkins (user_id, mood, sleep, stress, energy, cognitive_load, score)
  VALUES ('00000000-0000-0000-0000-00000000d101', 7, 7, 4, 7, 4, 70);

DO $$ BEGIN
  INSERT INTO public.study_responses (user_id, instrument, period_start, answers, score)
    VALUES ('00000000-0000-0000-0000-00000000d101', 'pss10', current_date, '{1,2,3}', 6);
  RAISE EXCEPTION 'FAILED: wrong item count accepted';
EXCEPTION WHEN check_violation THEN RAISE NOTICE 'ok: item count is enforced'; END $$;

DO $$ BEGIN
  INSERT INTO public.study_responses (user_id, instrument, period_start, answers, score)
    VALUES ('00000000-0000-0000-0000-00000000d104', 'who5', current_date, '{1,1,1,1,1}', 20);
  RAISE EXCEPTION 'FAILED: answered for someone else';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: cannot answer for another user'; END $$;

-- Participants cannot export.
DO $$ BEGIN
  PERFORM * FROM public.study_export();
  RAISE EXCEPTION 'FAILED: participant exported';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM LIKE 'FAILED%' THEN RAISE; END IF;
  RAISE NOTICE 'ok: export is admin-only';
END $$;

-- A second participant withdraws and asks for deletion.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000d104');
SELECT public.study_enroll('v1', 1990, 'female', 'Athletics', 'international') IS NOT NULL;
INSERT INTO public.study_responses (user_id, instrument, period_start, answers, score)
  VALUES ('00000000-0000-0000-0000-00000000d104', 'who5', current_date, '{2,2,2,2,2}', 40);
SELECT public.study_withdraw(true);
SELECT pg_temp.expect((SELECT count(*) FROM public.study_responses) = 0,
  'withdrawing with deletion removes the study answers');
DO $$ BEGIN
  INSERT INTO public.study_responses (user_id, instrument, period_start, answers, score)
    VALUES ('00000000-0000-0000-0000-00000000d104', 'who5', current_date + 1, '{2,2,2,2,2}', 40);
  RAISE EXCEPTION 'FAILED: answered after withdrawing';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: no answers after withdrawal'; END $$;

-- The admin export carries codes, never user ids, and skips deleted participants.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000d103');
SELECT pg_temp.expect((SELECT count(*) FROM public.study_participants()) = 1,
  'participants list leaves out those who asked for deletion');
SELECT pg_temp.expect(
  (SELECT count(DISTINCT participant_code) FROM public.study_export()) = 1
  AND (SELECT bool_and(participant_code = :'code') FROM public.study_export()),
  'export is keyed by participant code');
SELECT pg_temp.expect(
  (SELECT value FROM public.study_export() WHERE item = 'who5_score') = 72
  AND (SELECT value FROM public.study_export() WHERE item = 'who5_3') = 3
  AND (SELECT value FROM public.study_export() WHERE item = 'sleep_hours') = 7.5
  AND (SELECT value FROM public.study_export() WHERE item = 'readiness_score') = 70,
  'export has items, scores, subscores and daily readiness');
SELECT pg_temp.expect(
  (SELECT count(*) FROM public.audit_log WHERE resource_type IN ('study_data', 'study_participants')) >= 2,
  'exports are audited');
SELECT pg_temp.expect((public.study_stats() ->> 'withdrawn')::int = 1, 'stats count withdrawals');

ROLLBACK;
