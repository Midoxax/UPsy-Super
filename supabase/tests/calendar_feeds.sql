-- Behaviour test for 20261020150000_calendar_feeds.sql.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000007a1', 'a@feed.test'),
  ('00000000-0000-0000-0000-0000000007a2', 'b@feed.test');
INSERT INTO public.calendar_feeds (user_id) VALUES ('00000000-0000-0000-0000-0000000007a2');

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000007a1', true);
SET LOCAL ROLE authenticated;
INSERT INTO public.calendar_feeds (user_id) VALUES ('00000000-0000-0000-0000-0000000007a1');
SELECT pg_temp.expect((SELECT length(token) FROM public.calendar_feeds) = 64,
  'a user gets one 64-char secret token');
SELECT pg_temp.expect((SELECT count(*) FROM public.calendar_feeds) = 1,
  'other users'' tokens are invisible');
DO $$ BEGIN
  INSERT INTO public.calendar_feeds (user_id) VALUES ('00000000-0000-0000-0000-0000000007a2');
  RAISE EXCEPTION 'FAILED: created a feed for someone else';
EXCEPTION WHEN insufficient_privilege OR unique_violation THEN RAISE NOTICE 'ok: cannot create a feed for someone else'; END $$;
SELECT pg_temp.expect((SELECT count(*) FROM public.booking_emails) = 0,
  'booking email log is not readable by users');
RESET ROLE;
ROLLBACK;
