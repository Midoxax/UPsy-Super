-- Attach audit triggers to sensitive clinical tables.
-- The log_sensitive_change() function already exists and writes into public.audit_log.

DROP TRIGGER IF EXISTS trg_audit_mood_entries ON public.mood_entries;
CREATE TRIGGER trg_audit_mood_entries
AFTER INSERT OR UPDATE OR DELETE ON public.mood_entries
FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_change();

DROP TRIGGER IF EXISTS trg_audit_assessment_results ON public.assessment_results;
CREATE TRIGGER trg_audit_assessment_results
AFTER INSERT OR UPDATE OR DELETE ON public.assessment_results
FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_change();

DROP TRIGGER IF EXISTS trg_audit_session_notes ON public.session_notes;
CREATE TRIGGER trg_audit_session_notes
AFTER INSERT OR UPDATE OR DELETE ON public.session_notes
FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_change();