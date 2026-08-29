
-- Fix SECURITY DEFINER view - change to SECURITY INVOKER
ALTER VIEW public.public_review_ratings SET (security_invoker = on);
