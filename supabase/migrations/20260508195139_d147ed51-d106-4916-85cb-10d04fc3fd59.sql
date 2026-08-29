-- 1. edge_rate_limits: add explicit deny-all policy (service role bypasses RLS)
CREATE POLICY "No direct access" ON public.edge_rate_limits FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

-- 2. Revoke EXECUTE from anon and authenticated on admin/sensitive SECURITY DEFINER functions
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND p.proname IN (
        'admin_assign_role','admin_cancel_booking','admin_delete_profile','admin_force_signout',
        'admin_hide_review','admin_list_users','admin_list_users_rich','admin_log_password_reset',
        'admin_refund_booking','admin_revoke_role','admin_set_user_suspended','admin_update_booking_status',
        'admin_user_activity','create_admin_user','inspect_provisioning_state','invite_org_member',
        'org_pulse_aggregate','log_pricing_change','log_sensitive_change','log_application_status_change',
        'sync_psychologist_boost','generate_invoice_number','generate_subscription_invoice_number',
        'handle_new_user','handle_new_psychologist','set_booking_video_room','ensure_video_room_on_confirm',
        'auto_generate_slug','update_updated_at_column','bump_ticket_on_message','notify_on_ticket_message',
        'check_and_increment_rate_limit','generate_referral_code','generate_slug','compute_mps'
      )
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC, anon, authenticated', r.schema_name, r.proname, r.args);
  END LOOP;
END $$;

-- 3. Realtime: scope channel subscriptions per user
-- Topic conventions: notifications:{user_id}, support_tickets:{user_id}, support_ticket_messages:{ticket_id}
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='realtime' AND c.relname='messages') THEN
    EXECUTE 'DROP POLICY IF EXISTS "User-scoped realtime read" ON realtime.messages';
    EXECUTE $p$
      CREATE POLICY "User-scoped realtime read" ON realtime.messages
        FOR SELECT TO authenticated
        USING (
          (realtime.topic() LIKE 'notifications:%' AND realtime.topic() = 'notifications:' || auth.uid()::text)
          OR (realtime.topic() LIKE 'support_tickets:%' AND realtime.topic() = 'support_tickets:' || auth.uid()::text)
          OR public.has_role(auth.uid(), 'admin'::app_role)
        )
    $p$;
  END IF;
END $$;
