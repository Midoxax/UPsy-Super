-- Certificate types enum
CREATE TYPE public.certificate_type AS ENUM (
  'course_completion',
  'assessment_completion',
  'psychologist_accreditation',
  'mooc_training'
);

-- Certificates table
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  certificate_type certificate_type NOT NULL,
  title text NOT NULL,
  description text,
  recipient_name text NOT NULL,
  reference_id uuid,
  issued_at timestamp with time zone NOT NULL DEFAULT now(),
  certificate_number text NOT NULL DEFAULT ('UPSY-' || upper(substring(gen_random_uuid()::text from 1 for 8))),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Users can view own certificates
CREATE POLICY "Users can view own certificates"
ON public.certificates FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- System can insert certificates (via service role in edge function)
CREATE POLICY "Service can insert certificates"
ON public.certificates FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all certificates
CREATE POLICY "Admins can manage all certificates"
ON public.certificates FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Index for fast lookups
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_certificates_reference_id ON public.certificates(reference_id);
CREATE UNIQUE INDEX idx_certificates_unique ON public.certificates(user_id, certificate_type, reference_id);