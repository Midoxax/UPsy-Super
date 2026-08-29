
-- Add accreditation_level to psychologist_applications for tiered accreditation
ALTER TABLE public.psychologist_applications 
ADD COLUMN IF NOT EXISTS accreditation_level text NOT NULL DEFAULT 'provisional'
CHECK (accreditation_level IN ('provisional', 'verified', 'accredited'));

-- Add document_urls to store uploaded credential files
ALTER TABLE public.psychologist_applications 
ADD COLUMN IF NOT EXISTS document_urls text[] DEFAULT '{}';

-- Create storage bucket for accreditation documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('accreditation-docs', 'accreditation-docs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: Applicants can upload their own docs (authenticated users)
CREATE POLICY "Authenticated users can upload accreditation docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'accreditation-docs');

-- RLS: Admins can view all accreditation docs
CREATE POLICY "Admins can view accreditation docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'accreditation-docs' AND public.has_role(auth.uid(), 'admin'));

-- RLS: Admins can delete accreditation docs
CREATE POLICY "Admins can delete accreditation docs"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'accreditation-docs' AND public.has_role(auth.uid(), 'admin'));

-- Add accreditation_level to psychologist_profiles for tiered display
ALTER TABLE public.psychologist_profiles 
ADD COLUMN IF NOT EXISTS accreditation_level text DEFAULT 'provisional'
CHECK (accreditation_level IN ('provisional', 'verified', 'accredited'));
