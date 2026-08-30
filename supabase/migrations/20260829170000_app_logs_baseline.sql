-- ─────────────────────────────────────────────────────────────────────────────
-- app_logs — bring the runtime operations log under version control.
--
-- The table and its four routines were created directly against the database
-- and never captured in a migration, so `supabase db push` into an empty
-- project produced a schema with 150 of the 151 tables the generated types
-- describe. The admin Operations-log panel (/admin/audit → "Operations log")
-- and the fire-and-forget error sink in src/start.ts both target objects that
-- did not exist in source, which scripts/check-supabase-sync.mjs reports as a
-- table "created outside version control".
--
-- Reconstructed from the generated types (src/integrations/supabase/types.ts),
-- the RPC call sites (src/hooks/admin/useAppLogs.ts, src/start.ts,
-- src/routes/api/public/ci-events.ts) and the conventions of the audit_log
-- migration this mirrors. Every statement is idempotent — CREATE TABLE IF NOT
-- EXISTS and CREATE OR REPLACE FUNCTION — so applying it to the live database,
-- where these objects already exist, alters nothing: the live definitions
-- remain authoritative there, and a rebuild from source now reproduces them.
--
-- app_logs is an operational sink, not the compliance trail. It is mutable and
-- purgeable; public.audit_log remains the append-only record.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.app_logs (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  level       text        NOT NULL DEFAULT 'info',
  source      text        NOT NULL DEFAULT 'app',
  event       text        NOT NULL,
  message     text,
  environment text        NOT NULL DEFAULT 'production',
  release     text,
  route       text,
  status_code integer,
  duration_ms integer,
  request_id  text,
  user_id     uuid,
  metadata    jsonb       NOT NULL DEFAULT '{}'::jsonb
);

-- Indexes mirror the filters app_logs_search exposes.
CREATE INDEX IF NOT EXISTS app_logs_created_idx ON public.app_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS app_logs_level_idx   ON public.app_logs (level, created_at DESC);
CREATE INDEX IF NOT EXISTS app_logs_source_idx  ON public.app_logs (source, created_at DESC);
CREATE INDEX IF NOT EXISTS app_logs_event_idx   ON public.app_logs (event, created_at DESC);
CREATE INDEX IF NOT EXISTS app_logs_env_idx     ON public.app_logs (environment, created_at DESC);

-- No policy is defined on purpose. RLS is enabled and left with no permissive
-- policy, so PostgREST returns nothing to anon or authenticated callers: every
-- read is forced through the admin-gated SECURITY DEFINER functions below.
-- Logs carry stack traces and request routes, which is not client-readable.
ALTER TABLE public.app_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.app_logs FROM anon, authenticated;
GRANT INSERT, SELECT, DELETE ON public.app_logs TO service_role;

