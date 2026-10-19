-- Behaviour test for 20261020090000_break_glass_files_and_activity.sql.
\set ON_ERROR_STOP 1
BEGIN;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000001a0', 'admin@test'),
  ('00000000-0000-0000-0000-0000000001c0', 'client@test'),
  ('00000000-0000-0000-0000-0000000001d0', 'other@test');
INSERT INTO public.user_roles (user_id, role)
  VALUES ('00000000-0000-0000-0000-0000000001a0', 'admin') ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name) VALUES ('user-documents', 'user-documents') ON CONFLICT DO NOTHING;
INSERT INTO storage.objects (bucket_id, name, metadata) VALUES
  ('user-documents', '00000000-0000-0000-0000-0000000001c0/report.pdf', '{"size": 1200}'),
  ('user-documents', '00000000-0000-0000-0000-0000000001d0/other.pdf', '{"size": 900}');
INSERT INTO public.assessments (id, title) VALUES ('00000000-0000-0000-0000-0000000001f0', 'GAD-7');
INSERT INTO public.assessment_results (user_id, assessment_id, total_score)
  VALUES ('00000000-0000-0000-0000-0000000001c0', '00000000-0000-0000-0000-0000000001f0', 17);

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000001a0', true);
SET LOCAL ROLE authenticated;

-- Activity view: dates only, no scores.
SELECT pg_temp.expect(
  jsonb_array_length(public.admin_user_activity('00000000-0000-0000-0000-0000000001c0')->'recent_assessments') = 1,
  'activity view still lists the questionnaire');
SELECT pg_temp.expect(
  NOT (public.admin_user_activity('00000000-0000-0000-0000-0000000001c0')->'recent_assessments'->0 ? 'total_score'),
  'activity view no longer shows the score');

-- Files: nothing without break-glass.
SELECT pg_temp.expect((SELECT count(*) FROM storage.objects WHERE bucket_id = 'user-documents') = 0,
  'admin cannot list user files');
DO $$ BEGIN
  PERFORM public.admin_break_glass_files('00000000-0000-0000-0000-0000000001c0', 'short');
  RAISE EXCEPTION 'FAILED: short reason accepted';
EXCEPTION WHEN invalid_parameter_value THEN RAISE NOTICE 'ok: short reason refused'; END $$;

-- With a reason: the folder is listed, audited, and readable; others are not.
SELECT pg_temp.expect(
  jsonb_array_length(public.admin_break_glass_files('00000000-0000-0000-0000-0000000001c0',
    'client asked support to retrieve a lost report')) = 1,
  'break-glass lists the client''s files');
RESET ROLE;
SELECT pg_temp.expect((SELECT count(*) FROM public.audit_log WHERE action = 'break_glass.read'
  AND record_ref = 'user-documents:00000000-0000-0000-0000-0000000001c0'
  AND metadata->>'reason' LIKE 'client asked%') = 1, 'file access audited with the reason');
SET LOCAL ROLE authenticated;
SELECT pg_temp.expect((SELECT count(*) FROM storage.objects WHERE bucket_id = 'user-documents'
  AND name LIKE '00000000-0000-0000-0000-0000000001c0/%') = 1, 'admin can then read that folder');
SELECT pg_temp.expect((SELECT count(*) FROM storage.objects WHERE bucket_id = 'user-documents'
  AND name LIKE '00000000-0000-0000-0000-0000000001d0/%') = 0, 'other folders stay closed');

-- Non-admins cannot use it.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000001d0', true);
DO $$ BEGIN
  PERFORM public.admin_break_glass_files('00000000-0000-0000-0000-0000000001c0', 'trying to read someone else');
  RAISE EXCEPTION 'FAILED: non-admin used break-glass';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: non-admin refused'; END $$;
SELECT pg_temp.expect((SELECT count(*) FROM storage.objects
  WHERE name LIKE '00000000-0000-0000-0000-0000000001c0/%') = 0, 'non-admin cannot read the client''s folder');
RESET ROLE;

-- The access window closes after 15 minutes. (audit_log is append-only, so
-- age the row with triggers paused; the whole test rolls back.)
SET LOCAL session_replication_role = replica;
UPDATE public.audit_log SET created_at = now() - interval '16 minutes'
  WHERE record_ref = 'user-documents:00000000-0000-0000-0000-0000000001c0';
SET LOCAL session_replication_role = origin;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000001a0', true);
SET LOCAL ROLE authenticated;
SELECT pg_temp.expect((SELECT count(*) FROM storage.objects
  WHERE name LIKE '00000000-0000-0000-0000-0000000001c0/%') = 0, 'access expires after 15 minutes');
RESET ROLE;

-- Production columns exist.
SELECT pg_temp.expect((SELECT count(*) FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'data_subject_requests'
    AND column_name IN ('channel','evidence','export_bytes','exported_at','reference',
                        'requested_changes','resolution','verified_at')) = 8,
  'data_subject_requests matches production');
ROLLBACK;
