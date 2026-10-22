-- Behaviour test for 20261022110000_content_automation.sql.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000c101', 'admin@auto.test'),
  ('00000000-0000-0000-0000-00000000c102', 'user@auto.test');
INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-00000000c101', 'admin');

SELECT pg_temp.expect((SELECT count(*) FROM public.automation_settings) = 1, 'settings row exists');

-- Anonymous sign-up is pending until confirmed, and reveals nothing.
SET LOCAL ROLE anon;
SELECT public.newsletter_subscribe('  Reader@Example.MA ', 'fr', 'blog');
DO $$ BEGIN
  PERFORM public.newsletter_subscribe('not-an-email', 'fr', 'blog');
  RAISE EXCEPTION 'FAILED: accepted an invalid address';
EXCEPTION WHEN invalid_parameter_value THEN RAISE NOTICE 'ok: invalid address refused'; END $$;
DO $$ BEGIN
  PERFORM count(*) FROM public.newsletter_subscribers;
  RAISE EXCEPTION 'FAILED: anon read the subscriber list';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: anon cannot read subscribers'; END $$;
RESET ROLE;

SELECT pg_temp.expect((SELECT status FROM public.newsletter_subscribers WHERE email = 'reader@example.ma') = 'pending',
  'new sign-up is pending, address normalised');

SET LOCAL ROLE anon;
SELECT pg_temp.expect(public.newsletter_confirm('no-such-token') = false, 'unknown token confirms nothing');
RESET ROLE;
SELECT set_config('test.tok', confirm_token, true) FROM public.newsletter_subscribers WHERE email = 'reader@example.ma';
SET LOCAL ROLE anon;
SELECT pg_temp.expect(public.newsletter_confirm(current_setting('test.tok')), 'token confirms');
RESET ROLE;
SELECT pg_temp.expect((SELECT status FROM public.newsletter_subscribers WHERE email = 'reader@example.ma') = 'subscribed',
  'confirmed reader is subscribed');

-- Only admins see automation tables and monitoring.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c102', true);
SELECT pg_temp.expect((SELECT count(*) FROM public.newsletter_subscribers) = 0, 'a user sees no subscribers');
DO $$ BEGIN
  PERFORM public.admin_email_health();
  RAISE EXCEPTION 'FAILED: user read email health';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: email health is admin-only'; END $$;

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c101', true);
SELECT pg_temp.expect((SELECT count(*) FROM public.newsletter_subscribers) >= 1, 'admin sees subscribers');
SELECT pg_temp.expect(public.admin_email_health() ? 'by_status', 'admin reads email health');
SELECT pg_temp.expect((SELECT count(*) >= 0 FROM public.admin_cron_status()), 'admin reads cron status');

ROLLBACK;
