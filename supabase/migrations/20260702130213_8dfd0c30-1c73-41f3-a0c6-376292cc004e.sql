
-- Consolidate duplicate SELECT policies on user_badges
DROP POLICY IF EXISTS "Users can view own badges" ON public.user_badges;

-- Enforce anonymity on org_pulse_responses: no direct row access for org owners.
-- Aggregates remain available via the security-definer RPC org_pulse_aggregate.
DROP POLICY IF EXISTS "Org owners can read their org pulse responses" ON public.org_pulse_responses;
