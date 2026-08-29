REVOKE ALL ON FUNCTION public.audit_log_is_immutable() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_audit() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_expired_audit_log() FROM public, anon, authenticated;