
-- 1) Remove direct user INSERT on audit_log; only SECURITY DEFINER functions / service role write.
DROP POLICY IF EXISTS "Users insert own audit events" ON public.audit_log;

-- 2) Restrict specialist_plans SELECT to admins only. Specialists/marketing read from
--    specialist_plans_public (commission_rate excluded) or via SECURITY DEFINER RPC
--    get_specialist_plan for their own effective plan.
DROP POLICY IF EXISTS "Specialists and admins view plans" ON public.specialist_plans;

CREATE POLICY "Admins view plans"
  ON public.specialist_plans
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
