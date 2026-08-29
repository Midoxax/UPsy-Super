
-- 1. Remove user self-insert on assessment_premium_reports (payment must be verified by backend)
DROP POLICY IF EXISTS "Users create own premium reports" ON public.assessment_premium_reports;

-- 2. Remove user self-insert on sector_reports
DROP POLICY IF EXISTS "Users create own sector reports" ON public.sector_reports;

-- 3. Tighten leads insert: public form cannot attribute a lead to a specific psychologist
DROP POLICY IF EXISTS "Anyone can submit leads" ON public.leads;
CREATE POLICY "Anyone can submit leads"
ON public.leads
FOR INSERT
TO public
WITH CHECK (status = 'new'::text AND psychologist_id IS NULL);

-- 4. Restrict course_modules SELECT for paid courses to enrolled users / admins
DROP POLICY IF EXISTS "Public can view modules of published courses" ON public.course_modules;

CREATE POLICY "Public can view modules of free published courses"
ON public.course_modules
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_modules.course_id
      AND c.is_published = true
      AND COALESCE(c.is_paid, false) = false
  )
);

CREATE POLICY "Enrolled users view paid course modules"
ON public.course_modules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_modules.course_id
      AND c.is_published = true
      AND c.is_paid = true
      AND (
        has_role(auth.uid(), 'admin'::app_role)
        OR EXISTS (
          SELECT 1 FROM public.course_enrollments e
          WHERE e.course_id = c.id AND e.user_id = auth.uid()
        )
      )
  )
);

-- 5. Allow users to UPDATE their own files in user-documents bucket
CREATE POLICY "Users can update own files in user-documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
