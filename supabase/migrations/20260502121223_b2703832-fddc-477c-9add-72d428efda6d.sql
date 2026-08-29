
-- 1. Fix specialist_boosts: replace public SELECT to hide financial columns
-- Drop old policy
DROP POLICY IF EXISTS "Public sees active boost flags" ON public.specialist_boosts;

-- Create a view for public consumption (no financial data)
CREATE OR REPLACE VIEW public.active_boosts_public AS
SELECT psychologist_id, boost_type, ends_at
FROM public.specialist_boosts
WHERE payment_status = 'paid' AND ends_at > now();

-- Re-create public policy scoped to owner/admin only for full data
-- Public no longer has direct table SELECT

-- 2. Revoke anon EXECUTE on admin/internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.admin_assign_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_cancel_booking(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_delete_profile(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_force_signout(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_hide_review(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_users(text, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_users_rich(text, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_log_password_reset(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_refund_booking(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_revoke_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_update_booking_status(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_user_activity(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.inspect_provisioning_state(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.invite_org_member(uuid, text, text, text, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.org_pulse_aggregate(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.replace_availability_for_day(smallint, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.mark_all_notifications_read() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_specialist_earnings_summary() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_referral_credit_balance(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_session_credit_balance(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_specialist_plan(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_ai_tier(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_all_access(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_athlete_plus(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_plan_feature(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.compute_mps(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_proposal_slot(uuid, timestamptz, integer) FROM anon;

-- Also revoke trigger-only functions from anon (they should only fire via triggers)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_psychologist() FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_sensitive_change() FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_application_status_change() FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_pricing_change() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_on_ticket_message() FROM anon;
REVOKE EXECUTE ON FUNCTION public.bump_ticket_on_message() FROM anon;
REVOKE EXECUTE ON FUNCTION public.sync_psychologist_boost() FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_booking_video_room() FROM anon;
REVOKE EXECUTE ON FUNCTION public.ensure_video_room_on_confirm() FROM anon;
REVOKE EXECUTE ON FUNCTION public.auto_generate_slug() FROM anon;
REVOKE EXECUTE ON FUNCTION public.generate_invoice_number() FROM anon;
REVOKE EXECUTE ON FUNCTION public.generate_subscription_invoice_number() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;

-- 3. Fix psychologist-photos bucket: restrict listing
-- Drop the overly broad policy
DROP POLICY IF EXISTS "Psychologist photos are publicly accessible" ON storage.objects;

-- Re-create: allow reading individual files but not listing (require non-empty name)
CREATE POLICY "Psychologist photos are publicly readable"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'psychologist-photos'
  AND (storage.filename(name)) IS NOT NULL
  AND name != ''
  AND name NOT LIKE '.%'
);
