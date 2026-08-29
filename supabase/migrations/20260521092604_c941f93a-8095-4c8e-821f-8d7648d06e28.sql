-- 1) Tighten specialist_plans: remove public SELECT, restrict to authenticated specialists + admins
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.specialist_plans;

CREATE POLICY "Specialists and admins view plans"
ON public.specialist_plans
FOR SELECT
TO authenticated
USING (
  (is_active = true AND public.has_role(auth.uid(), 'psychologist'::app_role))
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 2) Public safe view (no commission_rate) for pricing pages / anonymous browsing
CREATE OR REPLACE VIEW public.specialist_plans_public
WITH (security_invoker = true) AS
SELECT id, name, tagline, monthly_price_mad, features, sort_order, is_active
FROM public.specialist_plans
WHERE is_active = true;

GRANT SELECT ON public.specialist_plans_public TO anon, authenticated;

-- 3) Fix mutable search_path on email queue helpers
ALTER FUNCTION public.enqueue_email(text, jsonb)     SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint)     SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;