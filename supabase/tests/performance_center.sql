-- Behaviour test for 20261128090000_performance_center.sql: the athlete's
-- telemetry, session load, profile, race plans and season are private;
-- a psychologist sees each part only when the athlete shares that scope.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
CREATE FUNCTION pg_temp.raises(_sql text, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE _sql;
  RAISE EXCEPTION 'FAILED: % (no error)', _what;
EXCEPTION WHEN check_violation OR insufficient_privilege OR raise_exception THEN
  IF SQLERRM LIKE 'FAILED%' THEN RAISE; END IF;
  RAISE NOTICE 'ok: %', _what;
END $$;
CREATE FUNCTION pg_temp.as_user(_id uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', _id::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', _id, 'role', 'authenticated')::text, true);
END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text), pg_temp.raises(text, text), pg_temp.as_user(uuid) TO authenticated, anon;

-- a: athlete · p: their psychologist · s: a stranger
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000bc01', 'pc-athlete@hub.test'),
  ('00000000-0000-0000-0000-00000000bc02', 'pc-psy@hub.test'),
  ('00000000-0000-0000-0000-00000000bc03', 'pc-stranger@hub.test');
INSERT INTO public.psychologist_profiles (id, full_name) VALUES
  ('00000000-0000-0000-0000-00000000bc02', 'Dr Pit Wall');
INSERT INTO public.bookings (patient_id, psychologist_id, scheduled_at, duration_minutes, session_type, status)
  VALUES ('00000000-0000-0000-0000-00000000bc01', '00000000-0000-0000-0000-00000000bc02',
          now() + interval '2 days', 50, 'video', 'pending');

SET LOCAL ROLE authenticated;
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000bc01');

-- Telemetry and load.
INSERT INTO public.readiness_checkins (user_id, mood, sleep, stress, energy, cognitive_load, score,
                                       sleep_hours, soreness, hrv_ms, resting_hr)
  VALUES ('00000000-0000-0000-0000-00000000bc01', 7, 6, 4, 7, 4, 66, 7.5, 3, 62, 54);
SELECT pg_temp.raises($q$INSERT INTO public.readiness_checkins (user_id, mood, sleep, stress, energy, cognitive_load, score, sleep_hours)
  VALUES ('00000000-0000-0000-0000-00000000bc01', 7, 6, 4, 7, 4, 66, 20)$q$, 'sleep hours stay plausible');
INSERT INTO public.athlete_sessions (user_id, session_date, kind, duration_minutes, rpe)
  VALUES ('00000000-0000-0000-0000-00000000bc01', current_date, 'training', 90, 7),
         ('00000000-0000-0000-0000-00000000bc01', current_date - 1, 'match', 60, 9);
SELECT pg_temp.expect((SELECT sum(load) = 90 * 7 + 60 * 9 FROM public.athlete_sessions),
  'session load is duration x RPE (Foster)');
SELECT pg_temp.raises($q$INSERT INTO public.athlete_sessions (user_id, duration_minutes, rpe)
  VALUES ('00000000-0000-0000-0000-00000000bc01', 60, 11)$q$, 'RPE is on the CR-10 scale');

-- Profile, race plan, season.
INSERT INTO public.athlete_profile_snapshots (user_id, qualities) VALUES
  ('00000000-0000-0000-0000-00000000bc01',
   '[{"label":"Focus under pressure","area":"mental","current":5,"ideal":9}]');
SELECT pg_temp.raises($q$INSERT INTO public.athlete_profile_snapshots (user_id, qualities)
  VALUES ('00000000-0000-0000-0000-00000000bc01', '[]')$q$, 'a profile has at least one quality');
INSERT INTO public.athlete_competitions (user_id, name, event_date, race_plan, pre_state)
  VALUES ('00000000-0000-0000-0000-00000000bc01', 'Open de Rabat', current_date + 5,
          '{"zone_low":5,"zone_high":7,"cues":["smooth"],"if_then":[{"if":"I miss early","then":"breathe, next point"}]}',
          '{"cognitive":4,"somatic":5,"confidence":7,"direction":2}');
SELECT pg_temp.raises($q$INSERT INTO public.athlete_competitions (user_id, name, event_date, race_plan)
  VALUES ('00000000-0000-0000-0000-00000000bc01', 'x', current_date, '[]')$q$, 'a race plan is an object');
INSERT INTO public.athlete_season_phases (user_id, name, kind, starts_on, ends_on)
  VALUES ('00000000-0000-0000-0000-00000000bc01', 'Bloc spécifique', 'specific_prep', current_date, current_date + 28);
