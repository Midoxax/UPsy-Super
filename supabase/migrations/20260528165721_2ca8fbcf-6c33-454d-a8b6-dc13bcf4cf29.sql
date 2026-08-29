
-- 1) Fix function search_path
CREATE OR REPLACE FUNCTION public.ops_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$function$;

-- 2) Tighten user_badges: only owner or admin can read
DROP POLICY IF EXISTS "users see own badges + public view by id" ON public.user_badges;
CREATE POLICY "users see own badges"
ON public.user_badges
FOR SELECT
TO authenticated
USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- 3) Remove permissive self-insert into ops_workspace_members (privilege escalation)
DROP POLICY IF EXISTS "self insert membership" ON public.ops_workspace_members;
-- Director management policy already exists ("directors manage members"). Joining a workspace
-- must now go through a director-approved / invite flow handled by backend code or admin.

-- 4) Cap and whitelist xp_events to prevent self-awarding arbitrary XP
ALTER TABLE public.xp_events
  ADD CONSTRAINT xp_events_xp_range CHECK (xp >= 0 AND xp <= 100);

-- 5) Realtime: add ops_* topic clauses gated by workspace access
DROP POLICY IF EXISTS "User-scoped realtime read" ON realtime.messages;
CREATE POLICY "User-scoped realtime read"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (
    (realtime.topic() ~~ 'notifications:%')
    AND (realtime.topic() = ('notifications:' || (auth.uid())::text))
  )
  OR (
    (realtime.topic() ~~ 'support_tickets:%')
    AND (realtime.topic() = ('support_tickets:' || (auth.uid())::text))
  )
  OR (
    (realtime.topic() ~~ 'support_ticket_messages:%')
    AND EXISTS (
      SELECT 1 FROM public.support_tickets st
      WHERE st.id::text = split_part(realtime.topic(), ':', 2)
        AND st.user_id = auth.uid()
    )
  )
  OR (
    (realtime.topic() ~~ 'ops_events:%')
    AND public.ops_has_workspace_access(auth.uid(), split_part(realtime.topic(), ':', 2)::uuid)
  )
  OR (
    (realtime.topic() ~~ 'ops_tasks:%')
    AND public.ops_has_workspace_access(auth.uid(), split_part(realtime.topic(), ':', 2)::uuid)
  )
  OR (
    (realtime.topic() ~~ 'ops_task_events:%')
    AND public.ops_has_workspace_access(auth.uid(), split_part(realtime.topic(), ':', 2)::uuid)
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);
