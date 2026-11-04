-- Anonymous visitors and signed-in specialists can list the active plans
-- through the public view, without seeing the commission rate.
BEGIN;
SET LOCAL ROLE anon;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.specialist_plans_public) = 0
     AND (SELECT count(*) FROM public.specialist_plans) > 0 THEN
    RAISE EXCEPTION 'anon sees no plans through specialist_plans_public';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'specialist_plans_public'
               AND column_name = 'commission_rate') THEN
    RAISE EXCEPTION 'specialist_plans_public exposes commission_rate';
  END IF;
END $$;
ROLLBACK;