SELECT pg_temp.raises($q$INSERT INTO public.athlete_season_phases (user_id, name, kind, starts_on, ends_on)
  VALUES ('00000000-0000-0000-0000-00000000bc01', 'x', 'competition', current_date, current_date - 1)$q$,
  'a phase ends after it starts');

-- Share readiness and competitions only.
INSERT INTO public.athlete_shares (athlete_id, psychologist_id, scopes)
  VALUES ('00000000-0000-0000-0000-00000000bc01', '00000000-0000-0000-0000-00000000bc02',
          ARRAY['readiness', 'competitions']);
SELECT pg_temp.raises($q$UPDATE public.athlete_shares SET scopes = ARRAY['everything']$q$,
  'only the listed scopes can be shared');

-- A stranger sees none of it.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000bc03');
SELECT pg_temp.expect((SELECT count(*) FROM public.athlete_sessions) = 0
  AND (SELECT count(*) FROM public.athlete_profile_snapshots) = 0
  AND (SELECT count(*) FROM public.athlete_season_phases) = 0,
  'sessions, profiles and the season are private');

-- The psychologist sees the shared scopes, with the new fields.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000bc02');
SELECT pg_temp.expect((SELECT (o->'checkins'->0->>'hrv_ms')::int = 62
                              AND o->'competitions'->0->'race_plan'->'cues'->>0 = 'smooth'
                              AND (o->'competitions'->0->'pre_state'->>'direction')::int = 2
                              AND NOT o ? 'sessions' AND NOT o ? 'profiles' AND NOT o ? 'season'
                         FROM public.athlete_shared_overview('00000000-0000-0000-0000-00000000bc01') o),
  'the psychologist sees telemetry and race plans, not load, profile or season');

-- The athlete adds training, profile and season.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000bc01');
UPDATE public.athlete_shares SET scopes = ARRAY['training', 'profile', 'season'];
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000bc02');
SELECT pg_temp.expect((SELECT jsonb_array_length(o->'sessions') = 2
                              AND (o->'sessions'->0->>'load')::int = 630
                              AND o->'profiles'->0->'qualities'->0->>'label' = 'Focus under pressure'
                              AND o->'season'->0->>'kind' = 'specific_prep'
                              AND NOT o ? 'checkins'
                         FROM public.athlete_shared_overview('00000000-0000-0000-0000-00000000bc01') o),
  'then load, profile and season, and no longer the check-ins');
SELECT pg_temp.expect((SELECT count(*) FROM public.athlete_sessions) = 0,
  'the psychologist still cannot read the tables directly');

-- Pit crew links: read-only, per scope, revocable, never clinical.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000bc01');
INSERT INTO public.athlete_crew_links (athlete_id, label, role, scopes)
  VALUES ('00000000-0000-0000-0000-00000000bc01', 'Coach Karim', 'coach', ARRAY['training', 'competitions']);
SELECT pg_temp.raises($q$INSERT INTO public.athlete_crew_links (athlete_id, label, token)
  VALUES ('00000000-0000-0000-0000-00000000bc01', 'x', repeat('a', 64))$q$, 'the client cannot choose the token');
SELECT pg_temp.raises($q$INSERT INTO public.athlete_crew_links (athlete_id, label, scopes)
  VALUES ('00000000-0000-0000-0000-00000000bc01', 'x', ARRAY['journal'])$q$, 'a crew link never carries the journal');
SELECT pg_temp.expect((SELECT token ~ '^[0-9a-f]{64}$' FROM public.athlete_crew_links), 'the database picks a 64-hex token');
CREATE TEMP TABLE crew_tok AS SELECT token FROM public.athlete_crew_links;
GRANT SELECT ON crew_tok TO anon;
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000bc03');
SELECT pg_temp.expect((SELECT count(*) = 0 FROM public.athlete_crew_links), 'others do not see the links');
RESET ROLE;

SET LOCAL ROLE anon;
SELECT pg_temp.expect((SELECT v->>'label' = 'Coach Karim'
                              AND jsonb_array_length(v->'sessions') = 2
                              AND v->'competitions'->0->>'name' = 'Open de Rabat'
                              AND v->'competitions'->0->'cues'->>0 = 'smooth'
                              AND NOT v ? 'checkins' AND NOT v ? 'season'
                         FROM public.crew_view((SELECT token FROM crew_tok)) v),
  'the coach sees training and competitions, nothing else, without an account');
SELECT pg_temp.expect(public.crew_view(repeat('b', 64)) IS NULL AND public.crew_view('x') IS NULL,
  'a wrong token shows nothing');
RESET ROLE;
SELECT pg_temp.expect((SELECT last_viewed_at IS NOT NULL FROM public.athlete_crew_links), 'the view is recorded');

