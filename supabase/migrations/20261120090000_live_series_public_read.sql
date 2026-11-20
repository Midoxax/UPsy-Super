-- Logged-out visitors could not list published series: the items policy
-- called manages_live_series(), which anon may not execute, so the whole
-- query failed with "permission denied for function" (HTTP 401). Split it:
-- published items are readable by anyone with a plain check, and hosts and
-- admins read their unpublished items through a policy for signed-in users.

DROP POLICY IF EXISTS live_series_items_read ON public.live_series_items;
CREATE POLICY live_series_items_read ON public.live_series_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.live_series s
                 WHERE s.id = series_id AND s.is_published));
DROP POLICY IF EXISTS live_series_items_read_own ON public.live_series_items;
CREATE POLICY live_series_items_read_own ON public.live_series_items FOR SELECT TO authenticated
  USING (public.manages_live_series(series_id, auth.uid()));
