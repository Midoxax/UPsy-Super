-- Closes the two admin paths into clinical content left open by
-- 20261019190000_break_glass_clinical_access.sql, and brings
-- data_subject_requests in line with the production schema.

-- 1. The admin account view showed each client's questionnaire scores.
-- It keeps the dates (useful for support: "did they finish it?") but no
-- longer the score; scores are clinical and go through break-glass.
CREATE OR REPLACE FUNCTION public.admin_user_activity(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_recent_bookings jsonb;
  v_recent_assessments jsonb;
  v_audit_tail jsonb;
  v_journals_30d int;
  v_moods_30d int;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COALESCE(jsonb_agg(b ORDER BY b.scheduled_at DESC), '[]'::jsonb)
    INTO v_recent_bookings
  FROM (
    SELECT id, scheduled_at, status, payment_status, amount_mad
    FROM public.bookings
    WHERE patient_id = _user_id OR psychologist_id = _user_id
    ORDER BY scheduled_at DESC LIMIT 10
  ) b;

  SELECT COALESCE(jsonb_agg(a ORDER BY a.completed_at DESC), '[]'::jsonb)
    INTO v_recent_assessments
  FROM (
    SELECT id, assessment_id, completed_at
    FROM public.assessment_results
    WHERE user_id = _user_id
    ORDER BY completed_at DESC NULLS LAST LIMIT 5
  ) a;

  SELECT COALESCE(jsonb_agg(al ORDER BY al.created_at DESC), '[]'::jsonb)
    INTO v_audit_tail
  FROM (
    SELECT id, action, resource_type, resource_id, created_at, metadata
    FROM public.audit_log
    WHERE user_id = _user_id OR resource_id = _user_id
    ORDER BY created_at DESC LIMIT 10
  ) al;

  SELECT COUNT(*) INTO v_journals_30d
  FROM public.journal_entries
  WHERE user_id = _user_id AND created_at >= now() - interval '30 days';

  SELECT COUNT(*) INTO v_moods_30d
  FROM public.mood_entries
  WHERE user_id = _user_id AND created_at >= now() - interval '30 days';

  RETURN jsonb_build_object(
    'recent_bookings', v_recent_bookings,
    'recent_assessments', v_recent_assessments,
    'audit_tail', v_audit_tail,
    'journals_30d', v_journals_30d,
    'moods_30d', v_moods_30d
  );
END;
$$;

-- 2. Uploaded files. Admins could read every file in user-documents. Now an
-- admin opens one person's folder through admin_break_glass_files(), which
-- requires a reason and writes the audit row; that row then lets the same
-- admin download from that folder for 15 minutes, and nothing else.
DROP POLICY IF EXISTS "Admins can view all user documents" ON storage.objects;

CREATE OR REPLACE FUNCTION public.break_glass_files_open(_folder text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
     AND EXISTS (
       SELECT 1 FROM public.audit_log
       WHERE user_id = auth.uid()
         AND action = 'break_glass.read'
         AND record_ref = 'user-documents:' || _folder
         AND created_at > now() - interval '15 minutes'
     );
$$;
REVOKE ALL ON FUNCTION public.break_glass_files_open(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.break_glass_files_open(text) TO authenticated;

DROP POLICY IF EXISTS "Admins read user documents after break-glass" ON storage.objects;
CREATE POLICY "Admins read user documents after break-glass" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'user-documents'
         AND public.break_glass_files_open((storage.foldername(name))[1]));

CREATE OR REPLACE FUNCTION public.admin_break_glass_files(_subject_id uuid, _reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller uuid := auth.uid();
  _files jsonb;
BEGIN
  IF NOT public.has_role(_caller, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF length(btrim(coalesce(_reason, ''))) < 15 THEN
    RAISE EXCEPTION 'A reason of at least 15 characters is required'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
           'path', o.name,
           'size', (o.metadata->>'size')::bigint,
           'created_at', o.created_at) ORDER BY o.created_at DESC), '[]'::jsonb)
    INTO _files
  FROM storage.objects o
  WHERE o.bucket_id = 'user-documents'
    AND (storage.foldername(o.name))[1] = _subject_id::text;

  INSERT INTO public.audit_log
    (user_id, action, resource_type, metadata, actor_role, data_class, record_ref, subject_id)
  VALUES
    (_caller, 'break_glass.read', 'user-documents',
     jsonb_build_object('reason', btrim(_reason), 'files', jsonb_array_length(_files)),
     'admin', 'C1', 'user-documents:' || _subject_id, _subject_id);

  RETURN _files;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_break_glass_files(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_break_glass_files(uuid, text) TO authenticated;

-- 3. Production gained these columns outside the migration history (they
-- appear in the generated types). Adding them here makes a fresh database
-- match production; on production every statement is a no-op.
ALTER TABLE public.data_subject_requests
  ADD COLUMN IF NOT EXISTS channel           text NOT NULL DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS evidence          jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS export_bytes      bigint,
  ADD COLUMN IF NOT EXISTS exported_at       timestamptz,
  ADD COLUMN IF NOT EXISTS reference         text,
  ADD COLUMN IF NOT EXISTS requested_changes jsonb,
  ADD COLUMN IF NOT EXISTS resolution        text,
  ADD COLUMN IF NOT EXISTS verified_at       timestamptz;
