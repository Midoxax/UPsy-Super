
-- 1. Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view submissions"
  ON public.contact_submissions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix leads table: add INSERT policy for anonymous/authenticated users
CREATE POLICY "Anyone can submit leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

-- 3. Fix client_matching_requests: the existing SELECT policies are RESTRICTIVE
-- but they only allow admin SELECT. The INSERT policy allows anyone to insert.
-- The current setup is actually correct - only admins can SELECT.
-- However, let's verify by dropping the duplicate admin SELECT policy
DROP POLICY IF EXISTS "Admins can view matching requests" ON public.client_matching_requests;
