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
