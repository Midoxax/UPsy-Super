
-- Public bucket for psychologist profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('psychologist-photos', 'psychologist-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read
DROP POLICY IF EXISTS "Psychologist photos are publicly accessible" ON storage.objects;
CREATE POLICY "Psychologist photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'psychologist-photos');

-- Owner-scoped insert
DROP POLICY IF EXISTS "Psychologists can upload their own photo" ON storage.objects;
CREATE POLICY "Psychologists can upload their own photo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'psychologist-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Owner-scoped update
DROP POLICY IF EXISTS "Psychologists can update their own photo" ON storage.objects;
CREATE POLICY "Psychologists can update their own photo"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'psychologist-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Owner-scoped delete
DROP POLICY IF EXISTS "Psychologists can delete their own photo" ON storage.objects;
CREATE POLICY "Psychologists can delete their own photo"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'psychologist-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
