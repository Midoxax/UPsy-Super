-- Break-glass access to clinical records.
--
-- Until now any admin account could read every client's session notes,
-- questionnaire results, intake forms, treatment plans and more, silently,
-- through ordinary RLS policies. Clinical content is now visible only to
-- the client and their own specialist. An admin who genuinely needs a
-- record (a request from the client, a safety concern, a legal obligation)
-- calls public.admin_break_glass_read() with a written reason; every call
-- is recorded in the append-only audit_log, reason included.
--
-- Deliberately unchanged:
--   * crisis_alerts: admins keep access, so a crisis is never missed;
--   * anamnesis_reminders: scheduling metadata, not clinical content;
--   * documents and storage objects: invoices and accreditation files the
--     admin team works with day to day;
--   * service-role access (edge functions), which RLS never applied to.

-- 1. Remove routine admin read/manage access to clinical tables.
DROP POLICY IF EXISTS "Admins can view all results" ON public.assessment_results;
DROP POLICY IF EXISTS "Admins manage premium reports" ON public.assessment_premium_reports;
DROP POLICY IF EXISTS "Admins can view all" ON public.athlete_profiles;
DROP POLICY IF EXISTS "Admins view all training sessions" ON public.athlete_training_sessions;
DROP POLICY IF EXISTS "Admins full access anamneses" ON public.client_anamneses;
DROP POLICY IF EXISTS "Admins can view all discharge summaries" ON public.discharge_summaries;
DROP POLICY IF EXISTS "Admins can view all homework" ON public.homework_assignments;
DROP POLICY IF EXISTS "brief_admin_select" ON public.intake_clinical_briefs;
DROP POLICY IF EXISTS "Admins can view mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Admins can view all session notes" ON public.session_notes;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.sessions;
DROP POLICY IF EXISTS "Admins can manage all sessions" ON public.sessions;
DROP POLICY IF EXISTS "Admins can view all treatment plans" ON public.treatment_plans;

-- 2. Break-glass read: one table, one client, a written reason, an audit row.
CREATE OR REPLACE FUNCTION public.admin_break_glass_read(
  _table text,
  _subject_id uuid,
  _reason text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller uuid := auth.uid();
  _rows jsonb;
  _sql text;
BEGIN
  IF _caller IS NULL OR NOT public.has_role(_caller, 'admin'::app_role) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;
  IF _subject_id IS NULL THEN
    RAISE EXCEPTION 'subject required' USING ERRCODE = '22023';
  END IF;
  IF length(btrim(coalesce(_reason, ''))) < 15 THEN
    RAISE EXCEPTION 'a reason of at least 15 characters is required'
      USING ERRCODE = '22023';
  END IF;

  -- Each table with how its rows are tied to the client. Anything not listed
  -- here is refused, so the function can never become a general reader.
  _sql := CASE _table
    WHEN 'assessment_results'   THEN 'SELECT to_jsonb(t) FROM public.assessment_results t WHERE t.user_id = $1'
    WHEN 'assessment_premium_reports' THEN 'SELECT to_jsonb(t) FROM public.assessment_premium_reports t WHERE t.user_id = $1'
    WHEN 'athlete_profiles'     THEN 'SELECT to_jsonb(t) FROM public.athlete_profiles t WHERE t.id = $1'
    WHEN 'athlete_training_sessions' THEN 'SELECT to_jsonb(t) FROM public.athlete_training_sessions t WHERE t.athlete_id = $1'
    WHEN 'client_anamneses'     THEN 'SELECT to_jsonb(t) FROM public.client_anamneses t WHERE t.client_id = $1'
    WHEN 'discharge_summaries'  THEN 'SELECT to_jsonb(t) FROM public.discharge_summaries t WHERE t.client_id = $1'
    WHEN 'homework_assignments' THEN 'SELECT to_jsonb(t) FROM public.homework_assignments t WHERE t.client_id = $1'
    WHEN 'intake_clinical_briefs' THEN 'SELECT to_jsonb(t) FROM public.intake_clinical_briefs t JOIN public.client_anamneses a ON a.id = t.intake_form_id WHERE a.client_id = $1'
    WHEN 'mood_entries'         THEN 'SELECT to_jsonb(t) FROM public.mood_entries t WHERE t.user_id = $1'
    WHEN 'session_notes'        THEN 'SELECT to_jsonb(t) FROM public.session_notes t JOIN public.sessions s ON s.id = t.session_id WHERE s.client_id = $1'
    WHEN 'sessions'             THEN 'SELECT to_jsonb(t) FROM public.sessions t WHERE t.client_id = $1'
    WHEN 'treatment_plans'      THEN 'SELECT to_jsonb(t) FROM public.treatment_plans t WHERE t.client_id = $1'
    ELSE NULL
  END;
  IF _sql IS NULL THEN
    RAISE EXCEPTION 'table % is not available through break-glass access', _table
      USING ERRCODE = '22023';
  END IF;

  EXECUTE 'SELECT coalesce(jsonb_agg(r), ''[]''::jsonb) FROM (' || _sql || ') x(r)'
    INTO _rows USING _subject_id;

  INSERT INTO public.audit_log
    (user_id, action, resource_type, metadata, actor_role, data_class, record_ref, subject_id)
  VALUES
    (_caller, 'break_glass.read', _table,
     jsonb_build_object('reason', btrim(_reason), 'rows', jsonb_array_length(_rows)),
     'admin', 'C1', _table || ':' || _subject_id, _subject_id);

  RETURN _rows;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_break_glass_read(text, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_break_glass_read(text, uuid, text) TO authenticated;

-- 3. The admin overview counted sessions through the dropped policies. It
-- only needs totals by status, never their content.
CREATE OR REPLACE FUNCTION public.admin_session_counts()
RETURNS TABLE (status text, total bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT s.status::text, count(*) FROM public.sessions s GROUP BY s.status;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_session_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_session_counts() TO authenticated;
