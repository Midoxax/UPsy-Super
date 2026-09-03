-- Anonymous visitors could not read published public content.
--
-- SYMPTOM
-- A logged-out visitor loading /resources saw an empty page, and a psychologist
-- profile showed no reviews, even though 32 published resources exist. Nothing
-- was logged: `Resources.tsx` destructures only `data` and `isLoading` from its
-- query and never reads `isError`, and `ReviewsList` drops `error` outright, so
-- PostgREST's failure surfaced as "no content" rather than an error state.
--
-- ROOT CAUSE
-- RLS policies on 108 tables call public.has_role(), and four sibling helpers
-- cover another 28. All five are STABLE SECURITY DEFINER, and their ACLs granted
-- EXECUTE to `authenticated` and `service_role` but not to `anon`:
--
--   has_role acl = {postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres,...}
--
-- Postgres evaluates a policy expression as the *calling* role. When no earlier
-- permissive policy already returned true, evaluation reaches the has_role()
-- branch, anon lacks EXECUTE, and the whole statement aborts with
-- `42501 permission denied for function has_role` — instead of the policy simply
-- evaluating to false and returning zero rows.
--
-- That is why the failure looked arbitrary from the outside: tables whose
-- permissive "public read" policy is evaluated first (psychologist_profiles,
-- legal_documents, translation_overrides) worked, while tables that had to reach
-- the has_role branch (resources, reviews, profiles) raised 42501.
--
-- No migration performed this revoke; the live ACL had drifted from this
-- migration history, so replaying migrations onto a fresh project would NOT have
-- reproduced it. This file makes the intended grant explicit and reproducible.
--
-- WHY THIS IS THE RIGHT FIX
-- The alternative is rewriting the has_role branch of ~130 policies to
-- short-circuit on `auth.uid() IS NOT NULL`. That touches every table in the
-- schema for no security gain, since the corrected behaviour is identical:
-- for an anonymous caller auth.uid() is NULL, so has_role(NULL, …) returns false
-- and the policy denies. Granting EXECUTE changes an error into that intended
-- denial. It grants no data access of its own — every one of these helpers only
-- ever returns a boolean, and the tables they read stay behind their own RLS.
--
-- Accepted trade-off: `anon` can now call these helpers directly over PostgREST
-- RPC and learn whether a *known* user UUID holds a given role. That is a boolean
-- oracle over an identifier the caller must already possess, and it is the same
-- exposure `authenticated` has had since these helpers were written.

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)             TO anon;
GRANT EXECUTE ON FUNCTION public.has_tier(uuid, public.membership_tier)      TO anon;
GRANT EXECUTE ON FUNCTION public.has_crm_access(uuid, text)                  TO anon;
GRANT EXECUTE ON FUNCTION public.ops_has_workspace_access(uuid, uuid)        TO anon;
GRANT EXECUTE ON FUNCTION public.ops_workspace_role(uuid, uuid)              TO anon;
