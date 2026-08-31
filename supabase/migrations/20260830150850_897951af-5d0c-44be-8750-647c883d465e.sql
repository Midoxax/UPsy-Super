-- Session credits ledger: confirm and lock down write paths
REVOKE ALL ON public.session_credits_ledger FROM anon, authenticated, PUBLIC;
GRANT SELECT ON public.session_credits_ledger TO authenticated;
GRANT ALL ON public.session_credits_ledger TO service_role;

ALTER TABLE public.session_credits_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_credits_ledger FORCE ROW LEVEL SECURITY;