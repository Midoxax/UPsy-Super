-- Behaviour test for 20261020140000_onboarding_profile.sql.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-0000000006a1', 'New.Psy@Onboard.test');
INSERT INTO public.specialties (id, name) VALUES ('00000000-0000-0000-0000-0000000006f1', 'Performance Onboard');
INSERT INTO public.psychologist_applications
  (email, full_name, status, city, bio_long, desired_hourly_rate_mad, offers_online, offers_in_person, specialties_requested)
VALUES ('new.psy@onboard.test', 'New Psy', 'approved', 'Tanger', repeat('Experienced sport psychologist. ', 4),
        550, true, true, ARRAY['performance onboard']);

-- What provision-psychologist inserts:
INSERT INTO public.psychologist_profiles (id, full_name, is_accredited, is_published)
  VALUES ('00000000-0000-0000-0000-0000000006a1', 'New Psy', true, false);

SELECT pg_temp.expect((SELECT city = 'Tanger' AND hourly_rate_mad = 550 AND offers_in_person AND length(bio) > 80
  FROM public.psychologist_profiles WHERE id = '00000000-0000-0000-0000-0000000006a1'),
  'profile starts from the application (city, rate, modes, bio)');
SELECT pg_temp.expect(EXISTS (SELECT 1 FROM public.psychologist_specialties
  WHERE psychologist_id = '00000000-0000-0000-0000-0000000006a1' AND specialty_id = '00000000-0000-0000-0000-0000000006f1'),
  'specialties are matched by name, case-insensitively');
SELECT pg_temp.expect((SELECT user_id FROM public.psychologist_applications WHERE email = 'new.psy@onboard.test')
  = '00000000-0000-0000-0000-0000000006a1', 'application is linked to the account');

-- Publishing without weekly hours is refused, then allowed once they exist.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000006a1', true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  UPDATE public.psychologist_profiles SET is_published = true WHERE id = '00000000-0000-0000-0000-0000000006a1';
  RAISE EXCEPTION 'FAILED: published without hours';
EXCEPTION WHEN check_violation THEN RAISE NOTICE 'ok: publishing without hours refused (%)', SQLERRM; END $$;
RESET ROLE;
INSERT INTO public.availability_slots (psychologist_id, day_of_week, start_time, end_time, is_available)
  VALUES ('00000000-0000-0000-0000-0000000006a1', 1, '09:00', '12:00', true);
SET LOCAL ROLE authenticated;
UPDATE public.psychologist_profiles SET is_published = true WHERE id = '00000000-0000-0000-0000-0000000006a1';
RESET ROLE;
SELECT pg_temp.expect((SELECT is_published FROM public.psychologist_profiles WHERE id = '00000000-0000-0000-0000-0000000006a1'),
  'a complete profile can be published');
ROLLBACK;
