-- Behaviour test for 20261020110000_ops_admin_access.sql.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000003a1', 'owner@test'),
  ('00000000-0000-0000-0000-0000000003ad', 'admin@test'),
  ('00000000-0000-0000-0000-0000000003b1', 'stranger@test');
INSERT INTO public.user_roles (user_id, role)
  VALUES ('00000000-0000-0000-0000-0000000003ad', 'admin') ON CONFLICT DO NOTHING;
INSERT INTO public.ops_workspaces (id, name, slug, created_by)
  VALUES ('00000000-0000-0000-0000-0000000003f1', 'Ops', 'ops-test', '00000000-0000-0000-0000-0000000003a1');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000003ad', true);
SELECT pg_temp.expect((SELECT count(*) FROM public.ops_workspaces WHERE slug = 'ops-test') = 1,
  'admin sees a workspace without being a member');
SELECT pg_temp.expect(public.ops_workspace_role('00000000-0000-0000-0000-0000000003ad',
  '00000000-0000-0000-0000-0000000003f1') = 'director', 'admin acts as director');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000003b1', true);
SELECT pg_temp.expect((SELECT count(*) FROM public.ops_workspaces WHERE slug = 'ops-test') = 0,
  'non-members still see nothing');
RESET ROLE;
ROLLBACK;
