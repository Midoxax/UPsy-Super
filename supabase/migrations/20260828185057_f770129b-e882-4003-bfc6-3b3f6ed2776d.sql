REVOKE ALL ON FUNCTION public.crm_link_profile_to_contact() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.crm_link_profile_to_contact() TO service_role;