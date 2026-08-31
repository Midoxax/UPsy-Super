-- 1) Ownership columns for PII submission tables
ALTER TABLE public.client_matching_requests
  ADD COLUMN IF NOT EXISTS submitted_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS submitted_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "Anyone can submit matching requests" ON public.client_matching_requests;
CREATE POLICY "Anyone can submit matching requests"
ON public.client_matching_requests FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(name)) >= 1 AND length(btrim(name)) <= 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND specialty_needed IS NOT NULL
  AND (submitted_by IS NULL OR submitted_by = auth.uid())
);

CREATE POLICY "Users view own matching requests"
ON public.client_matching_requests FOR SELECT TO authenticated
USING (submitted_by IS NOT NULL AND submitted_by = auth.uid());

CREATE POLICY "Users delete own matching requests"
ON public.client_matching_requests FOR DELETE TO authenticated
USING (submitted_by IS NOT NULL AND submitted_by = auth.uid());

DROP POLICY IF EXISTS "Anyone can submit leads" ON public.leads;
CREATE POLICY "Anyone can submit leads"
ON public.leads FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'new'
  AND psychologist_id IS NULL
  AND (submitted_by IS NULL OR submitted_by = auth.uid())
);

CREATE POLICY "Users view own submitted leads"
ON public.leads FOR SELECT TO authenticated
USING (submitted_by IS NOT NULL AND submitted_by = auth.uid());

CREATE POLICY "Users delete own submitted leads"
ON public.leads FOR DELETE TO authenticated
USING (submitted_by IS NOT NULL AND submitted_by = auth.uid());

-- 2) specialist_plans: commission_rate must never be readable by non-admins
DROP POLICY IF EXISTS "Authenticated can view active plans" ON public.specialist_plans;
REVOKE SELECT ON public.specialist_plans FROM anon;
GRANT SELECT ON public.specialist_plans_public TO anon, authenticated;

-- 3) Trigger functions must never be API-callable
DO $$
DECLARE f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prorettype = 'trigger'::regtype
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f.sig);
  END LOOP;
END $$;

-- 4) Internal queue/service routines: service_role only
DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.delete_email(text,bigint)',
    'public.enqueue_email(text,jsonb)',
    'public.email_queue_dispatch()',
    'public.move_to_dlq(text,text,bigint,jsonb)',
    'public.read_email_batch(text,integer,integer)'
  ] LOOP
    IF to_regprocedure(f) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
    END IF;
  END LOOP;
END $$;

-- 5) Admin / internal RPCs: not callable anonymously
DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.app_logs_search(text,text,text,text,timestamptz,timestamptz,integer)',
    'public.app_logs_stats(integer)',
    'public.audit_search(uuid,uuid,text,text,text,timestamptz,timestamptz,integer)',
    'public.audit_stats(integer)',
    'public.crm_consent_evidence()',
    'public.crm_log_email(text,text,text,text,text,text,text,text,text,jsonb)',
    'public.crm_next_best_actions(integer)',
    'public.crm_pick_owner()',
    'public.crm_pipeline_forecast()',
    'public.crm_record_email_event(text,text,text,text,jsonb)',
    'public.crm_role(uuid)',
    'public.has_crm_access(uuid,text)',
    'public.dsr_admin_list(text,integer)',
    'public.dsr_admin_update(uuid,text,text)',
    'public.dsr_export_my_data(text)',
    'public.dsr_submit(text,text,jsonb,text,text)',
    'public.funnel_metrics(timestamptz,timestamptz)',
    'public.observatoire_answer_stats(text)',
    'public.observatoire_funnel_report(integer)',
    'public.observatoire_summary()',
    'public.ops_has_workspace_access(uuid,uuid)',
    'public.ops_workspace_role(uuid,uuid)',
    'public.promote_home_hero_winner(boolean)',
    'public.quest_start(text)',
    'public.record_payment(uuid,numeric,date,text,text)',
    'public.record_xp(text,integer,streak_kind,text,uuid,jsonb)',
    'public.issue_invoice(uuid,numeric,text,uuid,uuid,integer,text,text)',
    'public.log_sensitive_access(text,text,text,uuid,jsonb,text)',
    'public.increment_ai_usage()',
    'public.revenue_ytd_mad()',
    'public.start_daily_challenge(uuid)',
    'public.has_role(uuid,app_role)',
    'public.has_tier(uuid,membership_tier)'
  ] LOOP
    IF to_regprocedure(f) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', f);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f);
    END IF;
  END LOOP;
END $$;