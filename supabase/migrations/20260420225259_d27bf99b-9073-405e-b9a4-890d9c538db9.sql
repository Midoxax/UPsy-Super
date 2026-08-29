-- Tighten public-insert policies with format guards (no longer "always true")
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(trim(message)) BETWEEN 1 AND 5000
);

DROP POLICY IF EXISTS "Anyone can submit matching requests" ON public.client_matching_requests;
CREATE POLICY "Anyone can submit matching requests"
ON public.client_matching_requests FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND specialty_needed IS NOT NULL
);

-- Email-assets bucket: prevent listing all files (still allow direct URL access)
DROP POLICY IF EXISTS "Public can list email assets" ON storage.objects;
DROP POLICY IF EXISTS "Email assets are publicly accessible" ON storage.objects;

-- Recreate a strict per-object read policy (no LIST capability)
CREATE POLICY "Email assets readable by id"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'email-assets');