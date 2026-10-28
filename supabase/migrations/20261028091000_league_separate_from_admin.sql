-- The League (LSSPM) works in its own accounts. U.Psy admins no longer count
-- as League reviewers (they did through is_league_reviewer), and one account
-- cannot hold both roles, so League access never rides on the founder's
-- admin account and League reviewers never reach U.Psy administration.

CREATE OR REPLACE FUNCTION public.is_league_reviewer(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_uid, 'league'::app_role)
     AND NOT public.has_role(_uid, 'admin'::app_role)
$$;

CREATE OR REPLACE FUNCTION public.league_admin_exclusive() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.role IN ('league'::app_role, 'admin'::app_role) AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = NEW.user_id
      AND role = CASE WHEN NEW.role = 'league'::app_role THEN 'admin'::app_role ELSE 'league'::app_role END
  ) THEN
    RAISE EXCEPTION 'an account cannot be both a U.Psy admin and a League reviewer';
  END IF;
  RETURN NEW;
END $$;
CREATE OR REPLACE TRIGGER trg_league_admin_exclusive BEFORE INSERT OR UPDATE OF role
  ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.league_admin_exclusive();
