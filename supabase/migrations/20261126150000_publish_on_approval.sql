-- Publish on approval. An accredited psychologist's profile is filled from
-- their application at approval, and they publish it in one click from the
-- approval email, without logging in first (profile-publication function).
-- Until then nothing of it is public: the photo stays in the private
-- application bucket and is copied to the public one only on publication.

-- Darija and Tamazight are languages patients ask for; the directory had
-- neither, so applications naming them lost them.
INSERT INTO public.languages (name)
SELECT v FROM (VALUES ('Darija'), ('Tamazight')) AS t(v)
WHERE NOT EXISTS (SELECT 1 FROM public.languages l WHERE l.name = t.v);

ALTER TABLE public.psychologist_profiles
  ADD COLUMN IF NOT EXISTS publish_token text,
  ADD COLUMN IF NOT EXISTS publication_confirmed_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS psychologist_profiles_publish_token_key
  ON public.psychologist_profiles (publish_token) WHERE publish_token IS NOT NULL;

-- The application form's French labels → the directory's lists.
CREATE OR REPLACE FUNCTION public.application_specialty_names(_label text)
RETURNS text[] LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT CASE _label
    WHEN 'Anxiété' THEN ARRAY['Anxiety & Stress']
    WHEN 'Dépression' THEN ARRAY['Depression']
    WHEN 'Trauma / EMDR' THEN ARRAY['Trauma & PTSD']
    WHEN 'Post-catastrophe' THEN ARRAY['Trauma & PTSD']
    WHEN 'Couple / Famille' THEN ARRAY['Couples Therapy', 'Family Therapy']
    WHEN 'Addictologie' THEN ARRAY['Addiction']
    WHEN 'Burnout' THEN ARRAY['Burnout']
    WHEN 'Adolescents' THEN ARRAY['Child & Adolescent']
    ELSE ARRAY[]::text[]
  END;
$$;

