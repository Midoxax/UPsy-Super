
-- Organization applications table for B2B "Apply as Organization" flow
CREATE TABLE IF NOT EXISTS public.organization_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  industry text,
  size_range text,
  city text,
  country text DEFAULT 'MA',
  website text,
  ice text,
  rc_number text,
  if_number text,
  desired_seats integer DEFAULT 10,
  use_case text,
  message text,
  status text NOT NULL DEFAULT 'pending', -- pending | reviewing | approved | rejected
  review_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  approved_org_id uuid REFERENCES public.organization_accounts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.organization_applications ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can submit
CREATE POLICY "Anyone can submit org application"
ON public.organization_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(organization_name)) BETWEEN 2 AND 200
  AND contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(trim(contact_name)) BETWEEN 1 AND 200
  AND status = 'pending'
);

-- Applicants can view their own application
CREATE POLICY "Applicants view own application"
ON public.organization_applications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins manage all
CREATE POLICY "Admins manage org applications"
ON public.organization_applications
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_org_applications_updated_at
BEFORE UPDATE ON public.organization_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_org_applications_status ON public.organization_applications(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_applications_user ON public.organization_applications(user_id);
