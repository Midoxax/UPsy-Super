-- Fix the clinical audit trigger, which made inserts and updates fail.
--
-- log_sensitive_change() runs on session_notes, mood_entries,
-- assessment_results, client_anamneses, treatment_plans,
-- homework_assignments and discharge_summaries. It read the owner as
--   CASE TG_TABLE_NAME WHEN 'session_notes' THEN NEW.psychologist_id
--                      ELSE NEW.user_id END
-- but PL/pgSQL resolves every field in an expression, whichever branch
-- runs, and none of these tables has both columns. Every write therefore
-- raised `record "new" has no field ...`: saving a session note, a
-- questionnaire result or an intake form failed.
--
-- Reading the row as jsonb looks fields up at run time, so a column that a
-- table does not have is simply null.
CREATE OR REPLACE FUNCTION public.log_sensitive_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_row jsonb := to_jsonb(COALESCE(NEW, OLD));
  v_owner uuid;
BEGIN
  v_owner := COALESCE(
    CASE WHEN TG_TABLE_NAME = 'session_notes'
         THEN (v_row->>'psychologist_id')::uuid END,
    (v_row->>'user_id')::uuid,
    (v_row->>'client_id')::uuid,
    auth.uid()
  );

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    (v_row->>'id')::uuid,
    jsonb_build_object('owner_id', v_owner)
  );

  RETURN COALESCE(NEW, OLD);
END;
$function$;

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
