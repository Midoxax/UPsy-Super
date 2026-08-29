-- 1) Referrals: remove blanket public read; add a secure RPC for code resolution
DROP POLICY IF EXISTS "Public can resolve referral code" ON public.referrals;

CREATE OR REPLACE FUNCTION public.resolve_referral_code(_code text)
RETURNS TABLE(referrer_id uuid, code text, status text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.referrer_id, r.code, r.status
  FROM public.referrals r
  WHERE r.code = upper(trim(_code))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_referral_code(text) TO anon, authenticated;

-- 2) Storage: tighten accreditation-docs bucket — drop open upload policy
DROP POLICY IF EXISTS "Authenticated users can upload accreditation docs" ON storage.objects;

-- 3) Audit log: allow authenticated users to insert their own events
DROP POLICY IF EXISTS "Users insert own audit events" ON public.audit_log;
CREATE POLICY "Users insert own audit events"
ON public.audit_log FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4) Realtime: drop bookings from publication (no realtime UI uses it yet, prevents leak)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'bookings'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.bookings';
  END IF;
END $$;