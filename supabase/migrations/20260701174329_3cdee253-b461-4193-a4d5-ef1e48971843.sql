-- Restrict email-assets bucket to service_role only (bucket is private)
DROP POLICY IF EXISTS "Email assets readable by id" ON storage.objects;
DROP POLICY IF EXISTS "Public can read public bucket objects" ON storage.objects;

-- Recreate the generic public-bucket read policy scoped to actually public buckets only
CREATE POLICY "Public can read public bucket objects"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id IN (SELECT id FROM storage.buckets WHERE public = true)
);

-- Service role retains full access implicitly; add explicit read for email-assets by service_role
CREATE POLICY "Service role reads email-assets"
ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'email-assets');