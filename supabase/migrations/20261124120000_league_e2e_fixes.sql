-- Fixes found by the end-to-end test of the League flows.
--
-- 1. Validating a contribution without typing points failed: the portal
--    leaves _points out to apply the default points of the contribution's
--    kind, but the function had no default for it, so the API found no
--    matching function (404). _points and _note now default to NULL.
-- 2. Applicants' photos did not show on the League's file list: the League
--    could read every shared document except the photo.

CREATE OR REPLACE FUNCTION public.league_review_contribution(
  _contribution uuid, _ok boolean, _points integer DEFAULT NULL, _note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.league_contributions;
BEGIN
  IF NOT public.is_league_evaluator(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO c FROM public.league_contributions WHERE id = _contribution FOR UPDATE;
  IF NOT FOUND OR c.status <> 'submitted' THEN RAISE EXCEPTION 'not reviewable'; END IF;
  IF c.user_id = auth.uid() THEN RAISE EXCEPTION 'cannot review own contribution'; END IF;
  UPDATE public.league_contributions SET
    status = CASE WHEN _ok THEN 'validated' ELSE 'rejected' END,
    points = CASE WHEN _ok THEN least(30, greatest(0, coalesce(_points, public.league_default_points(c.kind)))) END,
    review_note = nullif(trim(_note), ''), reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = _contribution;
END $$;

CREATE OR REPLACE FUNCTION public.league_can_read_doc(_name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_league_reviewer(auth.uid()) AND EXISTS (
    SELECT 1 FROM public.psychologist_applications a
    WHERE a.league_share_consent
      AND (_name IN (a.photo_url, a.doc_diploma_url, a.doc_cv_url, a.doc_license_morocco_url,
                     a.doc_order_registration_url, a.doc_insurance_url)
           OR _name = ANY (coalesce(a.doc_specialty_certs_urls, '{}')))
  )
$$;
