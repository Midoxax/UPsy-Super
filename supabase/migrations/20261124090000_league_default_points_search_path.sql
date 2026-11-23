-- Pin the search path of league_default_points (Supabase linter 0011,
-- function_search_path_mutable). The function reads no tables, so an empty
-- search path changes nothing in its behaviour.
ALTER FUNCTION public.league_default_points(text) SET search_path = '';