SET LOCAL ROLE authenticated;
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000bc01');
UPDATE public.athlete_crew_links SET revoked_at = now();
RESET ROLE;
SET LOCAL ROLE anon;
SELECT pg_temp.expect(public.crew_view((SELECT token FROM crew_tok)) IS NULL, 'a revoked link shows nothing');
RESET ROLE;


-- The weekly report: one per athlete and week, in their language, emailed
-- unless they opted out.
UPDATE auth.users SET raw_user_meta_data = '{"locale":"en"}' WHERE id = '00000000-0000-0000-0000-00000000bc03';
INSERT INTO public.readiness_checkins (user_id, mood, sleep, stress, energy, cognitive_load, score, created_at)
  VALUES ('00000000-0000-0000-0000-00000000bc03', 6, 6, 5, 6, 5, 61, date_trunc('week', now()) - interval '3 days');
INSERT INTO public.notification_preferences (user_id, email_performance)
  VALUES ('00000000-0000-0000-0000-00000000bc03', false)
  ON CONFLICT (user_id) DO UPDATE SET email_performance = false;
INSERT INTO public.athlete_sessions (user_id, session_date, kind, duration_minutes, rpe)
  VALUES ('00000000-0000-0000-0000-00000000bc01', date_trunc('week', current_date)::date - 3, 'training', 90, 8),
         ('00000000-0000-0000-0000-00000000bc01', date_trunc('week', current_date)::date - 10, 'training', 30, 5);
SELECT pg_temp.expect(public.performance_weekly_report() >= 2, 'the report goes to each active athlete');
SELECT pg_temp.expect(public.performance_weekly_report() = 0, 'and only once a week');
SELECT pg_temp.expect((SELECT title LIKE 'Votre semaine : charge %' AND body LIKE '%UA sur %séances%'
                              AND body LIKE '%Open de Rabat dans%' AND email_status = 'pending'
                              AND action_url = '/athlete-hub#pit'
                         FROM public.notifications
                        WHERE user_id = '00000000-0000-0000-0000-00000000bc01' AND type = 'performance'),
  'in French by default, with load, next competition and the pit wall link, emailed');
-- Last week (Mon-Sun) carries 720 AU or more, the week before 150: a spike.
SELECT pg_temp.expect((SELECT body LIKE '%' || chr(10) || 'À surveiller : forte hausse de la charge%'
                         FROM public.notifications
                        WHERE user_id = '00000000-0000-0000-0000-00000000bc01' AND type = 'performance'),
  'a load spike is the thing to watch');
SELECT pg_temp.expect((SELECT title LIKE 'Your week: load 0 AU, readiness 61' AND email_status IS NULL
                         FROM public.notifications
                        WHERE user_id = '00000000-0000-0000-0000-00000000bc03' AND type = 'performance'),
  'in English for an English user, in-app only after opting out of the email');
SELECT pg_temp.expect(NOT has_function_privilege('authenticated', 'public.performance_weekly_report()', 'EXECUTE'),
  'only the scheduler sends the report');


-- Squad: the link addressed to a coach's email shows on their board only.
INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-00000000bc04', 'karim@club.ma');
SET LOCAL ROLE authenticated;
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000bc01');
INSERT INTO public.athlete_crew_links (athlete_id, label, role, scopes, invite_email)
  VALUES ('00000000-0000-0000-0000-00000000bc01', 'Coach Karim', 'coach', ARRAY['readiness'], 'karim@club.ma');
SELECT pg_temp.raises($q$INSERT INTO public.athlete_crew_links (athlete_id, label, invite_email)
  VALUES ('00000000-0000-0000-0000-00000000bc01', 'x', 'Karim@Club.ma')$q$, 'invitation emails are stored in lower case');
SELECT set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-00000000bc04',
  'role', 'authenticated', 'email', 'Karim@Club.ma')::text, true);
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000bc04', true);
SELECT pg_temp.expect((SELECT count(*) = 1 FROM public.notifications
                        WHERE user_id = '00000000-0000-0000-0000-00000000bc04' AND type = 'performance'
                          AND action_url = '/athlete-hub#squad' AND email_status = 'pending'),
  'the invited coach is notified once, by email too');
SELECT pg_temp.expect((SELECT count(*) = 1 AND bool_and(label = 'Coach Karim') FROM public.crew_squad()),
  'the coach sees the athlete who invited them');
SELECT pg_temp.expect((SELECT (public.crew_view(token)) ? 'checkins' FROM public.crew_squad()),
  'and opens their read-only view');
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000bc03');
SELECT pg_temp.expect((SELECT count(*) = 0 FROM public.crew_squad()), 'nobody else does');
RESET ROLE;

ROLLBACK;
