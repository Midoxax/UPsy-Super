-- Behaviour test for 20261019190000_break_glass_clinical_access.sql.
-- Runs against a database with every migration applied (see
-- scripts/test-migrations.sh). Any failed expectation raises and aborts.
\set ON_ERROR_STOP 1
BEGIN;

-- Fixtures (as the table owner, so RLS does not apply while seeding).
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000000a', 'admin@test'),
  ('00000000-0000-0000-0000-00000000000b', 'psy@test'),
  ('00000000-0000-0000-0000-00000000000c', 'client@test'),
  ('00000000-0000-0000-0000-00000000000d', 'other@test');
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-00000000000a', 'admin')
ON CONFLICT DO NOTHING;
INSERT INTO public.psychologist_profiles (id, full_name, slug)
  VALUES ('00000000-0000-0000-0000-00000000000b', 'Dr Test', 'dr-test');
INSERT INTO public.sessions (id, client_id, psychologist_id, date_time)
  VALUES ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-00000000000c',
          '00000000-0000-0000-0000-00000000000b', now());
INSERT INTO public.session_notes (session_id, psychologist_id, content)
  VALUES ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-00000000000b', 'confidential note');
INSERT INTO public.assessments (id, title) VALUES ('00000000-0000-0000-0000-0000000000f1', 'PHQ-9');
INSERT INTO public.assessment_results (user_id, assessment_id)
  VALUES ('00000000-0000-0000-0000-00000000000c', '00000000-0000-0000-0000-0000000000f1');
INSERT INTO public.crisis_alerts (client_id, alert_type)
  VALUES ('00000000-0000-0000-0000-00000000000c', 'test');

CREATE FUNCTION pg_temp.as_user(_id uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', _id::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  EXECUTE 'SET LOCAL ROLE authenticated';
END $$;
CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

-- Admin: no routine access to clinical content, crisis alerts still visible.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
SELECT pg_temp.expect((SELECT count(*) FROM public.session_notes) = 0, 'admin cannot list session notes');
SELECT pg_temp.expect((SELECT count(*) FROM public.assessment_results) = 0, 'admin cannot list assessment results');
SELECT pg_temp.expect((SELECT count(*) FROM public.sessions) = 0, 'admin cannot list sessions');
SELECT pg_temp.expect((SELECT count(*) FROM public.crisis_alerts) = 1, 'admin still sees crisis alerts');
SELECT pg_temp.expect((SELECT sum(total) FROM public.admin_session_counts()) = 1, 'admin overview still counts sessions');

-- Break-glass: refused without a real reason or for unknown tables.
DO $$ BEGIN
  PERFORM public.admin_break_glass_read('session_notes', '00000000-0000-0000-0000-00000000000c', 'short');
  RAISE EXCEPTION 'FAILED: short reason accepted';
EXCEPTION WHEN invalid_parameter_value THEN RAISE NOTICE 'ok: short reason refused'; END $$;
DO $$ BEGIN
  PERFORM public.admin_break_glass_read('profiles', '00000000-0000-0000-0000-00000000000c', 'client asked for a copy by email');
  RAISE EXCEPTION 'FAILED: unlisted table accepted';
EXCEPTION WHEN invalid_parameter_value THEN RAISE NOTICE 'ok: unlisted table refused'; END $$;

-- Break-glass with a reason returns the client's rows and is audited.
SELECT pg_temp.expect(
  jsonb_array_length(public.admin_break_glass_read('session_notes', '00000000-0000-0000-0000-00000000000c',
    'client asked for a copy by email')) = 1, 'break-glass returns the note');
SELECT pg_temp.expect(
  jsonb_array_length(public.admin_break_glass_read('assessment_results', '00000000-0000-0000-0000-00000000000d',
    'checking a reported display issue')) = 0, 'break-glass scoped to the named client');
RESET ROLE;
SELECT pg_temp.expect((SELECT count(*) FROM public.audit_log WHERE action = 'break_glass.read'
  AND metadata->>'reason' = 'client asked for a copy by email'
  AND subject_id = '00000000-0000-0000-0000-00000000000c') = 1, 'access written to the audit log with its reason');

-- Specialist and client keep their own access; others are refused.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
SELECT pg_temp.expect((SELECT count(*) FROM public.session_notes) = 1, 'specialist still reads own notes');
DO $$ BEGIN
  PERFORM public.admin_break_glass_read('session_notes', '00000000-0000-0000-0000-00000000000c', 'not an admin, should fail');
  RAISE EXCEPTION 'FAILED: non-admin used break-glass';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: non-admin refused'; END $$;
DO $$ BEGIN
  PERFORM public.admin_session_counts();
  RAISE EXCEPTION 'FAILED: non-admin read session counts';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: counts refused to non-admin'; END $$;
RESET ROLE;
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
SELECT pg_temp.expect((SELECT count(*) FROM public.assessment_results) = 1, 'client still reads own results');
RESET ROLE;

ROLLBACK;
