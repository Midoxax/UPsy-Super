-- Admins get full read/write access to every operational table.
--
-- Deliberately left out, so this can never be used to bypass them:
--   * clinical content (session notes, intake forms, questionnaires, mood,
--     journals, AI conversations, athlete records, treatment plans…): still
--     reachable by admins only through public.admin_break_glass_read(), which
--     requires a written reason and writes an audit_log row (professional
--     secrecy, Law 09-08);
--   * evidence that must not be rewritten: audit_log, app_logs, legal
--     acceptances, consents, privacy preferences, invoices and their counter,
--     payment proofs, pricing history, retention policies, event logs;
--   * secrets: push subscriptions, calendar feed tokens, unsubscribe tokens,
--     rate-limit counters.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'ai_usage_meter', 'availability_slots', 'booking_emails',
    'client_matching_requests', 'community_posts', 'contact_submissions',
    'crm_activities', 'crm_automation_rules', 'crm_contacts', 'crm_deals',
    'crm_email_events', 'crm_email_messages', 'crm_notifications',
    'crm_organisations', 'crm_stages', 'email_send_log', 'email_send_state',
    'gamification_badges', 'gamification_levels', 'growth_leads', 'languages',
    'leads', 'league_reviews', 'notification_preferences',
    'ops_director_messages', 'ops_director_threads', 'ops_events',
    'ops_protocol_phases', 'ops_task_events', 'ops_tasks',
    'ops_workspace_members', 'ops_workspaces', 'organization_members',
    'payment_settings', 'post_comments', 'post_reactions', 'profiles',
    'proposal_requests', 'protocol_completions', 'psychologist_applications',
    'psychologist_languages', 'psychologist_profiles', 'psychologist_specialties',
    'psychologist_therapy_approaches', 'referrals', 'resource_completions',
    'space_members', 'specialties', 'study_enrollments', 'subscriptions',
    'support_ticket_messages', 'suppressed_emails', 'therapy_approaches',
    'user_badges', 'user_daily_challenges', 'user_progress',
    'user_quest_progress', 'user_skill_nodes', 'user_streaks', 'xp_events'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "admins full access" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "admins full access" ON public.%I FOR ALL TO authenticated
         USING (public.has_role(auth.uid(), ''admin''::app_role))
         WITH CHECK (public.has_role(auth.uid(), ''admin''::app_role))', t);
    EXECUTE format(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  END LOOP;
END $$;

-- Payments: admins may correct a record but never delete one (accounting).
DROP POLICY IF EXISTS "admins update payments" ON public.payments;
CREATE POLICY "admins update payments" ON public.payments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
