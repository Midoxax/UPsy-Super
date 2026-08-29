-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE 1 — Compliance, privacy tiers and the audit trail.
-- GDPR + Moroccan Law 09-08 as the floor; HIPAA-aligned controls on top.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Extend the audit log ----------------------------------------------------
ALTER TABLE public.audit_log
  ADD COLUMN IF NOT EXISTS actor_role  text,
  ADD COLUMN IF NOT EXISTS data_class  text NOT NULL DEFAULT 'C4',
  ADD COLUMN IF NOT EXISTS record_ref  text,
  ADD COLUMN IF NOT EXISTS changed     jsonb,
  ADD COLUMN IF NOT EXISTS request_ip  inet,
  ADD COLUMN IF NOT EXISTS user_agent  text,
  ADD COLUMN IF NOT EXISTS subject_id  uuid;

ALTER TABLE public.audit_log
  ADD CONSTRAINT audit_log_data_class_chk
  CHECK (data_class IN ('C1','C2','C3','C4')) NOT VALID;

CREATE INDEX IF NOT EXISTS audit_log_created_idx      ON public.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_actor_idx        ON public.audit_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_subject_idx      ON public.audit_log (subject_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_resource_idx     ON public.audit_log (resource_type, record_ref);
CREATE INDEX IF NOT EXISTS audit_log_class_idx        ON public.audit_log (data_class, created_at DESC);

-- 2. Append-only guarantee ---------------------------------------------------
REVOKE UPDATE, DELETE, TRUNCATE ON public.audit_log FROM authenticated, anon, service_role;
GRANT SELECT ON public.audit_log TO authenticated;
GRANT INSERT, SELECT ON public.audit_log TO service_role;

CREATE OR REPLACE FUNCTION public.audit_log_is_immutable()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only: % is not permitted', TG_OP;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_log_immutable ON public.audit_log;
CREATE TRIGGER trg_audit_log_immutable
  BEFORE UPDATE OR DELETE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_is_immutable();

-- Subjects may read entries about themselves (GDPR art. 15).
DROP POLICY IF EXISTS "Users read own audit entries" ON public.audit_log;
CREATE POLICY "Users read own audit entries" ON public.audit_log
  FOR SELECT TO authenticated
  USING (subject_id = auth.uid() OR user_id = auth.uid());

-- 3. Generic audit trigger ---------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_class   text := COALESCE(TG_ARGV[0], 'C2');
  v_subject text := TG_ARGV[1];
  v_new     jsonb := CASE WHEN TG_OP <> 'DELETE' THEN to_jsonb(NEW) ELSE NULL END;
  v_old     jsonb := CASE WHEN TG_OP <> 'INSERT' THEN to_jsonb(OLD) ELSE NULL END;
  v_keys    jsonb;
  v_ref     text;
  v_subj    uuid;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Field NAMES only. Values are never copied into the log, so a clinical
    -- record can never be reconstructed from the audit trail.
    SELECT jsonb_agg(k ORDER BY k) INTO v_keys
    FROM jsonb_object_keys(v_new) AS k
    WHERE v_new -> k IS DISTINCT FROM v_old -> k;
  END IF;

  v_ref := COALESCE(v_new ->> 'id', v_old ->> 'id');

  IF v_subject IS NOT NULL THEN
    BEGIN
      v_subj := COALESCE(v_new ->> v_subject, v_old ->> v_subject)::uuid;
    EXCEPTION WHEN OTHERS THEN v_subj := NULL;
    END;
  END IF;

  INSERT INTO public.audit_log
    (user_id, actor_role, action, resource_type, resource_id, record_ref,
     data_class, changed, subject_id, metadata)
  VALUES (
    auth.uid(),
    (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() ORDER BY role LIMIT 1),
    lower(TG_OP),
    TG_TABLE_NAME,
    CASE WHEN v_ref ~ '^[0-9a-f]{8}-' THEN v_ref::uuid ELSE NULL END,
    v_ref,
    v_class,
    CASE WHEN v_keys IS NOT NULL THEN jsonb_build_object('fields', v_keys) ELSE NULL END,
    v_subj,
    '{}'::jsonb
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION public.fn_audit() FROM public, anon, authenticated;

-- 4. Attach to every C1 (clinical) and C2 (identity) table -------------------
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      -- table,                     class, subject column
      ('session_notes',             'C1', 'client_id'),
      ('client_anamneses',          'C1', 'user_id'),
      ('journal_entries',           'C1', 'user_id'),
      ('mood_entries',              'C1', 'user_id'),
      ('assessment_results',        'C1', 'user_id'),
      ('crisis_alerts',             'C1', 'user_id'),
      ('intake_clinical_briefs',    'C1', NULL),
      ('treatment_plans',           'C1', 'client_id'),
      ('discharge_summaries',       'C1', 'client_id'),
      ('homework_assignments',      'C1', 'client_id'),
      ('readiness_checkins',        'C1', 'user_id'),
      ('profiles',                  'C2', 'id'),
      ('bookings',                  'C2', 'patient_id'),
      ('documents',                 'C2', 'user_id'),
      ('payment_transactions',      'C2', 'patient_id'),
      ('psychologist_applications', 'C2', 'user_id'),
      ('organization_members',      'C2', NULL),
      ('user_roles',                'C2', 'user_id'),
      ('crm_contacts',              'C3', 'user_id'),
      ('crm_consents',              'C3', NULL)
    ) AS t(tbl, class, subject)
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema='public' AND table_name = r.tbl) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS zz_audit_%1$s ON public.%1$I', r.tbl);
      EXECUTE format(
        'CREATE TRIGGER zz_audit_%1$s AFTER INSERT OR UPDATE OR DELETE ON public.%1$I
           FOR EACH ROW EXECUTE FUNCTION public.fn_audit(%2$L, %3$L)',
        r.tbl, r.class, COALESCE(r.subject, '')
      );
    END IF;
  END LOOP;
