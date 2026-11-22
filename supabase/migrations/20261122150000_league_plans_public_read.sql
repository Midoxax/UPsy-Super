-- Logged-out visitors reading membership categories hit "permission denied
-- for function is_league_reviewer" (anon may not execute it). Open
-- categories get a plain policy; the League reads drafts through its own.
DROP POLICY IF EXISTS league_plans_read ON public.league_membership_plans;
CREATE POLICY league_plans_read ON public.league_membership_plans FOR SELECT USING (is_active);
DROP POLICY IF EXISTS league_plans_read_league ON public.league_membership_plans;
CREATE POLICY league_plans_read_league ON public.league_membership_plans FOR SELECT TO authenticated
  USING (public.is_league_reviewer(auth.uid()));
