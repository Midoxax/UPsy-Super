-- SECURITY DEFINER functions run with the owner's rights, and Postgres
-- grants EXECUTE to PUBLIC by default, so these were callable by anyone with
-- the public anon key through /rest/v1/rpc:
--
--   create_admin_user          created a confirmed admin account
--   read_email_batch et al.    read and rewrote the outgoing email queue,
--                              which holds password-reset and magic links
--   crm_log_email, crm_record_email_event, crm_record_consent, crm_pick_owner
--                              wrote CRM history and consent for any email
--   compute_mps                returned any user's mood-based score (now
--                              limited to the caller's own, or an admin)
--   purge_expired_audit_log    toggled the audit log's immutability trigger
--
-- Only edge functions (service role) and the database itself call them, so
-- they lose EXECUTE for everyone else. purge_app_logs keeps authenticated
-- (the admin log screen calls it) but now checks the caller is an admin.

DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.create_admin_user(text, text)',
    'public.read_email_batch(text, integer, integer)',
    'public.enqueue_email(text, jsonb)',
    'public.delete_email(text, bigint)',
    'public.move_to_dlq(text, text, bigint, jsonb)',
    'public.email_queue_dispatch()',
    'public.crm_log_email(text, text, text, text, text, text, text, text, text, jsonb)',
    'public.crm_record_email_event(text, text, text, text, jsonb)',
    'public.crm_record_consent(text, text, boolean, text, text, text, text, text, text, text, text, jsonb)',
    'public.crm_pick_owner()',
    'public.purge_expired_audit_log()'
  ] LOOP
    IF to_regprocedure(f) IS NOT NULL THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f);
    END IF;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.purge_app_logs()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_deleted integer;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'admins only';
  END IF;
  WITH gone AS (
    DELETE FROM public.app_logs
    WHERE (source <> 'deploy' AND created_at < now() - interval '13 months')
       OR (source =  'deploy' AND created_at < now() - interval '6 years')
    RETURNING 1
  )
  SELECT count(*) INTO v_deleted FROM gone;
  RETURN v_deleted;
END $$;
REVOKE EXECUTE ON FUNCTION public.purge_app_logs() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purge_app_logs() TO authenticated, service_role;

-- compute_mps: the dashboard asks for the signed-in user's own score.
DO $$
DECLARE def text;
BEGIN
  IF to_regprocedure('public.compute_mps(uuid)') IS NULL THEN RETURN; END IF;
  def := pg_get_functiondef('public.compute_mps(uuid)'::regprocedure);
  IF def !~ 'own score only' THEN
    def := regexp_replace(def, E'\nBEGIN\n', E'\nBEGIN\n  -- own score only\n  IF auth.uid() IS NOT NULL AND auth.uid() <> _user_id\n     AND NOT public.has_role(auth.uid(), ''admin''::app_role) THEN\n    RAISE EXCEPTION ''not allowed'';\n  END IF;\n');
    EXECUTE def;
  END IF;
  REVOKE EXECUTE ON FUNCTION public.compute_mps(uuid) FROM PUBLIC, anon;
  GRANT EXECUTE ON FUNCTION public.compute_mps(uuid) TO authenticated, service_role;
END $$;

ALTER FUNCTION public.distance_km SET search_path = public;
