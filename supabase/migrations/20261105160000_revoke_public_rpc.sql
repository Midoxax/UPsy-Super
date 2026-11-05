-- Security hardening from the Supabase advisor review.
--
-- 1. The rate-limit counter is only called by server code with the service
--    role. Visitors could bump any key and lock other people out.
REVOKE EXECUTE ON FUNCTION public.check_and_increment_rate_limit(text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(text, integer, integer)
  TO service_role;

-- 2. Admin RPCs already refuse non-admins inside; anonymous visitors should
--    not reach them at all. Trigger functions are never called directly
--    (PostgreSQL checks EXECUTE on them only when the trigger is created).
DO $$
DECLARE
  f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
      AND (p.proname LIKE 'admin\_%' OR p.prorettype = 'trigger'::regtype)
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', f.sig);
  END LOOP;
END $$;

-- 3. Platform totals are for the admin dashboard, not for visitors.
REVOKE SELECT ON public.admin_platform_stats FROM anon;
