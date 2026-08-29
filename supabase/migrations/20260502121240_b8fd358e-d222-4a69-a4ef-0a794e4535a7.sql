
-- Fix security definer view
ALTER VIEW public.active_boosts_public SET (security_invoker = on);

-- Also revoke remaining anon-accessible functions that should be auth-only
REVOKE EXECUTE ON FUNCTION public.check_and_increment_rate_limit(text, integer, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM anon;
