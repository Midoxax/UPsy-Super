-- Admins reach every ops workspace as director, without being added as a
-- member of each one. Every ops policy goes through these two functions.
CREATE OR REPLACE FUNCTION public.ops_has_workspace_access(_user uuid, _workspace uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.has_role(_user, 'admin'::app_role)
      OR EXISTS (
        SELECT 1 FROM public.ops_workspace_members
        WHERE user_id = _user AND workspace_id = _workspace
      );
$function$;

CREATE OR REPLACE FUNCTION public.ops_workspace_role(_user uuid, _workspace uuid)
RETURNS ops_member_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE WHEN public.has_role(_user, 'admin'::app_role)
              THEN 'director'::ops_member_role
              ELSE (SELECT role FROM public.ops_workspace_members
                    WHERE user_id = _user AND workspace_id = _workspace
                    LIMIT 1)
         END;
$function$;
