-- Break-glass access to clinical records now requires a session signed in
-- with multi-factor authentication (ISO/IEC 27001 A.8.5, SOC 2 CC6.1, HIPAA
-- 164.312(d)). Routine admin work is unchanged; only the logged reading of
-- clinical records and files asks for the second factor.
CREATE OR REPLACE FUNCTION public.require_aal2()
RETURNS void
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  IF coalesce(auth.jwt() ->> 'aal', 'aal1') <> 'aal2' THEN
    RAISE EXCEPTION 'Multi-factor authentication is required for this action. Set it up at /auth/mfa-setup, then sign in again.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.require_aal2() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.require_aal2() TO authenticated, service_role;

-- Insert the check as the first statement of each break-glass function,
-- keeping the rest of its body exactly as deployed.
DO $$
DECLARE
  fn regprocedure;
  def text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'public.admin_break_glass_read(text, uuid, text)'::regprocedure,
    'public.admin_break_glass_files(uuid, text)'::regprocedure
  ] LOOP
    def := pg_get_functiondef(fn);
    IF position('require_aal2' IN def) > 0 THEN CONTINUE; END IF;
    IF def !~ E'\nBEGIN\n' THEN
      RAISE EXCEPTION 'unexpected body layout in %', fn;
    END IF;
    def := regexp_replace(def, E'\nBEGIN\n', E'\nBEGIN\n  PERFORM public.require_aal2();\n');
    EXECUTE def;
  END LOOP;
END $$;
