-- specialist_plans_public is the safe face of specialist_plans (no
-- commission_rate). It was created with security_invoker, so the table's
-- admin-only RLS applied through it and every non-admin, anonymous visitors
-- and specialists alike, got an empty list: the pricing page and the plan tab
-- in the specialist dashboard showed no plans. Run it with the owner's rights
-- instead; it only ever exposes the columns listed in the view.
ALTER VIEW public.specialist_plans_public SET (security_invoker = false);
GRANT SELECT ON public.specialist_plans_public TO anon, authenticated;
