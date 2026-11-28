-- Publish on approval: the profile is filled from the approved application
-- (bio, rate, city, specialties, approaches, languages with the form's
-- French labels mapped, Darija and Tamazight kept), what the psychologist
-- already set is kept, only the server can run it, and the League notice
-- tells an unpublished member that publishing shows their badge.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;

-- The directory lists as in production (they were edited there, not seeded).
INSERT INTO public.specialties (name)
  SELECT v FROM unnest(ARRAY['Anxiety & Stress', 'Couples Therapy', 'Family Therapy', 'Depression']) v
   WHERE NOT EXISTS (SELECT 1 FROM public.specialties s WHERE s.name = v);
INSERT INTO public.therapy_approaches (name)
  SELECT v FROM unnest(ARRAY['CBT', 'Mindfulness']) v
   WHERE NOT EXISTS (SELECT 1 FROM public.therapy_approaches t WHERE t.name = v);
INSERT INTO public.languages (name)
  SELECT v FROM unnest(ARRAY['French', 'Arabic']) v
   WHERE NOT EXISTS (SELECT 1 FROM public.languages l WHERE l.name = v);

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000f0001', 'nadia-publish@mail.ma'),
  ('00000000-0000-0000-0000-0000000f0002', 'omar-publish@mail.ma');
INSERT INTO public.psychologist_profiles (id, full_name, slug, is_accredited, bio) VALUES
  ('00000000-0000-0000-0000-0000000f0001', 'Nadia Publish', 'nadia-publish', true, NULL),
  ('00000000-0000-0000-0000-0000000f0002', 'Omar Publish', 'omar-publish', true, 'Ma présentation, écrite par moi.');
INSERT INTO public.psychologist_applications
  (user_id, full_name, email, status, submitted_at, bio_long, desired_hourly_rate_mad, city,
   specialties_requested, therapy_approaches_requested, languages)
VALUES
  ('00000000-0000-0000-0000-0000000f0001', 'Nadia Publish', 'nadia-publish@mail.ma', 'approved', now(),
   'Psychologue clinicienne, j''accompagne les adultes anxieux.', 450, 'Rabat',
   ARRAY['Anxiété', 'Couple / Famille', 'TCC', 'Performance sportive'], ARRAY['MSPE / Pleine conscience'],
   ARRAY['Français', 'Darija', 'Berbère', 'Italien']),
  ('00000000-0000-0000-0000-0000000f0002', 'Omar Publish', 'omar-publish@mail.ma', 'approved', now(),
   'Texte du dossier', 500, 'Fès', ARRAY['Dépression'], ARRAY[]::text[], ARRAY['Arabe']);

SELECT public.psychologist_prefill_from_application('00000000-0000-0000-0000-0000000f0001');
SELECT public.psychologist_prefill_from_application('00000000-0000-0000-0000-0000000f0002');

SELECT pg_temp.expect((SELECT bio LIKE 'Psychologue clinicienne%' AND hourly_rate_mad = 450 AND city = 'Rabat'
                         FROM public.psychologist_profiles WHERE id = '00000000-0000-0000-0000-0000000f0001'),
  'bio, rate and city come from the application');
SELECT pg_temp.expect((SELECT bio = 'Ma présentation, écrite par moi.' AND hourly_rate_mad = 500
                         FROM public.psychologist_profiles WHERE id = '00000000-0000-0000-0000-0000000f0002'),
  'what the psychologist wrote is kept; missing fields are filled');
SELECT pg_temp.expect((SELECT array_agg(s.name ORDER BY s.name) = ARRAY['Anxiety & Stress', 'Couples Therapy', 'Family Therapy']
                         FROM public.psychologist_specialties ps JOIN public.specialties s ON s.id = ps.specialty_id
                        WHERE ps.psychologist_id = '00000000-0000-0000-0000-0000000f0001'),
  'French specialty labels map to the directory list; unmapped ones are left out');
SELECT pg_temp.expect((SELECT array_agg(t.name ORDER BY t.name) = ARRAY['CBT', 'Mindfulness']
                         FROM public.psychologist_therapy_approaches pa JOIN public.therapy_approaches t ON t.id = pa.therapy_approach_id
                        WHERE pa.psychologist_id = '00000000-0000-0000-0000-0000000f0001'),
  'approaches, including TCC ticked among specialties');
SELECT pg_temp.expect((SELECT array_agg(l.name ORDER BY l.name) = ARRAY['Darija', 'French', 'Tamazight']
                         FROM public.psychologist_languages pl JOIN public.languages l ON l.id = pl.language_id
                        WHERE pl.psychologist_id = '00000000-0000-0000-0000-0000000f0001'),
  'Darija and Tamazight (Berbère) are kept as languages');
