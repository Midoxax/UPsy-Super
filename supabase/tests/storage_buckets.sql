-- Behaviour test for 20261020100000_storage_buckets_baseline.sql.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

SELECT pg_temp.expect((SELECT count(*) FROM storage.buckets
  WHERE id IN ('user-documents','accreditation-docs','psychologist-photos','email-assets')) = 4,
  'all four buckets exist');
SELECT pg_temp.expect((SELECT public FROM storage.buckets WHERE id = 'email-assets'),
  'email-assets is public, so the logo in auth emails loads');
SELECT pg_temp.expect(NOT (SELECT public FROM storage.buckets WHERE id = 'user-documents'),
  'user-documents is private');

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000002a1', 'u1@test'),
  ('00000000-0000-0000-0000-0000000002a2', 'u2@test'),
  ('00000000-0000-0000-0000-0000000002ad', 'admin@test');
INSERT INTO public.user_roles (user_id, role)
  VALUES ('00000000-0000-0000-0000-0000000002ad', 'admin') ON CONFLICT DO NOTHING;

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000002a1', true);
SET LOCAL ROLE authenticated;
INSERT INTO storage.objects (bucket_id, name)
  VALUES ('user-documents', '00000000-0000-0000-0000-0000000002a1/report.pdf');
SELECT pg_temp.expect((SELECT count(*) FROM storage.objects WHERE bucket_id = 'user-documents') = 1,
  'a user uploads to and reads their own folder');
DO $$ BEGIN
  INSERT INTO storage.objects (bucket_id, name)
    VALUES ('user-documents', '00000000-0000-0000-0000-0000000002a2/x.pdf');
  RAISE EXCEPTION 'FAILED: wrote into another user''s folder';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: another user''s folder is refused'; END $$;

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000002a2', true);
SELECT pg_temp.expect((SELECT count(*) FROM storage.objects WHERE bucket_id = 'user-documents') = 0,
  'other users cannot see the file');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000002ad', true);
SELECT pg_temp.expect((SELECT count(*) FROM storage.objects WHERE bucket_id = 'user-documents') = 0,
  'admins cannot see it without break-glass');
RESET ROLE;
ROLLBACK;
