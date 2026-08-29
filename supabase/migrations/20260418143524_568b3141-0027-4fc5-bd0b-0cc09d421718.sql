CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8))
$$;