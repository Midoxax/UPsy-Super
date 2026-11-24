-- The LSSPM badge on psychologists' public pages (directory cards, featured
-- psychologists, profile). Given the ids of the profiles a page shows, returns
-- those that are published and belong to a confirmed, unexpired League member.
-- It reveals nothing else (no number, category or dates), and only about
-- published profiles: the badge is public by design.

CREATE OR REPLACE FUNCTION public.league_member_badges(_ids uuid[])
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id FROM public.psychologist_profiles p
  WHERE p.id = ANY (_ids[1:200]) AND p.is_published AND public.is_league_member(p.id);
$$;
REVOKE ALL ON FUNCTION public.league_member_badges(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.league_member_badges(uuid[]) TO anon, authenticated;
