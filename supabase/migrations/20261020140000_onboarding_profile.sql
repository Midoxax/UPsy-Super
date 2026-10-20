-- Specialist onboarding: the profile starts from the application, and a
-- profile can only go public once a client could actually book it.

-- 1. When a specialist's profile is created (provision-psychologist), copy
-- what they already gave in their application: bio, city, gender, session
-- modes, rate, accreditation level, and specialties, languages and
-- approaches matched by name. They used to start from an empty profile.
CREATE OR REPLACE FUNCTION public.seed_profile_from_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app psychologist_applications%ROWTYPE;
BEGIN
  SELECT a.* INTO app
  FROM psychologist_applications a
  WHERE a.user_id = NEW.id
     OR lower(a.email) = (SELECT lower(u.email) FROM auth.users u WHERE u.id = NEW.id)
  ORDER BY (a.user_id = NEW.id) DESC NULLS LAST, a.submitted_at DESC NULLS LAST, a.created_at DESC
  LIMIT 1;
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  UPDATE psychologist_profiles p SET
    bio = coalesce(p.bio, nullif(app.bio_long, ''), nullif(app.bio_short, '')),
    city = coalesce(p.city, app.city),
    gender = coalesce(p.gender, app.gender),
    offers_online = coalesce(app.offers_online, p.offers_online),
    offers_in_person = coalesce(app.offers_in_person, p.offers_in_person),
    hourly_rate_mad = coalesce(p.hourly_rate_mad, app.desired_hourly_rate_mad),
    accreditation_level = coalesce(p.accreditation_level, app.accreditation_level, app.suggested_level)
  WHERE p.id = NEW.id;

  INSERT INTO psychologist_specialties (psychologist_id, specialty_id)
  SELECT NEW.id, s.id FROM specialties s
  WHERE lower(s.name) IN (SELECT lower(x) FROM unnest(coalesce(app.specialties_requested, '{}')) x)
    AND NOT EXISTS (SELECT 1 FROM psychologist_specialties e
                    WHERE e.psychologist_id = NEW.id AND e.specialty_id = s.id);
  INSERT INTO psychologist_languages (psychologist_id, language_id)
  SELECT NEW.id, l.id FROM languages l
  WHERE lower(l.name) IN (SELECT lower(x) FROM unnest(coalesce(app.languages, '{}')) x)
    AND NOT EXISTS (SELECT 1 FROM psychologist_languages e
                    WHERE e.psychologist_id = NEW.id AND e.language_id = l.id);
  INSERT INTO psychologist_therapy_approaches (psychologist_id, therapy_approach_id)
  SELECT NEW.id, t.id FROM therapy_approaches t
  WHERE lower(t.name) IN (SELECT lower(x) FROM unnest(coalesce(app.therapy_approaches_requested, '{}')) x)
    AND NOT EXISTS (SELECT 1 FROM psychologist_therapy_approaches e
                    WHERE e.psychologist_id = NEW.id AND e.therapy_approach_id = t.id);

  IF app.user_id IS NULL THEN
    UPDATE psychologist_applications SET user_id = NEW.id WHERE id = app.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS seed_profile_from_application_trg ON public.psychologist_profiles;
CREATE TRIGGER seed_profile_from_application_trg
  AFTER INSERT ON public.psychologist_profiles
  FOR EACH ROW EXECUTE FUNCTION public.seed_profile_from_application();

-- 2. Publishing needs what a booking needs: accreditation, a rate, a real
-- bio and weekly hours. Admins can still publish anything.
CREATE OR REPLACE FUNCTION public.psychologist_publish_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  missing text[] := '{}';
BEGIN
  IF NOT NEW.is_published OR coalesce(OLD.is_published, false)
     OR public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF NOT coalesce(NEW.is_accredited, false) THEN
    missing := array_append(missing, 'accreditation (pending review)');
  END IF;
  IF NEW.hourly_rate_mad IS NULL THEN
    missing := array_append(missing, 'a session rate (Pricing)');
  END IF;
  IF length(coalesce(NEW.bio, '')) < 80 THEN
    missing := array_append(missing, 'a bio of at least 80 characters (Profile)');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM availability_slots a
                 WHERE a.psychologist_id = NEW.id AND a.is_available AND coalesce(a.is_active, true)) THEN
    missing := array_append(missing, 'weekly hours (Availability)');
  END IF;
  IF cardinality(missing) > 0 THEN
    RAISE EXCEPTION 'Before publishing, add: %', array_to_string(missing, ', ')
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS psychologist_publish_guard_trg ON public.psychologist_profiles;
CREATE TRIGGER psychologist_publish_guard_trg
  BEFORE UPDATE OF is_published ON public.psychologist_profiles
  FOR EACH ROW EXECUTE FUNCTION public.psychologist_publish_guard();
