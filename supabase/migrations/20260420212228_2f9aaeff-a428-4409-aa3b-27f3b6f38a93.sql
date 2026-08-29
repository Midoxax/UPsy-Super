
-- ============================================================
-- PHASE B: Psychologist Accreditation System
-- ============================================================

-- 1) Extend psychologist_applications
ALTER TABLE public.psychologist_applications
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'MA',
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS years_experience integer,
  ADD COLUMN IF NOT EXISTS specialties_requested text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS therapy_approaches_requested text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS populations_served text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS offers_online boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS offers_in_person boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS desired_hourly_rate_mad numeric,
  ADD COLUMN IF NOT EXISTS bio_short text,
  ADD COLUMN IF NOT EXISTS bio_long text,
  -- Documents (each is a storage path relative to accreditation-docs bucket)
  ADD COLUMN IF NOT EXISTS doc_diploma_url text,
  ADD COLUMN IF NOT EXISTS doc_cin_url text,
  ADD COLUMN IF NOT EXISTS doc_license_morocco_url text,
  ADD COLUMN IF NOT EXISTS doc_rib_url text,
  ADD COLUMN IF NOT EXISTS doc_auto_entrepreneur_url text,
  ADD COLUMN IF NOT EXISTS doc_order_registration_url text,
  ADD COLUMN IF NOT EXISTS doc_specialty_certs_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS doc_insurance_url text,
  ADD COLUMN IF NOT EXISTS doc_cv_url text,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS intro_video_url text,
  -- Auto-verification
  ADD COLUMN IF NOT EXISTS auto_check_status text DEFAULT 'not_run' CHECK (auto_check_status IN ('not_run', 'passed', 'needs_manual_check', 'failed')),
  ADD COLUMN IF NOT EXISTS auto_check_flags jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS suggested_level text,
  ADD COLUMN IF NOT EXISTS auto_checked_at timestamptz,
  -- Revision workflow
  ADD COLUMN IF NOT EXISTS revision_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS revision_notes text;

-- Allow 'in_revision' as new status
ALTER TABLE public.psychologist_applications
  DROP CONSTRAINT IF EXISTS psychologist_applications_status_check;

CREATE INDEX IF NOT EXISTS idx_apps_user_id ON public.psychologist_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON public.psychologist_applications(status);

-- 2) RLS for psychologist_applications: psy can manage own draft
DROP POLICY IF EXISTS "Applicants can view own application" ON public.psychologist_applications;
DROP POLICY IF EXISTS "Applicants can insert own application" ON public.psychologist_applications;
DROP POLICY IF EXISTS "Applicants can update own pending application" ON public.psychologist_applications;

CREATE POLICY "Applicants can view own application"
ON public.psychologist_applications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Applicants can insert own application"
ON public.psychologist_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Applicants can update own pending application"
ON public.psychologist_applications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status IN ('pending', 'in_revision'))
WITH CHECK (auth.uid() = user_id AND status IN ('pending', 'in_revision'));

-- 3) Accreditation decisions log
CREATE TABLE IF NOT EXISTS public.accreditation_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.psychologist_applications(id) ON DELETE CASCADE,
  decided_by uuid REFERENCES auth.users(id),
  decision text NOT NULL CHECK (decision IN ('approved', 'rejected', 'revision_requested', 'level_upgraded', 'auto_check')),
  level_assigned text,
  reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decisions_app ON public.accreditation_decisions(application_id);
CREATE INDEX IF NOT EXISTS idx_decisions_date ON public.accreditation_decisions(created_at DESC);

ALTER TABLE public.accreditation_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all decisions"
ON public.accreditation_decisions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Applicants can view own decisions"
ON public.accreditation_decisions FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM psychologist_applications a
  WHERE a.id = accreditation_decisions.application_id AND a.user_id = auth.uid()
));

-- 4) Storage RLS for accreditation-docs (private bucket exists)
DROP POLICY IF EXISTS "Psychologists upload own docs" ON storage.objects;
DROP POLICY IF EXISTS "Psychologists read own docs" ON storage.objects;
DROP POLICY IF EXISTS "Psychologists delete own docs" ON storage.objects;
DROP POLICY IF EXISTS "Admins read all accreditation docs" ON storage.objects;

CREATE POLICY "Psychologists upload own docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'accreditation-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Psychologists read own docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'accreditation-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Psychologists delete own docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'accreditation-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins read all accreditation docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'accreditation-docs'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- 5) Trigger to log status changes to accreditation_decisions
CREATE OR REPLACE FUNCTION public.log_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.accreditation_decisions (application_id, decided_by, decision, level_assigned, reason)
    VALUES (
      NEW.id,
      COALESCE(NEW.reviewed_by, auth.uid()),
      CASE NEW.status
        WHEN 'approved' THEN 'approved'
        WHEN 'rejected' THEN 'rejected'
        WHEN 'in_revision' THEN 'revision_requested'
        ELSE 'auto_check'
      END,
      NEW.accreditation_level,
      COALESCE(NEW.revision_notes, NEW.notes)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_app_status ON public.psychologist_applications;
CREATE TRIGGER trg_log_app_status
AFTER UPDATE ON public.psychologist_applications
FOR EACH ROW EXECUTE FUNCTION public.log_application_status_change();

-- 6) Updated_at trigger
DROP TRIGGER IF EXISTS trg_apps_updated ON public.psychologist_applications;
CREATE TRIGGER trg_apps_updated
BEFORE UPDATE ON public.psychologist_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