SELECT public.psychologist_prefill_from_application('00000000-0000-0000-0000-0000000f0001');
SELECT pg_temp.expect((SELECT count(*) = 3 FROM public.psychologist_specialties
                        WHERE psychologist_id = '00000000-0000-0000-0000-0000000f0001'),
  'running it again changes nothing');

SELECT pg_temp.expect(NOT has_function_privilege('anon', 'public.psychologist_prefill_from_application(uuid)', 'EXECUTE')
  AND NOT has_function_privilege('authenticated', 'public.psychologist_prefill_from_application(uuid)', 'EXECUTE'),
  'only the server can prepare a profile');

-- At approval the profile is created before the application is marked
-- approved: the seeding trigger maps the labels too.
INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-0000000f0003', 'samir-publish@mail.ma');
INSERT INTO public.psychologist_applications (full_name, email, status, submitted_at, specialties_requested, languages)
  VALUES ('Samir Publish', 'samir-publish@mail.ma', 'pending', now(), ARRAY['Dépression'], ARRAY['Darija']);
INSERT INTO public.psychologist_profiles (id, full_name, slug)
  VALUES ('00000000-0000-0000-0000-0000000f0003', 'Samir Publish', 'samir-publish');
SELECT pg_temp.expect(
  EXISTS (SELECT 1 FROM public.psychologist_specialties ps JOIN public.specialties s ON s.id = ps.specialty_id
           WHERE ps.psychologist_id = '00000000-0000-0000-0000-0000000f0003' AND s.name = 'Depression')
  AND EXISTS (SELECT 1 FROM public.psychologist_languages pl JOIN public.languages l ON l.id = pl.language_id
               WHERE pl.psychologist_id = '00000000-0000-0000-0000-0000000f0003' AND l.name = 'Darija'),
  'a new profile keeps the application''s specialties and languages');

-- The League notice and the badge.
INSERT INTO public.league_memberships (id, user_id, plan_id, status, member_number, starts_on, ends_on)
  SELECT '00000000-0000-0000-0000-0000000f0101', '00000000-0000-0000-0000-0000000f0001', id, 'pending',
         'LSSPM-TEST-01', current_date, make_date(extract(year FROM current_date)::int, 12, 31)
    FROM public.league_membership_plans WHERE code = 'praticien';
UPDATE public.league_memberships SET status = 'active' WHERE id = '00000000-0000-0000-0000-0000000f0101';
SELECT pg_temp.expect((SELECT body LIKE '%badge LSSPM apparaîtra%' FROM public.notifications
                        WHERE user_id = '00000000-0000-0000-0000-0000000f0001' AND type = 'league'
                        ORDER BY created_at DESC LIMIT 1),
  'an unpublished member is told publishing shows the badge');

INSERT INTO public.availability_slots (psychologist_id, day_of_week, start_time, end_time, is_available)
  VALUES ('00000000-0000-0000-0000-0000000f0002', 3, '09:00', '12:00', true);
UPDATE public.psychologist_profiles
   SET bio = 'Psychologue clinicien à Fès, j''accompagne adultes et adolescents dans les moments difficiles.'
 WHERE id = '00000000-0000-0000-0000-0000000f0002';
UPDATE public.psychologist_profiles SET is_published = true WHERE id = '00000000-0000-0000-0000-0000000f0002';
INSERT INTO public.league_memberships (id, user_id, plan_id, status, member_number, starts_on, ends_on)
  SELECT '00000000-0000-0000-0000-0000000f0102', '00000000-0000-0000-0000-0000000f0002', id, 'pending',
         'LSSPM-TEST-02', current_date, make_date(extract(year FROM current_date)::int, 12, 31)
    FROM public.league_membership_plans WHERE code = 'praticien';
UPDATE public.league_memberships SET status = 'active' WHERE id = '00000000-0000-0000-0000-0000000f0102';
SELECT pg_temp.expect((SELECT body NOT LIKE '%badge LSSPM apparaîtra%' FROM public.notifications
                        WHERE user_id = '00000000-0000-0000-0000-0000000f0002' AND type = 'league'
                        ORDER BY created_at DESC LIMIT 1),
  'a published member is not');
SELECT pg_temp.expect((SELECT array_agg(x) = ARRAY['00000000-0000-0000-0000-0000000f0002'::uuid]
                         FROM public.league_member_badges(ARRAY['00000000-0000-0000-0000-0000000f0001'::uuid,
                                                                '00000000-0000-0000-0000-0000000f0002'::uuid]) x),
  'the badge shows only on the published profile');

ROLLBACK;
