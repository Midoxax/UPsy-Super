-- Admins have full access to operational tables, while clinical content
-- stays behind break-glass and evidence tables stay append-only.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000009ad', 'full-admin@test'),
  ('00000000-0000-0000-0000-0000000009c1', 'full-client@test');
INSERT INTO public.user_roles (user_id, role)
  VALUES ('00000000-0000-0000-0000-0000000009ad', 'admin') ON CONFLICT DO NOTHING;
INSERT INTO public.mood_entries (user_id, mood_score)
  VALUES ('00000000-0000-0000-0000-0000000009c1', 3);
INSERT INTO public.audit_log (action, resource_type)
  VALUES ('test', 'admin_full_access');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000009ad', true);

INSERT INTO public.specialties (name) VALUES ('Admin test specialty');
SELECT pg_temp.expect(
  (SELECT count(*) = 1 FROM public.specialties WHERE name = 'Admin test specialty'),
  'an admin can add reference data');

UPDATE public.profiles SET full_name = 'Renamed by admin'
  WHERE id = '00000000-0000-0000-0000-0000000009c1';
SELECT pg_temp.expect(
  (SELECT full_name = 'Renamed by admin' FROM public.profiles
     WHERE id = '00000000-0000-0000-0000-0000000009c1'),
  'an admin can edit any profile');

SELECT pg_temp.expect(
  (SELECT count(*) = 0 FROM public.mood_entries
     WHERE user_id = '00000000-0000-0000-0000-0000000009c1'),
  'clinical rows stay hidden from routine admin queries');

DO $$ BEGIN
  DELETE FROM public.audit_log WHERE resource_type = 'admin_full_access';
EXCEPTION WHEN insufficient_privilege THEN NULL; END $$;
RESET ROLE;
SELECT pg_temp.expect(
  (SELECT count(*) = 1 FROM public.audit_log WHERE resource_type = 'admin_full_access'),
  'an admin cannot delete audit entries');

ROLLBACK;