CREATE OR REPLACE FUNCTION public.application_approach_name(_label text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT CASE _label
    WHEN 'TCC' THEN 'CBT'
    WHEN 'EMDR' THEN 'EMDR'
    WHEN 'Trauma / EMDR' THEN 'EMDR'
    WHEN 'MSPE / Pleine conscience' THEN 'Mindfulness'
    WHEN 'Psychanalyse' THEN 'Psychodynamic'
    WHEN 'Humaniste' THEN 'Humanistic'
    WHEN 'ACT' THEN 'ACT'
  END;
$$;

CREATE OR REPLACE FUNCTION public.application_language_name(_label text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT CASE _label
    WHEN 'Français' THEN 'French'
    WHEN 'Arabe' THEN 'Arabic'
    WHEN 'Darija' THEN 'Darija'
    WHEN 'Anglais' THEN 'English'
    WHEN 'Espagnol' THEN 'Spanish'
    WHEN 'Berbère' THEN 'Tamazight'
  END;
$$;

-- The profile seeded at creation matched the form's French labels against
-- the directory's English names, so specialties, languages and approaches
-- were lost; it now maps them too.
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
  WHERE (lower(s.name) IN (SELECT lower(x) FROM unnest(coalesce(app.specialties_requested, '{}')) x)
         OR s.name IN (SELECT n FROM unnest(coalesce(app.specialties_requested, '{}')) x,
                                     unnest(public.application_specialty_names(x)) n))
    AND NOT EXISTS (SELECT 1 FROM psychologist_specialties e
                    WHERE e.psychologist_id = NEW.id AND e.specialty_id = s.id);
  INSERT INTO psychologist_languages (psychologist_id, language_id)
  SELECT NEW.id, l.id FROM languages l
  WHERE (lower(l.name) IN (SELECT lower(x) FROM unnest(coalesce(app.languages, '{}')) x)
         OR l.name IN (SELECT public.application_language_name(x) FROM unnest(coalesce(app.languages, '{}')) x))
    AND NOT EXISTS (SELECT 1 FROM psychologist_languages e
                    WHERE e.psychologist_id = NEW.id AND e.language_id = l.id);
  INSERT INTO psychologist_therapy_approaches (psychologist_id, therapy_approach_id)
  SELECT NEW.id, t.id FROM therapy_approaches t
  WHERE (lower(t.name) IN (SELECT lower(x) FROM unnest(coalesce(app.therapy_approaches_requested, '{}')) x)
         OR t.name IN (SELECT public.application_approach_name(x)
                         FROM unnest(coalesce(app.therapy_approaches_requested, '{}')
                                     || coalesce(app.specialties_requested, '{}')) x))
    AND NOT EXISTS (SELECT 1 FROM psychologist_therapy_approaches e
                    WHERE e.psychologist_id = NEW.id AND e.therapy_approach_id = t.id);

  IF app.user_id IS NULL THEN
    UPDATE psychologist_applications SET user_id = NEW.id WHERE id = app.id;
  END IF;
  RETURN NEW;
END;
$$;

-- For profiles created before the mapping (seed_profile_from_application
-- runs at creation only): fills what is missing from the latest approved
-- application (bio, rate, city, gender, specialties, approaches, languages);
-- what the psychologist already set is kept. Online / in-person follow what
-- the application declared.
CREATE OR REPLACE FUNCTION public.psychologist_prefill_from_application(_psy uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  a public.psychologist_applications%ROWTYPE;
BEGIN
  SELECT x.* INTO a FROM public.psychologist_applications x
   WHERE x.user_id = _psy AND x.status = 'approved'
   ORDER BY x.created_at DESC LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;

  UPDATE public.psychologist_profiles p SET
    bio = coalesce(nullif(btrim(p.bio), ''), nullif(btrim(a.bio_long), ''), nullif(btrim(a.bio_short), '')),
    hourly_rate_mad = coalesce(p.hourly_rate_mad, a.desired_hourly_rate_mad),
    city = coalesce(nullif(btrim(p.city), ''), nullif(btrim(a.city), '')),
    gender = coalesce(p.gender, a.gender),
    offers_online = coalesce(a.offers_online, p.offers_online),
    offers_in_person = coalesce(a.offers_in_person, p.offers_in_person)
  WHERE p.id = _psy;

  INSERT INTO public.psychologist_specialties (psychologist_id, specialty_id)
  SELECT DISTINCT _psy, s.id
    FROM unnest(coalesce(a.specialties_requested, '{}')) lbl
    CROSS JOIN LATERAL unnest(public.application_specialty_names(lbl)) n
    JOIN public.specialties s ON s.name = n
  ON CONFLICT DO NOTHING;

  INSERT INTO public.psychologist_therapy_approaches (psychologist_id, therapy_approach_id)
  SELECT DISTINCT _psy, t.id
    FROM unnest(coalesce(a.therapy_approaches_requested, '{}')
                || coalesce(a.specialties_requested, '{}')) lbl
    JOIN public.therapy_approaches t ON t.name = public.application_approach_name(lbl)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.psychologist_languages (psychologist_id, language_id)
  SELECT DISTINCT _psy, l.id
    FROM unnest(coalesce(a.languages, '{}')) lbl
    JOIN public.languages l ON l.name = public.application_language_name(lbl)
  ON CONFLICT DO NOTHING;
END $$;

REVOKE ALL ON FUNCTION public.psychologist_prefill_from_application(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.psychologist_prefill_from_application(uuid) TO service_role;

-- The League badge shows only on a published profile (league_member_badges):
-- the membership notice now says so to a member whose profile is not
-- published yet, so the badge becomes a reason to publish.
CREATE OR REPLACE FUNCTION public.league_membership_notify() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _receipt text; _name text; _renewal boolean;
BEGIN
  IF NEW.status = 'active' AND OLD.status IS DISTINCT FROM 'active' THEN
    SELECT receipt_number INTO _receipt FROM public.league_payments
    WHERE membership_id = NEW.id AND status = 'verified' ORDER BY verified_at DESC LIMIT 1;
    _renewal := EXISTS (SELECT 1 FROM public.league_memberships
                        WHERE user_id = NEW.user_id AND id <> NEW.id AND status = 'active');
    PERFORM public.notify_user(NEW.user_id, 'league',
      CASE WHEN _renewal THEN 'Votre adhésion à la LSSPM est renouvelée'
           ELSE 'Votre adhésion à la LSSPM est confirmée' END,
      CASE WHEN _renewal THEN 'Merci de votre fidélité à la Ligue des Spécialistes de la Santé Psychique et Mentale.'
           ELSE 'Bienvenue dans la Ligue des Spécialistes de la Santé Psychique et Mentale.' END || E'\n\n' ||
      'Numéro de membre : ' || coalesce(NEW.member_number, '—') || E'\n' ||
      'Valable du ' || public.fr_date(NEW.starts_on) || ' au ' || public.fr_date(NEW.ends_on) || '.' || E'\n' ||
      coalesce('Reçu de paiement : ' || _receipt || E'\n', '') ||
      'Attestation d''adhésion : ' || coalesce(NEW.attestation_number, '—') || E'\n\n' ||
      'Votre carte de membre numérique, votre attestation et votre reçu sont téléchargeables depuis votre tableau de bord.' ||
      CASE WHEN NOT EXISTS (SELECT 1 FROM public.psychologist_profiles pp
                             WHERE pp.id = NEW.user_id AND pp.is_published) THEN
        E'\n\nVotre badge LSSPM apparaîtra sur votre profil U.Psy dès qu''il sera publié : publiez-le depuis l''onglet Profil de votre tableau de bord.'
      ELSE '' END,
      '/dashboard');
    SELECT full_name INTO _name FROM public.profiles WHERE id = NEW.user_id;
    PERFORM public.notify_league_staff(
      CASE WHEN _renewal THEN 'Renouvellement confirmé : ' ELSE 'Nouvelle adhésion confirmée : ' END
        || coalesce(_name, NEW.member_number),
      'Membre n° ' || coalesce(NEW.member_number, '—') || ', attestation ' ||
      coalesce(NEW.attestation_number, '—') || ', valable jusqu''au ' || public.fr_date(NEW.ends_on) ||
      '. L''attestation est téléchargeable dans le portail.',
      '/league');
  END IF;
  RETURN NEW;
END $$;
