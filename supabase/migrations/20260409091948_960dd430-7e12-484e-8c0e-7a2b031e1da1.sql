
-- Fix views to use security invoker (respects caller's RLS)
ALTER VIEW public.admin_platform_stats SET (security_invoker = true);
ALTER VIEW public.bookings_with_details SET (security_invoker = true);
ALTER VIEW public.org_usage_summary SET (security_invoker = true);
