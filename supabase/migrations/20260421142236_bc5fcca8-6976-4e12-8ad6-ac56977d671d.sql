-- 1. Suspended flag on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_reason text;

-- 2. Index for fast latest-attempt lookups
CREATE INDEX IF NOT EXISTS idx_provisioning_attempts_app_created
  ON public.provisioning_attempts (application_id, created_at DESC);

-- 3. Admin-only: assign role
CREATE OR REPLACE FUNCTION public.admin_assign_role(_user_id uuid, _role app_role)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (auth.uid(), 'role.assigned', 'user_roles', _user_id,
          jsonb_build_object('role', _role));

  RETURN jsonb_build_object('ok', true, 'user_id', _user_id, 'role', _role);
END;
$$;

-- 4. Admin-only: revoke role
CREATE OR REPLACE FUNCTION public.admin_revoke_role(_user_id uuid, _role app_role)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role;

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (auth.uid(), 'role.revoked', 'user_roles', _user_id,
          jsonb_build_object('role', _role));

  RETURN jsonb_build_object('ok', true, 'user_id', _user_id, 'role', _role);
END;
$$;

-- 5. Admin-only: suspend / reactivate user
CREATE OR REPLACE FUNCTION public.admin_set_user_suspended(_user_id uuid, _suspended boolean, _reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE public.profiles
  SET is_suspended = _suspended,
      suspended_at = CASE WHEN _suspended THEN now() ELSE NULL END,
      suspended_reason = CASE WHEN _suspended THEN _reason ELSE NULL END,
      updated_at = now()
  WHERE id = _user_id;

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (auth.uid(),
          CASE WHEN _suspended THEN 'user.suspended' ELSE 'user.reactivated' END,
          'profiles', _user_id,
          jsonb_build_object('reason', _reason));

  RETURN jsonb_build_object('ok', true, 'user_id', _user_id, 'suspended', _suspended);
END;
$$;

-- 6. Admin-only: cancel booking
CREATE OR REPLACE FUNCTION public.admin_cancel_booking(_booking_id uuid, _reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE public.bookings
  SET status = 'cancelled', updated_at = now()
  WHERE id = _booking_id;

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (auth.uid(), 'booking.cancelled', 'bookings', _booking_id,
          jsonb_build_object('reason', _reason));

  RETURN jsonb_build_object('ok', true, 'booking_id', _booking_id);
END;
$$;

-- 7. Admin-only: refund booking (mark transaction refunded + booking)
CREATE OR REPLACE FUNCTION public.admin_refund_booking(_booking_id uuid, _reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE public.bookings
  SET payment_status = 'refunded', updated_at = now()
  WHERE id = _booking_id;

  UPDATE public.payment_transactions
  SET status = 'refunded', refunded_at = now(), updated_at = now()
  WHERE booking_id = _booking_id;

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (auth.uid(), 'booking.refunded', 'bookings', _booking_id,
          jsonb_build_object('reason', _reason));

  RETURN jsonb_build_object('ok', true, 'booking_id', _booking_id);
END;
$$;

-- 8. Admin-only: list users with roles (for admin user table)
CREATE OR REPLACE FUNCTION public.admin_list_users(_search text DEFAULT NULL, _limit int DEFAULT 100)
RETURNS TABLE(
  id uuid, full_name text, avatar_url text, city text, phone text,
  created_at timestamptz, is_suspended boolean, roles text[]
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    p.id, p.full_name, p.avatar_url, p.city, p.phone,
    p.created_at, COALESCE(p.is_suspended, false),
    COALESCE(ARRAY_AGG(ur.role::text) FILTER (WHERE ur.role IS NOT NULL), ARRAY[]::text[])
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE _search IS NULL
     OR p.full_name ILIKE '%' || _search || '%'
     OR p.id::text = _search
  GROUP BY p.id
  ORDER BY p.created_at DESC NULLS LAST
  LIMIT _limit;
END;
$$;