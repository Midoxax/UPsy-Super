
-- 1. bookings: restrict what patients can insert
DROP POLICY IF EXISTS "Patients can create bookings" ON public.bookings;
CREATE POLICY "Patients can create bookings"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = patient_id
    AND status IN ('pending')
    AND (payment_status IS NULL OR payment_status IN ('unpaid','pending_deposit'))
  );

-- 2. athlete_profiles: add WITH CHECK
DROP POLICY IF EXISTS "Athletes can manage own profile" ON public.athlete_profiles;
CREATE POLICY "Athletes can manage own profile"
  ON public.athlete_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. availability_slots: add WITH CHECK
DROP POLICY IF EXISTS "Psychologists can manage own availability" ON public.availability_slots;
CREATE POLICY "Psychologists can manage own availability"
  ON public.availability_slots
  FOR ALL
  TO authenticated
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

-- 4. organization_profiles: add WITH CHECK
DROP POLICY IF EXISTS "Org admins can manage own org" ON public.organization_profiles;
CREATE POLICY "Org admins can manage own org"
  ON public.organization_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = admin_user_id)
  WITH CHECK (auth.uid() = admin_user_id);

-- 5. psychologist_specialties
DROP POLICY IF EXISTS "Psychologists can manage own specialties" ON public.psychologist_specialties;
CREATE POLICY "Psychologists can manage own specialties"
  ON public.psychologist_specialties
  FOR ALL
  TO authenticated
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

-- 6. psychologist_languages
DROP POLICY IF EXISTS "Psychologists can manage own languages" ON public.psychologist_languages;
CREATE POLICY "Psychologists can manage own languages"
  ON public.psychologist_languages
  FOR ALL
  TO authenticated
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

-- 7. psychologist_therapy_approaches
DROP POLICY IF EXISTS "Psychologists can manage own therapy approaches" ON public.psychologist_therapy_approaches;
CREATE POLICY "Psychologists can manage own therapy approaches"
  ON public.psychologist_therapy_approaches
  FOR ALL
  TO authenticated
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

-- 8. Storage policies for user-documents: defense-in-depth cross-check against public.documents.
-- Keeps the folder check, and additionally requires: if a documents row references this file, its user_id must be auth.uid().
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = (auth.uid())::text
    AND NOT EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_url LIKE '%' || storage.objects.name
        AND d.user_id <> auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = (auth.uid())::text
    AND NOT EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_url LIKE '%' || storage.objects.name
        AND d.user_id <> auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own files in user-documents" ON storage.objects;
CREATE POLICY "Users can update own files in user-documents"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
    AND NOT EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_url LIKE '%' || storage.objects.name
        AND d.user_id <> auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'user-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );
