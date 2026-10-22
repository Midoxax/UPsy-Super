-- League (LSSPM) portal: the League reviews the files of psychologists who
-- opt in, adds its own scoring, and recruits through a co-branded campaign.
--
-- Law 09-08: sharing a psychologist's file with a third party needs that
-- psychologist's consent, so nothing is visible to the League without the
-- opt-in, and the opt-in can be withdrawn. Identity and banking documents
-- (CIN, RIB, auto-entrepreneur attestation), date of birth and phone are
-- never exposed to the League, consent or not.

ALTER TABLE public.psychologist_applications
  ADD COLUMN IF NOT EXISTS league_share_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS league_share_consented_at timestamptz,
  ADD COLUMN IF NOT EXISTS source text CHECK (source IS NULL OR source ~ '^[a-z0-9_-]{1,40}$');

CREATE OR REPLACE FUNCTION public.stamp_league_consent() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.league_share_consent IS DISTINCT FROM coalesce(OLD.league_share_consent, false) THEN
    NEW.league_share_consented_at := CASE WHEN NEW.league_share_consent THEN now() END;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_stamp_league_consent ON public.psychologist_applications;
CREATE TRIGGER trg_stamp_league_consent BEFORE INSERT OR UPDATE OF league_share_consent
  ON public.psychologist_applications FOR EACH ROW EXECUTE FUNCTION public.stamp_league_consent();

