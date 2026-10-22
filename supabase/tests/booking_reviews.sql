-- Behaviour test for 20261022120000_booking_reviews.sql.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000d101', 'client@rev.test'),
  ('00000000-0000-0000-0000-00000000d102', 'psy@rev.test'),
  ('00000000-0000-0000-0000-00000000d103', 'other@rev.test');
INSERT INTO public.psychologist_profiles (id, full_name) VALUES ('00000000-0000-0000-0000-00000000d102', 'Dr Rev');
-- Inserted as the superuser, so the booking guards (which act for the
-- signed-in patient) do not apply; statuses set directly.
INSERT INTO public.bookings (id, patient_id, psychologist_id, scheduled_at, duration_minutes, session_type, status) VALUES
  ('00000000-0000-0000-0000-00000000d201', '00000000-0000-0000-0000-00000000d101', '00000000-0000-0000-0000-00000000d102', now() - interval '2 days', 50, 'video', 'confirmed'),
  ('00000000-0000-0000-0000-00000000d202', '00000000-0000-0000-0000-00000000d101', '00000000-0000-0000-0000-00000000d102', now() + interval '2 days', 50, 'video', 'confirmed');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000d101', true);

INSERT INTO public.reviews (booking_id, psychologist_id, client_id, rating, comment)
VALUES ('00000000-0000-0000-0000-00000000d201', '00000000-0000-0000-0000-00000000d102',
        '00000000-0000-0000-0000-00000000d101', 5, 'Très à l''écoute');
SELECT pg_temp.expect(true, 'client reviews a session that took place');

DO $$ BEGIN
  INSERT INTO public.reviews (booking_id, psychologist_id, client_id, rating)
  VALUES ('00000000-0000-0000-0000-00000000d202', '00000000-0000-0000-0000-00000000d102',
          '00000000-0000-0000-0000-00000000d101', 1);
  RAISE EXCEPTION 'FAILED: reviewed a session that has not happened';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: no review before the session'; END $$;

DO $$ BEGIN
  INSERT INTO public.reviews (booking_id, psychologist_id, client_id, rating)
  VALUES ('00000000-0000-0000-0000-00000000d201', '00000000-0000-0000-0000-00000000d102',
          '00000000-0000-0000-0000-00000000d101', 1);
  RAISE EXCEPTION 'FAILED: reviewed the same session twice';
EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'ok: one review per session'; END $$;

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000d103', true);
DO $$ BEGIN
  INSERT INTO public.reviews (booking_id, psychologist_id, client_id, rating)
  VALUES ('00000000-0000-0000-0000-00000000d201', '00000000-0000-0000-0000-00000000d102',
          '00000000-0000-0000-0000-00000000d103', 1);
  RAISE EXCEPTION 'FAILED: reviewed someone else''s session';
EXCEPTION WHEN insufficient_privilege OR unique_violation THEN RAISE NOTICE 'ok: only the patient reviews'; END $$;

-- Anyone can read it, without the reviewer's identity.
RESET ROLE;
SET LOCAL ROLE anon;
SELECT pg_temp.expect((SELECT count(*) FROM public.psychologist_reviews('00000000-0000-0000-0000-00000000d102')) = 1,
  'the public sees the review');
SELECT pg_temp.expect((SELECT n FROM public.psychologist_rating('00000000-0000-0000-0000-00000000d102')) = 1
  AND (SELECT avg_rating FROM public.psychologist_rating('00000000-0000-0000-0000-00000000d102')) = 5.0,
  'and the rating');

ROLLBACK;