END $$;

-- 5. Reads of sensitive data (Postgres has no SELECT trigger) ----------------
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  _resource_type text,
  _record_ref    text,
  _data_class    text DEFAULT 'C1',
  _subject_id    uuid DEFAULT NULL,
  _context       jsonb DEFAULT '{}'::jsonb,
  _user_agent    text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  IF _data_class NOT IN ('C1','C2','C3','C4') THEN
    RAISE EXCEPTION 'invalid data class';
  END IF;

  INSERT INTO public.audit_log
    (user_id, actor_role, action, resource_type, record_ref, data_class,
     subject_id, metadata, user_agent)
  VALUES (
    auth.uid(),
    (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() ORDER BY role LIMIT 1),
    'select_sensitive',
    left(_resource_type, 120),
    left(COALESCE(_record_ref, ''), 120),
    _data_class,
    _subject_id,
    COALESCE(_context, '{}'::jsonb),
    left(COALESCE(_user_agent, ''), 300)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_sensitive_access(text, text, text, uuid, jsonb, text) TO authenticated;

-- 6. Privacy preferences and data-subject requests ---------------------------
CREATE TABLE IF NOT EXISTS public.privacy_preferences (
  user_id               uuid PRIMARY KEY,
  processing_restricted boolean NOT NULL DEFAULT false,
  restriction_reason    text,
  marketing_opt_out     boolean NOT NULL DEFAULT false,
  research_opt_out      boolean NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.privacy_preferences TO authenticated;
GRANT ALL ON public.privacy_preferences TO service_role;
ALTER TABLE public.privacy_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own privacy preferences" ON public.privacy_preferences;
CREATE POLICY "Users manage own privacy preferences" ON public.privacy_preferences
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins read privacy preferences" ON public.privacy_preferences;
CREATE POLICY "Admins read privacy preferences" ON public.privacy_preferences
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.data_subject_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid,
  email         text NOT NULL,
  request_type  text NOT NULL CHECK (request_type IN ('access','rectification','erasure','portability','restriction','objection')),
  status        text NOT NULL DEFAULT 'received' CHECK (status IN ('received','in_progress','fulfilled','refused')),
  legal_basis   text,
  notes         text,
  due_at        timestamptz NOT NULL DEFAULT now() + interval '30 days',
  handled_by    uuid,
  fulfilled_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.data_subject_requests TO authenticated;
GRANT ALL ON public.data_subject_requests TO service_role;
ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users file and read own requests" ON public.data_subject_requests;
CREATE POLICY "Users file and read own requests" ON public.data_subject_requests
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users create own requests" ON public.data_subject_requests;
CREATE POLICY "Users create own requests" ON public.data_subject_requests
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage data subject requests" ON public.data_subject_requests;
CREATE POLICY "Admins manage data subject requests" ON public.data_subject_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS trg_privacy_prefs_updated ON public.privacy_preferences;
CREATE TRIGGER trg_privacy_prefs_updated BEFORE UPDATE ON public.privacy_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_dsr_updated ON public.data_subject_requests;
CREATE TRIGGER trg_dsr_updated BEFORE UPDATE ON public.data_subject_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Six-year retention ------------------------------------------------------
CREATE OR REPLACE FUNCTION public.purge_expired_audit_log()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  ALTER TABLE public.audit_log DISABLE TRIGGER trg_audit_log_immutable;
  WITH gone AS (
    DELETE FROM public.audit_log WHERE created_at < now() - interval '6 years' RETURNING 1
  )
  SELECT count(*) INTO v_deleted FROM gone;
  ALTER TABLE public.audit_log ENABLE TRIGGER trg_audit_log_immutable;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_expired_audit_log() FROM public, anon, authenticated;

DO $$
BEGIN
  PERFORM cron.unschedule('purge-audit-log');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.schedule('purge-audit-log', '17 3 1 * *', 'SELECT public.purge_expired_audit_log();');
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'audit retention cron not scheduled: %', SQLERRM;
END $$;

-- 8. Admin search: "who accessed what" ---------------------------------------
CREATE OR REPLACE FUNCTION public.audit_search(
  _actor    uuid DEFAULT NULL,
  _subject  uuid DEFAULT NULL,
  _resource text DEFAULT NULL,
  _class    text DEFAULT NULL,
  _action   text DEFAULT NULL,
  _from     timestamptz DEFAULT NULL,
  _to       timestamptz DEFAULT NULL,
  _limit    integer DEFAULT 200
)
RETURNS TABLE(
  id uuid, created_at timestamptz, user_id uuid, actor_email text, actor_role text,
  action text, resource_type text, record_ref text, data_class text,
  subject_id uuid, subject_email text, changed jsonb, metadata jsonb, request_ip inet
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT a.id, a.created_at, a.user_id, au.email::text, a.actor_role,
         a.action, a.resource_type, a.record_ref, a.data_class,
         a.subject_id, su.email::text, a.changed, a.metadata, a.request_ip
  FROM public.audit_log a
  LEFT JOIN auth.users au ON au.id = a.user_id
  LEFT JOIN auth.users su ON su.id = a.subject_id
  WHERE (_actor    IS NULL OR a.user_id = _actor)
    AND (_subject  IS NULL OR a.subject_id = _subject)
    AND (_resource IS NULL OR a.resource_type ILIKE '%' || _resource || '%')
    AND (_class    IS NULL OR a.data_class = _class)
    AND (_action   IS NULL OR a.action = _action)
    AND (_from     IS NULL OR a.created_at >= _from)
    AND (_to       IS NULL OR a.created_at <= _to)
  ORDER BY a.created_at DESC
  LIMIT LEAST(COALESCE(_limit, 200), 2000);
END;
$$;

GRANT EXECUTE ON FUNCTION public.audit_search(uuid, uuid, text, text, text, timestamptz, timestamptz, integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.audit_stats(_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_since timestamptz := now() - make_interval(days => LEAST(GREATEST(COALESCE(_days,30),1), 365));
  v_out jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT jsonb_build_object(
    'total',        (SELECT count(*) FROM public.audit_log WHERE created_at >= v_since),
    'clinical',     (SELECT count(*) FROM public.audit_log WHERE created_at >= v_since AND data_class = 'C1'),
    'reads',        (SELECT count(*) FROM public.audit_log WHERE created_at >= v_since AND action = 'select_sensitive'),
    'actors',       (SELECT count(DISTINCT user_id) FROM public.audit_log WHERE created_at >= v_since),
    'oldest_entry', (SELECT min(created_at) FROM public.audit_log),
    'by_class',     (SELECT COALESCE(jsonb_object_agg(data_class, n), '{}'::jsonb)
                     FROM (SELECT data_class, count(*) n FROM public.audit_log
                           WHERE created_at >= v_since GROUP BY 1) x),
    'by_action',    (SELECT COALESCE(jsonb_object_agg(action, n), '{}'::jsonb)
                     FROM (SELECT action, count(*) n FROM public.audit_log
                           WHERE created_at >= v_since GROUP BY 1 ORDER BY n DESC LIMIT 12) y),
    'by_resource',  (SELECT COALESCE(jsonb_object_agg(resource_type, n), '{}'::jsonb)
                     FROM (SELECT resource_type, count(*) n FROM public.audit_log
                           WHERE created_at >= v_since GROUP BY 1 ORDER BY n DESC LIMIT 12) z),
    'open_requests',(SELECT count(*) FROM public.data_subject_requests WHERE status IN ('received','in_progress')),
    'overdue_requests',(SELECT count(*) FROM public.data_subject_requests
                        WHERE status IN ('received','in_progress') AND due_at < now())
  ) INTO v_out;

  RETURN v_out;
END;
$$;

GRANT EXECUTE ON FUNCTION public.audit_stats(integer) TO authenticated;