-- Approved psychologists can no longer update their application row (RLS
-- limits that to pending files), so the consent toggle goes through here.
CREATE OR REPLACE FUNCTION public.set_league_share(p_consent boolean)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _n int;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  UPDATE public.psychologist_applications SET league_share_consent = p_consent
  WHERE user_id = auth.uid();
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n > 0;
END $$;
REVOKE ALL ON FUNCTION public.set_league_share(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_league_share(boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_league_reviewer(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_uid, 'league'::app_role) OR public.has_role(_uid, 'admin'::app_role)
$$;
REVOKE ALL ON FUNCTION public.is_league_reviewer(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_league_reviewer(uuid) TO authenticated;

-- Whether a file is shared with the League. SECURITY DEFINER: reviewers
-- cannot read psychologist_applications directly.
CREATE OR REPLACE FUNCTION public.league_file_shared(_app uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.psychologist_applications
                 WHERE id = _app AND league_share_consent)
$$;
REVOKE ALL ON FUNCTION public.league_file_shared(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.league_file_shared(uuid) TO authenticated;

-- League scoring: a five-criterion rubric (0-5 each), a recommendation and
-- the League membership status. One review per reviewer per file.
CREATE TABLE IF NOT EXISTS public.league_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.psychologist_applications(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_training smallint NOT NULL CHECK (score_training BETWEEN 0 AND 5),
  score_experience smallint NOT NULL CHECK (score_experience BETWEEN 0 AND 5),
  score_documents smallint NOT NULL CHECK (score_documents BETWEEN 0 AND 5),
  score_specialisation smallint NOT NULL CHECK (score_specialisation BETWEEN 0 AND 5),
  score_ethics smallint NOT NULL CHECK (score_ethics BETWEEN 0 AND 5),
  total smallint GENERATED ALWAYS AS (
    (score_training + score_experience + score_documents + score_specialisation + score_ethics) * 4
  ) STORED,
  recommendation text NOT NULL CHECK (recommendation IN ('recommended', 'more_info', 'not_recommended')),
  member_status text NOT NULL DEFAULT 'candidate' CHECK (member_status IN ('member', 'candidate', 'non_member')),
  notes text CHECK (length(notes) <= 4000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, reviewer_id)
);
ALTER TABLE public.league_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "league reads reviews" ON public.league_reviews;
CREATE POLICY "league reads reviews" ON public.league_reviews FOR SELECT TO authenticated
  USING (public.is_league_reviewer(auth.uid()));
DROP POLICY IF EXISTS "league writes own review" ON public.league_reviews;
CREATE POLICY "league writes own review" ON public.league_reviews FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid() AND public.is_league_reviewer(auth.uid())
    AND public.league_file_shared(application_id)
  );
DROP POLICY IF EXISTS "league updates own review" ON public.league_reviews;
CREATE POLICY "league updates own review" ON public.league_reviews FOR UPDATE TO authenticated
  USING (reviewer_id = auth.uid() AND public.is_league_reviewer(auth.uid()))
  WITH CHECK (reviewer_id = auth.uid());
GRANT SELECT, INSERT, UPDATE ON public.league_reviews TO authenticated;
GRANT ALL ON public.league_reviews TO service_role;
DROP TRIGGER IF EXISTS league_reviews_touch ON public.league_reviews;
CREATE TRIGGER league_reviews_touch BEFORE UPDATE ON public.league_reviews
  FOR EACH ROW EXECUTE FUNCTION public.athlete_touch_updated_at();

-- The League's view of opted-in files: professional fields only.
CREATE OR REPLACE FUNCTION public.league_applications()
RETURNS TABLE (
  id uuid, full_name text, email text, city text, years_experience int,
  qualifications text, accreditation_number text, specialties text[],
  approaches text[], languages text[], bio_short text, photo_url text,
  status text, accreditation_level text, suggested_level text,
  auto_check_status text, auto_check_flags jsonb, submitted_at timestamptz,
  consented_at timestamptz, source text,
  doc_diploma_url text, doc_cv_url text, doc_license_morocco_url text,
  doc_order_registration_url text, doc_insurance_url text, doc_specialty_certs_urls text[],
  upsy_score int, league_avg int, league_reviews int, my_review jsonb
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_league_reviewer(auth.uid()) THEN
    RAISE EXCEPTION 'league reviewers only' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT a.id, a.full_name, a.email, a.city, a.years_experience,
    a.qualifications, a.accreditation_number, a.specialties_requested,
    a.therapy_approaches_requested, a.languages, a.bio_short, a.photo_url,
    a.status, a.accreditation_level, a.suggested_level,
    a.auto_check_status, a.auto_check_flags::jsonb, a.submitted_at,
    a.league_share_consented_at, a.source,
    a.doc_diploma_url, a.doc_cv_url, a.doc_license_morocco_url,
    a.doc_order_registration_url, a.doc_insurance_url, a.doc_specialty_certs_urls,
    -- UPSY completeness score: 100 minus 25 per blocking and 8 per warning flag.
    greatest(0, 100
      - 25 * (SELECT count(*) FROM jsonb_array_elements(coalesce(a.auto_check_flags::jsonb, '[]')) f WHERE f->>'severity' = 'block')
      - 8 * (SELECT count(*) FROM jsonb_array_elements(coalesce(a.auto_check_flags::jsonb, '[]')) f WHERE f->>'severity' = 'warn')
    )::int,
    (SELECT round(avg(r.total))::int FROM public.league_reviews r WHERE r.application_id = a.id),
    (SELECT count(*)::int FROM public.league_reviews r WHERE r.application_id = a.id),
    (SELECT to_jsonb(r) FROM public.league_reviews r WHERE r.application_id = a.id AND r.reviewer_id = auth.uid())
  FROM public.psychologist_applications a
  WHERE a.league_share_consent
  ORDER BY a.league_share_consented_at DESC NULLS LAST;
END $$;
REVOKE ALL ON FUNCTION public.league_applications() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.league_applications() TO authenticated;

-- Recruitment funnel for a campaign source (default: the League's own).
CREATE OR REPLACE FUNCTION public.league_recruitment_stats(p_source text DEFAULT 'lsspm')
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_league_reviewer(auth.uid()) THEN
    RAISE EXCEPTION 'league reviewers only' USING ERRCODE = '42501';
  END IF;
  RETURN (
    SELECT jsonb_build_object(
      'started', count(*),
      'submitted', count(*) FILTER (WHERE a.submitted_at IS NOT NULL OR a.auto_checked_at IS NOT NULL),
      'approved', count(*) FILTER (WHERE a.status = 'approved'),
      'shared_with_league', count(*) FILTER (WHERE a.league_share_consent),
      'all_shared_with_league', (SELECT count(*) FROM public.psychologist_applications WHERE league_share_consent)
    )
    FROM public.psychologist_applications a WHERE a.source = p_source
  );
END $$;
REVOKE ALL ON FUNCTION public.league_recruitment_stats(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.league_recruitment_stats(text) TO authenticated;

-- Document access: a League reviewer may read a file in accreditation-docs
-- only if it is one of the professional documents of an opted-in file.
CREATE OR REPLACE FUNCTION public.league_can_read_doc(_name text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_league_reviewer(auth.uid()) AND EXISTS (
    SELECT 1 FROM public.psychologist_applications a
    WHERE a.league_share_consent
      AND (_name IN (a.doc_diploma_url, a.doc_cv_url, a.doc_license_morocco_url,
                     a.doc_order_registration_url, a.doc_insurance_url)
           OR _name = ANY (coalesce(a.doc_specialty_certs_urls, '{}')))
  )
$$;
REVOKE ALL ON FUNCTION public.league_can_read_doc(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.league_can_read_doc(text) TO authenticated;

DROP POLICY IF EXISTS "League reads shared professional docs" ON storage.objects;
CREATE POLICY "League reads shared professional docs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'accreditation-docs' AND public.league_can_read_doc(name));
