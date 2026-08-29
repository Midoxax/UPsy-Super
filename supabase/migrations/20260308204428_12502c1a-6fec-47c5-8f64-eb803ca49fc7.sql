
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.seed_sample_psychologists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  uid1 uuid := gen_random_uuid();
  uid2 uuid := gen_random_uuid();
  uid3 uuid := gen_random_uuid();
BEGIN
  -- Create auth users
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at, updated_at)
  VALUES
    (uid1, '00000000-0000-0000-0000-000000000000', 'amina.benali@upsy-sample.com', extensions.crypt('SamplePass123!', extensions.gen_salt('bf')), now(), '{"full_name":"Dr. Amina Benali"}'::jsonb, 'authenticated', 'authenticated', now(), now()),
    (uid2, '00000000-0000-0000-0000-000000000000', 'youssef.elamrani@upsy-sample.com', extensions.crypt('SamplePass123!', extensions.gen_salt('bf')), now(), '{"full_name":"Dr. Youssef El Amrani"}'::jsonb, 'authenticated', 'authenticated', now(), now()),
    (uid3, '00000000-0000-0000-0000-000000000000', 'salma.tazi@upsy-sample.com', extensions.crypt('SamplePass123!', extensions.gen_salt('bf')), now(), '{"full_name":"Dr. Salma Tazi"}'::jsonb, 'authenticated', 'authenticated', now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- Create psychologist profiles
  INSERT INTO psychologist_profiles (id, full_name, slug, bio, city, hourly_rate_mad, offers_online, offers_in_person, is_accredited, is_published, gender)
  VALUES
    (uid1, 'Dr. Amina Benali', 'dr-amina-benali-' || substring(uid1::text from 1 for 8), 'Clinical psychologist specializing in anxiety, stress management, and cognitive behavioral therapy. Over 10 years of experience helping individuals navigate life challenges with evidence-based approaches.', 'Casablanca', 500, true, true, true, true, 'female'),
    (uid2, 'Dr. Youssef El Amrani', 'dr-youssef-el-amrani-' || substring(uid2::text from 1 for 8), 'Sport psychologist and performance coach working with elite athletes and teams across Morocco. Expertise in mental readiness, competition anxiety, and resilience training.', 'Rabat', 600, true, false, true, true, 'male'),
    (uid3, 'Dr. Salma Tazi', 'dr-salma-tazi-' || substring(uid3::text from 1 for 8), 'Specialist in couples therapy, family dynamics, and relationship counseling. Bilingual practice in French and Arabic with a warm, client-centered approach.', 'Marrakech', 450, true, true, false, true, 'female')
  ON CONFLICT (id) DO NOTHING;

  -- Assign psychologist roles
  INSERT INTO user_roles (user_id, role) VALUES (uid1, 'psychologist'), (uid2, 'psychologist'), (uid3, 'psychologist') ON CONFLICT (user_id, role) DO NOTHING;

  -- Specialties
  INSERT INTO psychologist_specialties (psychologist_id, specialty_id) VALUES
    (uid1, '880bc86f-d175-40af-9cae-b1fe0ca95fc5'),
    (uid1, '8feb075c-9c32-4598-9531-98535d2c8e4f'),
    (uid1, 'f13906b6-34af-4ef1-8288-197e525115b2'),
    (uid2, '880bc86f-d175-40af-9cae-b1fe0ca95fc5'),
    (uid3, '55fb1b79-3b79-4bfa-897e-94e73625e403'),
    (uid3, 'b1ba24f7-6e6a-43d3-a0cc-2dead4919941')
  ON CONFLICT DO NOTHING;

  -- Languages
  INSERT INTO psychologist_languages (psychologist_id, language_id) VALUES
    (uid1, 'ee49ed2b-1966-4c41-91fd-3065bb036f28'),
    (uid1, '62570139-221f-4f50-b3bd-1ea8e5fe2d1f'),
    (uid1, 'ead9924a-3f3c-4c1d-9ebe-6dce025bffbe'),
    (uid2, 'ee49ed2b-1966-4c41-91fd-3065bb036f28'),
    (uid2, '62570139-221f-4f50-b3bd-1ea8e5fe2d1f'),
    (uid3, 'ee49ed2b-1966-4c41-91fd-3065bb036f28'),
    (uid3, '62570139-221f-4f50-b3bd-1ea8e5fe2d1f')
  ON CONFLICT DO NOTHING;

  -- Availability slots
  INSERT INTO availability_slots (psychologist_id, day_of_week, start_time, end_time, is_available) VALUES
    (uid1, 1, '09:00', '10:00', true), (uid1, 1, '10:00', '11:00', true), (uid1, 1, '14:00', '15:00', true),
    (uid1, 2, '09:00', '10:00', true), (uid1, 2, '11:00', '12:00', true),
    (uid1, 3, '14:00', '15:00', true), (uid1, 3, '15:00', '16:00', true),
    (uid1, 4, '09:00', '10:00', true), (uid1, 4, '10:00', '11:00', true),
    (uid2, 1, '10:00', '11:00', true), (uid2, 1, '11:00', '12:00', true),
    (uid2, 3, '09:00', '10:00', true), (uid2, 3, '14:00', '15:00', true),
    (uid2, 5, '10:00', '11:00', true), (uid2, 5, '15:00', '16:00', true),
    (uid3, 2, '10:00', '11:00', true), (uid3, 2, '14:00', '15:00', true),
    (uid3, 4, '09:00', '10:00', true), (uid3, 4, '11:00', '12:00', true),
    (uid3, 6, '10:00', '11:00', true), (uid3, 6, '14:00', '15:00', true);
END;
$$;

SELECT public.seed_sample_psychologists();
DROP FUNCTION public.seed_sample_psychologists();
