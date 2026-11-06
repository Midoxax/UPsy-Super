-- Specialists and admins signed in with a password only (aal1) are refused
-- clinical and admin data; with a second factor (aal2) they keep their
-- access. Clients are unaffected.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;
CREATE FUNCTION pg_temp.as_user(_id uuid, _aal text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', _id::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', _id, 'aal', _aal)::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';
END $$;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000e0a1', 'mfa-admin@test'),
  ('00000000-0000-0000-0000-00000000e0b1', 'mfa-psy@test'),
  ('00000000-0000-0000-0000-00000000e0c1', 'mfa-client@test');
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-00000000e0a1', 'admin'),
  ('00000000-0000-0000-0000-00000000e0b1', 'psychologist')
ON CONFLICT DO NOTHING;
INSERT INTO public.psychologist_profiles (id, full_name, slug)
  VALUES ('00000000-0000-0000-0000-00000000e0b1', 'Dr MFA', 'dr-mfa');
INSERT INTO public.sessions (id, client_id, psychologist_id, date_time)
  VALUES ('00000000-0000-0000-0000-00000000e0e1', '00000000-0000-0000-0000-00000000e0c1',
          '00000000-0000-0000-0000-00000000e0b1', now());
INSERT INTO public.session_notes (session_id, psychologist_id, content)
  VALUES ('00000000-0000-0000-0000-00000000e0e1', '00000000-0000-0000-0000-00000000e0b1', 'note');

-- Specialist, password only: no notes, cannot write one.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000e0b1', 'aal1');
SELECT pg_temp.expect((SELECT count(*) FROM public.session_notes) = 0,
  'specialist without MFA cannot read session notes');
DO $$ BEGIN
  INSERT INTO public.session_notes (session_id, psychologist_id, content)
    VALUES ('00000000-0000-0000-0000-00000000e0e1', '00000000-0000-0000-0000-00000000e0b1', 'x');
  RAISE EXCEPTION 'FAILED: specialist without MFA wrote a note';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: specialist without MFA cannot write notes'; END $$;
RESET ROLE;

-- Specialist with MFA keeps access.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000e0b1', 'aal2');
SELECT pg_temp.expect((SELECT count(*) FROM public.session_notes) = 1,
  'specialist with MFA reads own notes');
RESET ROLE;

-- Admin, password only: own profile yes, other people's no.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000e0a1', 'aal1');
SELECT pg_temp.expect(
  (SELECT count(*) FROM public.profiles WHERE id = '00000000-0000-0000-0000-00000000e0a1') = 1
  AND (SELECT count(*) FROM public.profiles WHERE id = '00000000-0000-0000-0000-00000000e0c1') = 0,
  'admin without MFA sees only their own profile');
SELECT pg_temp.expect((SELECT count(*) FROM public.user_roles
  WHERE user_id = '00000000-0000-0000-0000-00000000e0a1') = 1,
  'admin without MFA can still read their roles (the app needs them to redirect)');
RESET ROLE;
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000e0a1', 'aal2');
SELECT pg_temp.expect(
  (SELECT count(*) FROM public.profiles WHERE id = '00000000-0000-0000-0000-00000000e0c1') = 1,
  'admin with MFA sees other profiles');
RESET ROLE;

-- Client, password only: unaffected.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000e0c1', 'aal1');
SELECT pg_temp.expect((SELECT count(*) FROM public.sessions) = 1,
  'client without MFA keeps access to their own sessions');
RESET ROLE;

ROLLBACK;
