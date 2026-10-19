-- Finish the privacy rollout on production (run once, in the Supabase SQL editor).
--
-- Already applied to production on 2026-10-19 through the Supabase connector:
--   * fix_log_sensitive_change      (clinical records can be saved again)
--   * break_glass_clinical_access_functions, break_glass_files_and_activity
--   * storage_buckets_baseline
-- The steps below remove or delete things, which the connector would not run
-- without an interactive confirmation, so they are collected here.
--
-- How to run: Supabase dashboard > SQL Editor > New query > paste this whole
-- file > Run. It is one transaction: if any statement fails, nothing changes.
-- Every statement is idempotent, so running it twice is harmless.
--
-- Effects, in order:
--   1. Removes duplicate audit triggers (every write was logged two or three
--      times) and makes intake-form and crisis-alert audit rows name the client.
--   2. Removes routine admin read access to clinical tables. Admins then use
--      the "Clinical" tab (break-glass: written reason, audited). Crisis alerts
--      stay visible to admins.
--   3. Adds 10-year clinical retention: a policy table, the purge function and
--      a monthly job. Nothing on the platform is near 10 years old, so it
--      deletes nothing today.

BEGIN;

-- 1. Audit triggers --------------------------------------------------------
-- mood_entries, assessment_results and session_notes each carried this
-- trigger twice (audit_* and trg_audit_*), so every write was logged twice
-- on top of the newer fn_audit row. Keep one.
DROP TRIGGER IF EXISTS audit_mood_entries ON public.mood_entries;
DROP TRIGGER IF EXISTS audit_assessment_results ON public.assessment_results;
DROP TRIGGER IF EXISTS audit_session_notes ON public.session_notes;

-- fn_audit() was attached to these with a subject column they do not have,
-- so their audit rows never named the client. Re-attach with the real one.
DROP TRIGGER IF EXISTS zz_audit_client_anamneses ON public.client_anamneses;
CREATE TRIGGER zz_audit_client_anamneses
  AFTER INSERT OR UPDATE OR DELETE ON public.client_anamneses
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit('C1', 'client_id');
DROP TRIGGER IF EXISTS zz_audit_crisis_alerts ON public.crisis_alerts;
CREATE TRIGGER zz_audit_crisis_alerts
  AFTER INSERT OR UPDATE OR DELETE ON public.crisis_alerts
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit('C1', 'client_id');

-- 2. Routine admin access to clinical tables ------------------------------
DROP POLICY IF EXISTS "Admins can view all results" ON public.assessment_results;
DROP POLICY IF EXISTS "Admins manage premium reports" ON public.assessment_premium_reports;
DROP POLICY IF EXISTS "Admins can view all" ON public.athlete_profiles;
DROP POLICY IF EXISTS "Admins view all training sessions" ON public.athlete_training_sessions;
DROP POLICY IF EXISTS "Admins full access anamneses" ON public.client_anamneses;
DROP POLICY IF EXISTS "Admins can view all discharge summaries" ON public.discharge_summaries;
DROP POLICY IF EXISTS "Admins can view all homework" ON public.homework_assignments;
DROP POLICY IF EXISTS "brief_admin_select" ON public.intake_clinical_briefs;
DROP POLICY IF EXISTS "Admins can view mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Admins can view all session notes" ON public.session_notes;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.sessions;
DROP POLICY IF EXISTS "Admins can manage all sessions" ON public.sessions;
DROP POLICY IF EXISTS "Admins can view all treatment plans" ON public.treatment_plans;

-- 3. Clinical retention ----------------------------------------------------
-- Retention of clinical records: 10 years after the client's last activity.
--
-- Health records must be kept long enough to support continuity of care and
-- answer complaints, and no longer. 10 years after the last contact is the
-- common international baseline for adult records (HIPAA itself sets 6 years
-- for its own documentation and leaves medical records to local rules, most
-- of which require 7–10). Invoices are kept separately for the 10 years
-- Moroccan accounting law requires, and the audit log for 6 years
-- (purge_expired_audit_log).
--
-- "Last activity" is the most recent of: the client's last sign-in, any
-- session with them, and any clinical record about them. A client who is
-- still active is never purged, whatever the age of their oldest records.
-- Clients whose account was deleted (on request, reviewed by an admin) keep
-- their clinical records, locked away from everyone but their specialist,
-- until the same 10 years have passed.

CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  category    text PRIMARY KEY,
  keep_for    interval NOT NULL CHECK (keep_for >= interval '1 year'),
  description text NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.data_retention_policies FROM anon, authenticated;
