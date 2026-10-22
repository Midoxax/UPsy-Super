-- Behaviour test for 20261022090000_athlete_hub_modules.sql.
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

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('00000000-0000-0000-0000-00000000a701', 'athlete@hub.test', '{"full_name":"Athlete One"}'),
  ('00000000-0000-0000-0000-00000000a702', 'psy@hub.test', '{}'),
  ('00000000-0000-0000-0000-00000000a703', 'other-psy@hub.test', '{}'),
  ('00000000-0000-0000-0000-00000000a704', 'stranger@hub.test', '{}');
INSERT INTO public.psychologist_profiles (id, full_name) VALUES
  ('00000000-0000-0000-0000-00000000a702', 'Dr Booked'),
  ('00000000-0000-0000-0000-00000000a703', 'Dr Not Booked');
INSERT INTO public.bookings (patient_id, psychologist_id, scheduled_at, duration_minutes, session_type, status)
  VALUES ('00000000-0000-0000-0000-00000000a701', '00000000-0000-0000-0000-00000000a702',
          now() + interval '3 days', 50, 'video', 'pending');

SET LOCAL ROLE authenticated;
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000a701');

INSERT INTO public.athlete_goals (user_id, title, kind, progress)
  VALUES ('00000000-0000-0000-0000-00000000a701', 'Sleep 8h before matches', 'process', 40);
INSERT INTO public.athlete_competitions (user_id, name, event_date, checklist)
  VALUES ('00000000-0000-0000-0000-00000000a701', 'National final', current_date + 10,
          '[{"label":"Visualise first serve","done":false}]');
INSERT INTO public.readiness_checkins (user_id, mood, sleep, stress, energy, cognitive_load, score)
  VALUES ('00000000-0000-0000-0000-00000000a701', 7, 7, 4, 7, 4, 70);
INSERT INTO public.journal_entries (user_id, content, ai_summary)
  VALUES ('00000000-0000-0000-0000-00000000a701', 'private raw text', 'Summary only');

SELECT pg_temp.expect((SELECT count(*) FROM public.athlete_share_candidates()) = 1,
  'athlete can share only with a psychologist they booked');

DO $$ BEGIN
  INSERT INTO public.athlete_shares (athlete_id, psychologist_id)
    VALUES ('00000000-0000-0000-0000-00000000a701', '00000000-0000-0000-0000-00000000a703');
  RAISE EXCEPTION 'FAILED: shared with a psychologist never booked';
EXCEPTION WHEN insufficient_privilege OR check_violation THEN RAISE NOTICE 'ok: no share without a booking'; END $$;

INSERT INTO public.athlete_shares (athlete_id, psychologist_id, scopes)
  VALUES ('00000000-0000-0000-0000-00000000a701', '00000000-0000-0000-0000-00000000a702',
          ARRAY['readiness','goals','journal']);

-- The booked psychologist sees exactly the granted scopes.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000a702');
SELECT pg_temp.expect((SELECT count(*) FROM public.athletes_shared_with_me()) = 1,
  'psychologist lists the athlete who shared');
SELECT pg_temp.expect(
  (public.athlete_shared_overview('00000000-0000-0000-0000-00000000a701') -> 'goals' -> 0 ->> 'title') = 'Sleep 8h before matches',
  'shared goals are visible');
SELECT pg_temp.expect(
  jsonb_array_length(public.athlete_shared_overview('00000000-0000-0000-0000-00000000a701') -> 'checkins') = 1,
  'shared check-ins are visible');
SELECT pg_temp.expect(
  NOT (public.athlete_shared_overview('00000000-0000-0000-0000-00000000a701') ? 'competitions'),
  'unshared scope (competitions) is withheld');
SELECT pg_temp.expect(
  public.athlete_shared_overview('00000000-0000-0000-0000-00000000a701')::text NOT LIKE '%private raw text%',
  'raw journal text never leaves');
SELECT pg_temp.expect((SELECT count(*) FROM public.athlete_goals) = 0,
  'psychologist cannot read the goals table directly');

-- Anyone else gets nothing.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000a704');
SELECT pg_temp.expect(public.athlete_shared_overview('00000000-0000-0000-0000-00000000a701') IS NULL,
  'a stranger gets no overview');

-- Revoking cuts access.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000a701');
UPDATE public.athlete_shares SET revoked_at = now() WHERE athlete_id = '00000000-0000-0000-0000-00000000a701';
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000a702');
SELECT pg_temp.expect(public.athlete_shared_overview('00000000-0000-0000-0000-00000000a701') IS NULL,
  'a revoked share returns nothing');

ROLLBACK;
