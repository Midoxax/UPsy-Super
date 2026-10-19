-- Storage buckets and their access rules, stated once.
--
-- Production was found with no storage buckets at all: the migrations that
-- create them predate the current project, so profile photos, client
-- documents and invoices, accreditation uploads and the logo in auth emails
-- all failed. This creates whatever is missing and leaves existing buckets
-- and policies alone, so it is a no-op wherever they already exist.
--
-- email-assets is public: the auth email templates load the logo from its
-- public URL, which a private bucket cannot serve.

INSERT INTO storage.buckets (id, name, public) VALUES
  ('user-documents', 'user-documents', false),
  ('accreditation-docs', 'accreditation-docs', false),
  ('psychologist-photos', 'psychologist-photos', true),
  ('email-assets', 'email-assets', true)
ON CONFLICT (id) DO NOTHING;
UPDATE storage.buckets SET public = true WHERE id = 'email-assets' AND public = false;

DO $$
DECLARE
  p record;
BEGIN
  FOR p IN SELECT * FROM (VALUES
    -- Client documents and invoices: each user's own folder.
    ('Users can view own documents', 'SELECT', 'authenticated',
     $q$bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text
        AND NOT EXISTS (SELECT 1 FROM public.documents d
                        WHERE d.file_url LIKE '%' || objects.name AND d.user_id <> auth.uid())$q$, NULL),
    ('Users can upload own documents', 'INSERT', 'authenticated', NULL,
     $q$bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text$q$),
    ('Users can update own files in user-documents', 'UPDATE', 'authenticated',
     $q$bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text
        AND NOT EXISTS (SELECT 1 FROM public.documents d
                        WHERE d.file_url LIKE '%' || objects.name AND d.user_id <> auth.uid())$q$,
     $q$bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text$q$),
    ('Users can delete own documents', 'DELETE', 'authenticated',
     $q$bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text
        AND NOT EXISTS (SELECT 1 FROM public.documents d
                        WHERE d.file_url LIKE '%' || objects.name AND d.user_id <> auth.uid())$q$, NULL),
    -- Accreditation files: the applicant's own folder; admins review them.
    ('Psychologists read own docs', 'SELECT', 'authenticated',
     $q$bucket_id = 'accreditation-docs' AND (storage.foldername(name))[1] = auth.uid()::text$q$, NULL),
    ('Psychologists upload own docs', 'INSERT', 'authenticated', NULL,
     $q$bucket_id = 'accreditation-docs' AND (storage.foldername(name))[1] = auth.uid()::text$q$),
    ('Psychologists delete own docs', 'DELETE', 'authenticated',
     $q$bucket_id = 'accreditation-docs' AND (storage.foldername(name))[1] = auth.uid()::text$q$, NULL),
    ('Admins can view accreditation docs', 'SELECT', 'authenticated',
     $q$bucket_id = 'accreditation-docs' AND public.has_role(auth.uid(), 'admin'::app_role)$q$, NULL),
    ('Admins can delete accreditation docs', 'DELETE', 'authenticated',
     $q$bucket_id = 'accreditation-docs' AND public.has_role(auth.uid(), 'admin'::app_role)$q$, NULL),
    -- Profile photos: public to read, each specialist manages their own.
    ('Psychologist photos are publicly readable', 'SELECT', 'public',
     $q$bucket_id = 'psychologist-photos' AND storage.filename(name) IS NOT NULL
        AND name <> '' AND name NOT LIKE '.%'$q$, NULL),
    ('Psychologists can upload their own photo', 'INSERT', 'authenticated', NULL,
     $q$bucket_id = 'psychologist-photos' AND auth.uid()::text = (storage.foldername(name))[1]$q$),
    ('Psychologists can update their own photo', 'UPDATE', 'authenticated',
     $q$bucket_id = 'psychologist-photos' AND auth.uid()::text = (storage.foldername(name))[1]$q$, NULL),
    ('Psychologists can delete their own photo', 'DELETE', 'authenticated',
     $q$bucket_id = 'psychologist-photos' AND auth.uid()::text = (storage.foldername(name))[1]$q$, NULL)
  ) AS v(name, cmd, role, using_expr, check_expr)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies
                   WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = p.name) THEN
      EXECUTE format('CREATE POLICY %I ON storage.objects FOR %s TO %s%s%s',
        p.name, p.cmd, p.role,
        CASE WHEN p.using_expr IS NOT NULL THEN ' USING (' || p.using_expr || ')' ELSE '' END,
        CASE WHEN p.check_expr IS NOT NULL THEN ' WITH CHECK (' || p.check_expr || ')' ELSE '' END);
    END IF;
  END LOOP;
END $$;
