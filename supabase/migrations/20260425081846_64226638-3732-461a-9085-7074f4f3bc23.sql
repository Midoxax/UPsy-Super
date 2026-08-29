-- 1. Extend bookings payment_status to allow 'comp' (complimentary sessions)
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_payment_status_check
  CHECK (payment_status IN ('unpaid','paid','refunded','comp'));

-- 2. Lightweight DB-backed rate limiter for high-risk edge functions
CREATE TABLE IF NOT EXISTS public.edge_rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  count integer NOT NULL DEFAULT 0
);

ALTER TABLE public.edge_rate_limits ENABLE ROW LEVEL SECURITY;

-- No public policies — only SECURITY DEFINER RPC may touch this table.

CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  _key text,
  _max integer,
  _window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.edge_rate_limits%ROWTYPE;
BEGIN
  IF _key IS NULL OR length(_key) = 0 THEN
    RETURN true;
  END IF;

  SELECT * INTO v_row FROM public.edge_rate_limits WHERE key = _key FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.edge_rate_limits(key, window_start, count)
    VALUES (_key, now(), 1);
    RETURN true;
  END IF;

  IF v_row.window_start + (_window_seconds || ' seconds')::interval < now() THEN
    UPDATE public.edge_rate_limits
       SET window_start = now(), count = 1
     WHERE key = _key;
    RETURN true;
  END IF;

  IF v_row.count >= _max THEN
    RETURN false;
  END IF;

  UPDATE public.edge_rate_limits
     SET count = count + 1
   WHERE key = _key;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_increment_rate_limit(text, integer, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(text, integer, integer) TO authenticated, anon, service_role;