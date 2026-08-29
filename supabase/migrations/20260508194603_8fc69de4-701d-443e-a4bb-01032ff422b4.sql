-- 1. session_credits_ledger: remove user INSERT (purchases must come from server-side flows)
DROP POLICY IF EXISTS "Users create own credit purchases" ON public.session_credits_ledger;

-- 2. platform_pricing_config: restrict SELECT to admins only
DROP POLICY IF EXISTS "Authenticated users can view active pricing config" ON public.platform_pricing_config;
CREATE POLICY "Admins view pricing config"
  ON public.platform_pricing_config
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. specialist_boosts: replace ALL self-policy with read-only
DROP POLICY IF EXISTS "Specialists manage own boosts" ON public.specialist_boosts;
CREATE POLICY "Specialists view own boosts"
  ON public.specialist_boosts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = psychologist_id);
