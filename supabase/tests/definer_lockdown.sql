-- Behaviour test for 20261028090000_lock_down_definer_functions.sql.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;

SELECT pg_temp.expect(NOT has_function_privilege('anon', 'public.create_admin_user(text, text)', 'EXECUTE')
  AND NOT has_function_privilege('authenticated', 'public.create_admin_user(text, text)', 'EXECUTE'),
  'nobody but the service role can create an admin');
SELECT pg_temp.expect(NOT has_function_privilege('anon', 'public.read_email_batch(text, integer, integer)', 'EXECUTE')
  AND NOT has_function_privilege('authenticated', 'public.enqueue_email(text, jsonb)', 'EXECUTE'),
  'the email queue is closed to clients');
SELECT pg_temp.expect(has_function_privilege('service_role', 'public.enqueue_email(text, jsonb)', 'EXECUTE'),
  'edge functions can still queue email');
SELECT pg_temp.expect(NOT has_function_privilege('anon', 'public.compute_mps(uuid)', 'EXECUTE'),
  'anon cannot compute a score');

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000e101', 'one@lock.test'),
  ('00000000-0000-0000-0000-00000000e102', 'two@lock.test');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000e101', true);
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000e101","role":"authenticated"}', true);
SELECT pg_temp.expect(public.compute_mps('00000000-0000-0000-0000-00000000e101') IS NOT NULL,
  'a user gets their own score');
DO $$ BEGIN
  PERFORM public.compute_mps('00000000-0000-0000-0000-00000000e102');
  RAISE EXCEPTION 'FAILED: read another user''s score';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM LIKE 'FAILED%' THEN RAISE; END IF;
  RAISE NOTICE 'ok: no score for someone else';
END $$;
DO $$ BEGIN
  PERFORM public.purge_app_logs();
  RAISE EXCEPTION 'FAILED: non-admin purged logs';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM LIKE 'FAILED%' THEN RAISE; END IF;
  RAISE NOTICE 'ok: only admins purge logs';
END $$;

ROLLBACK;