GRANT SELECT ON public.data_retention_policies TO authenticated;
DROP POLICY IF EXISTS "Admins read retention policies" ON public.data_retention_policies;
CREATE POLICY "Admins read retention policies" ON public.data_retention_policies
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.data_retention_policies (category, keep_for, description) VALUES
  ('clinical', interval '10 years',
   'Session notes, questionnaires, intake forms, treatment plans, journals, mood and AI conversations: deleted 10 years after the client''s last activity.')
ON CONFLICT (category) DO NOTHING;

-- Deletes the clinical records of every client inactive for longer than the
-- 'clinical' retention period. With _dry_run it only reports what it would
-- delete. Each purged client gets one audit_log row with counts, never
-- content.
CREATE OR REPLACE FUNCTION public.purge_expired_clinical_records(_dry_run boolean DEFAULT false)
RETURNS TABLE (subject_id uuid, last_activity timestamptz, rows_deleted bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _keep interval;
  _s record;
  _n bigint;
  _total bigint;
BEGIN
  SELECT keep_for INTO _keep FROM public.data_retention_policies WHERE category = 'clinical';
  IF _keep IS NULL THEN
    RAISE EXCEPTION 'no clinical retention policy configured';
  END IF;

  FOR _s IN
    WITH activity (sid, at) AS (
      SELECT id, last_sign_in_at FROM auth.users
      UNION ALL SELECT client_id, greatest(date_time, created_at) FROM public.sessions
      UNION ALL SELECT user_id, created_at FROM public.assessment_results
      UNION ALL SELECT user_id, created_at FROM public.assessment_premium_reports
      UNION ALL SELECT user_id, created_at FROM public.mood_entries
      UNION ALL SELECT user_id, coalesce(updated_at, created_at) FROM public.journal_entries
      UNION ALL SELECT user_id, created_at FROM public.readiness_checkins
      UNION ALL SELECT client_id, coalesce(updated_at, created_at) FROM public.client_anamneses
      UNION ALL SELECT client_id, created_at FROM public.crisis_alerts
      UNION ALL SELECT client_id, coalesce(updated_at, created_at) FROM public.treatment_plans
      UNION ALL SELECT client_id, coalesce(updated_at, created_at) FROM public.homework_assignments
      UNION ALL SELECT client_id, created_at FROM public.discharge_summaries
      UNION ALL SELECT user_id, coalesce(updated_at, created_at) FROM public.ai_conversations
      UNION ALL SELECT user_id, created_at FROM public.ai_chat_history
      UNION ALL SELECT id, coalesce(updated_at, created_at) FROM public.athlete_profiles
      UNION ALL SELECT athlete_id, created_at FROM public.athlete_training_sessions
    )
    SELECT sid, max(at) AS last_at
    FROM activity
    WHERE sid IS NOT NULL
    GROUP BY sid
    -- max() ignores nulls; a subject with no dated activity at all is left alone.
    HAVING max(at) < now() - _keep
  LOOP
    _total := 0;

    IF _dry_run THEN
      SELECT
        (SELECT count(*) FROM public.session_notes n JOIN public.sessions x ON x.id = n.session_id WHERE x.client_id = _s.sid)
      + (SELECT count(*) FROM public.assessment_results WHERE user_id = _s.sid)
      + (SELECT count(*) FROM public.assessment_premium_reports WHERE user_id = _s.sid)
      + (SELECT count(*) FROM public.mood_entries WHERE user_id = _s.sid)
      + (SELECT count(*) FROM public.journal_entries WHERE user_id = _s.sid)
      + (SELECT count(*) FROM public.readiness_checkins WHERE user_id = _s.sid)
      + (SELECT count(*) FROM public.crisis_alerts WHERE client_id = _s.sid)
      + (SELECT count(*) FROM public.anamnesis_reminders WHERE client_id = _s.sid)
      + (SELECT count(*) FROM public.client_anamneses WHERE client_id = _s.sid)
      + (SELECT count(*) FROM public.treatment_plans WHERE client_id = _s.sid)
      + (SELECT count(*) FROM public.homework_assignments WHERE client_id = _s.sid)
      + (SELECT count(*) FROM public.discharge_summaries WHERE client_id = _s.sid)
      + (SELECT count(*) FROM public.ai_conversations WHERE user_id = _s.sid)
      + (SELECT count(*) FROM public.ai_chat_history WHERE user_id = _s.sid)
      + (SELECT count(*) FROM public.athlete_training_sessions WHERE athlete_id = _s.sid)
      + (SELECT count(*) FROM public.athlete_profiles WHERE id = _s.sid)
      INTO _total;
    ELSE
      -- Sessions are appointment records (kept with billing), and deleting
      -- one would also delete the client's public review. Their clinical
      -- content goes: the notes written about them and the free-text field.
      DELETE FROM public.session_notes n USING public.sessions x
        WHERE x.id = n.session_id AND x.client_id = _s.sid;
      GET DIAGNOSTICS _n = ROW_COUNT; _total := _total + _n;
      UPDATE public.sessions SET notes = NULL WHERE client_id = _s.sid AND notes IS NOT NULL;

      DELETE FROM public.assessment_results WHERE user_id = _s.sid;
      GET DIAGNOSTICS _n = ROW_COUNT; _total := _total + _n;
      DELETE FROM public.assessment_premium_reports WHERE user_id = _s.sid;
      GET DIAGNOSTICS _n = ROW_COUNT; _total := _total + _n;
      DELETE FROM public.mood_entries WHERE user_id = _s.sid;
      GET DIAGNOSTICS _n = ROW_COUNT; _total := _total + _n;
      DELETE FROM public.journal_entries WHERE user_id = _s.sid;
      GET DIAGNOSTICS _n = ROW_COUNT; _total := _total + _n;
      DELETE FROM public.readiness_checkins WHERE user_id = _s.sid;
      GET DIAGNOSTICS _n = ROW_COUNT; _total := _total + _n;
      -- Crisis alerts point at intake forms without ON DELETE: remove first.
      DELETE FROM public.crisis_alerts WHERE client_id = _s.sid;
      GET DIAGNOSTICS _n = ROW_COUNT; _total := _total + _n;
      DELETE FROM public.anamnesis_reminders WHERE client_id = _s.sid;
      GET DIAGNOSTICS _n = ROW_COUNT; _total := _total + _n;
      -- Clinical briefs cascade from their intake form.
      DELETE FROM public.client_anamneses WHERE client_id = _s.sid;
      GET DIAGNOSTICS _n = ROW_COUNT; _total := _total + _n;
      DELETE FROM public.treatment_plans WHERE client_id = _s.sid;
      GET DIAGNOSTICS _n = ROW_COUNT; _total := _total + _n;
      DELETE FROM public.homework_assignments WHERE client_id = _s.sid;
      GET DIAGNOSTICS _n = ROW_COUNT; _total := _total + _n;
      DELETE FROM public.discharge_summaries WHERE client_id = _s.sid;
      GET DIAGNOSTICS _n = ROW_COUNT; _total := _total + _n;
      -- AI messages cascade from their conversation.
      DELETE FROM public.ai_conversations WHERE user_id = _s.sid;
      GET DIAGNOSTICS _n = ROW_COUNT; _total := _total + _n;
      DELETE FROM public.ai_chat_history WHERE user_id = _s.sid;
      GET DIAGNOSTICS _n = ROW_COUNT; _total := _total + _n;
      DELETE FROM public.athlete_training_sessions WHERE athlete_id = _s.sid;
      GET DIAGNOSTICS _n = ROW_COUNT; _total := _total + _n;
      DELETE FROM public.athlete_profiles WHERE id = _s.sid;
      GET DIAGNOSTICS _n = ROW_COUNT; _total := _total + _n;

      IF _total > 0 THEN
        INSERT INTO public.audit_log
          (action, resource_type, metadata, actor_role, data_class, subject_id, record_ref)
        VALUES
          ('retention.purge', 'clinical',
           jsonb_build_object('rows_deleted', _total, 'last_activity', _s.last_at, 'kept_for', _keep::text),
           'system', 'C1', _s.sid, 'clinical:' || _s.sid);
      END IF;
    END IF;

    IF _total > 0 THEN
      subject_id := _s.sid;
      last_activity := _s.last_at;
      rows_deleted := _total;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;

-- Only the scheduler (as the database owner) and the service role run it.
REVOKE ALL ON FUNCTION public.purge_expired_clinical_records(boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_clinical_records(boolean) TO service_role;

-- Monthly, on the 2nd at 03:41 UTC (after the audit and app log purges on the 1st).
DO $$ BEGIN PERFORM cron.unschedule('purge-expired-clinical-records'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  PERFORM cron.schedule('purge-expired-clinical-records', '41 3 2 * *',
    'SELECT count(*) FROM public.purge_expired_clinical_records();');
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'clinical retention cron not scheduled: %', SQLERRM;
END $$;

COMMIT;
