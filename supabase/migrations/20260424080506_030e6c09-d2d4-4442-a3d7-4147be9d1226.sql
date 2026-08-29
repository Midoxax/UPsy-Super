-- 1. Restrict platform_pricing_config to authenticated users (hides commission/vat from public)
DROP POLICY IF EXISTS "Anyone can view active pricing config" ON public.platform_pricing_config;

CREATE POLICY "Authenticated users can view active pricing config"
ON public.platform_pricing_config
FOR SELECT
TO authenticated
USING (is_active = true);

-- 2. Add ownership check to invite_org_member
CREATE OR REPLACE FUNCTION public.invite_org_member(p_org_id uuid, p_email text, p_name text DEFAULT NULL::text, p_role text DEFAULT 'member'::text, p_sessions_limit integer DEFAULT 4)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_member_id uuid;
BEGIN
  -- Authorization: caller must be the org owner or a platform admin
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.organization_accounts
    WHERE id = p_org_id AND owner_id = auth.uid()
  ) AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: only the organization owner or an admin may invite members';
  END IF;

  INSERT INTO public.organization_members (org_id, email, full_name, role, sessions_limit)
  VALUES (p_org_id, lower(trim(p_email)), p_name, p_role, p_sessions_limit)
  ON CONFLICT (org_id, email) DO UPDATE SET
    full_name = COALESCE(p_name, organization_members.full_name),
    role = p_role,
    status = CASE WHEN organization_members.status = 'suspended' THEN 'invited' ELSE organization_members.status END
  RETURNING id INTO v_member_id;

  UPDATE public.organization_accounts
  SET seats_used = (SELECT COUNT(*) FROM public.organization_members WHERE org_id = p_org_id AND status != 'suspended')
  WHERE id = p_org_id;

  RETURN v_member_id;
END;
$function$;