-- Follow-up email sequences: who is enrolled (consent only, by source, in
-- the page's language), when the first email is due, what the sender sees
-- (applied, booked, profile pieces), the hand-over from recruitment to
-- onboarding, and that only admins and the sender can read any of it.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO anon, authenticated;

INSERT INTO public.growth_leads (email, full_name, source, consent_marketing, locale) VALUES
  ('Leila@Mail.ma', 'Leila Amrani', 'campaign_lsspm', true, 'ar'),
  ('noconsent@mail.ma', 'No Consent', 'campaign_lsspm', false, 'fr'),
  ('code@mail.ma', 'Code Seeker', 'campaign_b2c_first_session', true, 'en-US'),
  ('score@mail.ma', NULL, 'free_score', true, 'fr'),
  ('someone@upsy-test.invalid', 'Test', 'free_score', true, 'fr'),
  ('academy@mail.ma', 'Academy', 'campaign_academy', true, 'fr'),
  ('leila@mail.ma', 'Leila again', 'campaign_lsspm', true, 'fr');

SELECT pg_temp.expect((SELECT count(*) = 1 FROM public.nurture_enrolments
                        WHERE email = 'leila@mail.ma' AND sequence = 'lsspm'),
  'a consenting League lead is enrolled once, address lower-cased');
SELECT pg_temp.expect((SELECT lang = 'ar' AND next_at BETWEEN now() + interval '119 minutes' AND now() + interval '121 minutes'
                         FROM public.nurture_enrolments WHERE email = 'leila@mail.ma'),
  'in the page language, first email two hours later');
SELECT pg_temp.expect(NOT EXISTS (SELECT 1 FROM public.nurture_enrolments WHERE email = 'noconsent@mail.ma'),
  'no consent, no enrolment');
SELECT pg_temp.expect((SELECT sequence = 'free_score' AND lang = 'en' AND next_at <= now() + interval '5 minutes'
                         FROM public.nurture_enrolments WHERE email = 'code@mail.ma'),
  'a WELCOME20 request gets its code within minutes');
SELECT pg_temp.expect(NOT EXISTS (SELECT 1 FROM public.nurture_enrolments
                                   WHERE email IN ('someone@upsy-test.invalid', 'academy@mail.ma')),
  'test addresses and sources without a sequence are not enrolled');

-- The sender sees only what is due.
UPDATE public.nurture_enrolments SET next_at = now() - interval '1 minute'
 WHERE email IN ('leila@mail.ma', 'score@mail.ma');
SELECT pg_temp.expect((SELECT count(*) = 2 FROM public.nurture_due(50)),
  'only due emails are returned');
SELECT pg_temp.expect((SELECT NOT (flags->>'applied')::boolean FROM public.nurture_due(50) WHERE email = 'leila@mail.ma'),
  'not applied yet');

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000e0001', 'leila@mail.ma'),
  ('00000000-0000-0000-0000-0000000e0002', 'nurture-admin@mail.ma');
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-0000000e0002', 'admin') ON CONFLICT DO NOTHING;
INSERT INTO public.psychologist_applications (user_id, full_name, email, submitted_at, preferred_locale)
  VALUES ('00000000-0000-0000-0000-0000000e0001', 'Leila Amrani', 'Leila@mail.ma', now(), 'en');
SELECT pg_temp.expect((SELECT (flags->>'applied')::boolean FROM public.nurture_due(50) WHERE email = 'leila@mail.ma'),
  'a submitted application is seen, whatever the case of the address');

-- Accreditation: the account starts onboarding and recruitment ends.
INSERT INTO public.psychologist_profiles (id, full_name, slug)
  VALUES ('00000000-0000-0000-0000-0000000e0001', 'Leila Amrani', 'leila-amrani-nurture');
SELECT pg_temp.expect((SELECT status = 'converted' FROM public.nurture_enrolments
                        WHERE email = 'leila@mail.ma' AND sequence = 'lsspm'),
  'the League sequence ends when the account is created');
SELECT pg_temp.expect((SELECT lang = 'en' AND status = 'active' FROM public.nurture_enrolments
                        WHERE email = 'leila@mail.ma' AND sequence = 'onboarding'),
  'onboarding starts, in the language of the application');

UPDATE public.nurture_enrolments SET next_at = now() - interval '1 minute'
 WHERE email = 'leila@mail.ma' AND sequence = 'onboarding';
SELECT pg_temp.expect((SELECT NOT (flags->>'slots')::boolean AND NOT (flags->>'photo')::boolean
                         FROM public.nurture_due(50) WHERE sequence = 'onboarding'),
  'onboarding sees no slots and no photo yet');
INSERT INTO public.availability_slots (psychologist_id, day_of_week, start_time, end_time, is_available)
  VALUES ('00000000-0000-0000-0000-0000000e0001', 2, '09:00', '12:00', true);
SELECT pg_temp.expect((SELECT (flags->>'slots')::boolean FROM public.nurture_due(50) WHERE sequence = 'onboarding'),
  'open slots are seen, so that email is skipped');

-- Who can read it.
SET LOCAL ROLE anon;
SELECT pg_temp.expect(NOT has_function_privilege('anon', 'public.nurture_due(integer)', 'EXECUTE')
  AND NOT has_function_privilege('authenticated', 'public.nurture_due(integer)', 'EXECUTE'),
  'only the sender can list due emails');
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000e0001', true);
SELECT pg_temp.expect((SELECT count(*) = 0 FROM public.nurture_enrolments),
  'a user cannot read the enrolments, not even their own');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000e0002', true);
SELECT pg_temp.expect((SELECT count(*) >= 3 FROM public.nurture_enrolments),
  'an admin can read them');
RESET ROLE;

ROLLBACK;