-- Writer. SECURITY DEFINER so the Worker's service-role client and the
-- edge/CI event routes can record an event without direct table grants.
CREATE OR REPLACE FUNCTION public.log_app_event(
  _event       text,
  _level       text    DEFAULT 'info',
  _source      text    DEFAULT 'app',
  _message     text    DEFAULT NULL,
  _environment text    DEFAULT 'production',
  _release     text    DEFAULT NULL,
  _route       text    DEFAULT NULL,
  _status_code integer DEFAULT NULL,
  _duration_ms integer DEFAULT NULL,
  _request_id  text    DEFAULT NULL,
  _metadata    jsonb   DEFAULT '{}'::jsonb
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id bigint;
BEGIN
  INSERT INTO public.app_logs
    (event, level, source, message, environment, release, route,
     status_code, duration_ms, request_id, user_id, metadata)
  VALUES
    (_event,
     COALESCE(_level, 'info'),
     COALESCE(_source, 'app'),
     left(_message, 8000),
     COALESCE(_environment, 'production'),
     _release, _route, _status_code, _duration_ms, _request_id,
     auth.uid(),
     COALESCE(_metadata, '{}'::jsonb))
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_app_event(text, text, text, text, text, text, text, integer, integer, text, jsonb) FROM public, anon;

CREATE OR REPLACE FUNCTION public.app_logs_search(
  _level  text DEFAULT NULL,
  _source text DEFAULT NULL,
  _env    text DEFAULT NULL,
  _search text DEFAULT NULL,
  _from   timestamptz DEFAULT NULL,
  _to     timestamptz DEFAULT NULL,
  _limit  integer DEFAULT 200
)
RETURNS TABLE(
  id bigint, created_at timestamptz, level text, source text, event text,
  message text, environment text, release text, route text,
  status_code integer, duration_ms integer, request_id text, metadata jsonb
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT l.id, l.created_at, l.level, l.source, l.event,
         l.message, l.environment, l.release, l.route,
         l.status_code, l.duration_ms, l.request_id, l.metadata
  FROM public.app_logs l
  WHERE (_level  IS NULL OR l.level = _level)
    AND (_source IS NULL OR l.source = _source)
    AND (_env    IS NULL OR l.environment = _env)
    AND (_from   IS NULL OR l.created_at >= _from)
    AND (_to     IS NULL OR l.created_at <= _to)
    AND (
      _search IS NULL
      OR l.event   ILIKE '%' || _search || '%'
      OR l.message ILIKE '%' || _search || '%'
      OR l.route   ILIKE '%' || _search || '%'
    )
  ORDER BY l.created_at DESC
  LIMIT LEAST(COALESCE(_limit, 200), 2000);
END;
$$;

GRANT EXECUTE ON FUNCTION public.app_logs_search(text, text, text, text, timestamptz, timestamptz, integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.app_logs_stats(_hours integer DEFAULT 24)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hours integer := LEAST(GREATEST(COALESCE(_hours, 24), 1), 8760);
  v_since timestamptz := now() - make_interval(hours => v_hours);
  v_total bigint;
  v_errors bigint;
  v_out jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT count(*), count(*) FILTER (WHERE level IN ('error', 'fatal'))
    INTO v_total, v_errors
  FROM public.app_logs WHERE created_at >= v_since;

  SELECT jsonb_build_object(
    'total', v_total,
    'window_hours', v_hours,
    'error_rate', CASE WHEN v_total > 0
                       THEN round((v_errors::numeric / v_total::numeric), 4)
                       ELSE 0 END,
    'by_level',  COALESCE((SELECT jsonb_object_agg(level, n)
                           FROM (SELECT level, count(*) n FROM public.app_logs
                                 WHERE created_at >= v_since GROUP BY level) s), '{}'::jsonb),
    'by_source', COALESCE((SELECT jsonb_object_agg(source, n)
                           FROM (SELECT source, count(*) n FROM public.app_logs
                                 WHERE created_at >= v_since GROUP BY source) s), '{}'::jsonb),
    'by_event',  COALESCE((SELECT jsonb_object_agg(event, n)
                           FROM (SELECT event, count(*) n FROM public.app_logs
                                 WHERE created_at >= v_since
                                 GROUP BY event ORDER BY count(*) DESC LIMIT 20) s), '{}'::jsonb)
  ) INTO v_out;

  RETURN v_out;
END;
$$;

GRANT EXECUTE ON FUNCTION public.app_logs_stats(integer) TO authenticated;

-- Retention. Matches the 6-year compliance window used for audit_log; app_logs
-- is an operational sink, so deletion is permitted here where audit_log's
-- immutability trigger forbids it.
CREATE OR REPLACE FUNCTION public.purge_app_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  WITH gone AS (
    DELETE FROM public.app_logs WHERE created_at < now() - interval '6 years' RETURNING 1
  )
  SELECT count(*) INTO v_deleted FROM gone;
  RETURN v_deleted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.purge_app_logs() TO authenticated;

DO $$
BEGIN
  PERFORM cron.unschedule('purge-app-logs');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.schedule('purge-app-logs', '23 3 1 * *', 'SELECT public.purge_app_logs();');
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'app_logs retention cron not scheduled: %', SQLERRM;
END $$;
