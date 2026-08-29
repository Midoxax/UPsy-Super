
-- Extend courses table
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS learning_path text NOT NULL DEFAULT 'mental-health',
  ADD COLUMN IF NOT EXISTS slug text;

-- Backfill slugs from title where missing
UPDATE public.courses
SET slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) || '-' || substring(id::text from 1 for 6)
WHERE slug IS NULL;

ALTER TABLE public.courses ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_unique ON public.courses(slug);
CREATE INDEX IF NOT EXISTS courses_learning_path_idx ON public.courses(learning_path);

-- Allow path constraint
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_learning_path_check;
ALTER TABLE public.courses ADD CONSTRAINT courses_learning_path_check
  CHECK (learning_path IN ('mental-health', 'performance', 'clinical-cpd'));

-- Reviews moderation column (if reviews table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'psychologist_reviews') THEN
    EXECUTE 'ALTER TABLE public.psychologist_reviews ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false';
    EXECUTE 'ALTER TABLE public.psychologist_reviews ADD COLUMN IF NOT EXISTS hidden_reason text';
  END IF;
END $$;

------------------------------------------------------------------
-- Admin: force sign-out (revoke all refresh tokens for a user)
------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_force_signout(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  DELETE FROM auth.refresh_tokens WHERE user_id::uuid = _user_id;
  DELETE FROM auth.sessions WHERE user_id = _user_id;

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (auth.uid(), 'user.force_signout', 'auth.users', _user_id, '{}'::jsonb);

  RETURN jsonb_build_object('ok', true, 'user_id', _user_id);
END;
$$;

------------------------------------------------------------------
-- Admin: log password reset request (actual email send done client-side)
------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_log_password_reset(_user_id uuid, _email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (auth.uid(), 'user.password_reset_sent', 'auth.users', _user_id,
          jsonb_build_object('email', _email));

  RETURN jsonb_build_object('ok', true);
END;
$$;

------------------------------------------------------------------
-- Admin: delete profile + auth user
------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_delete_profile(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF _user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (auth.uid(), 'user.deleted', 'auth.users', _user_id, '{}'::jsonb);

  DELETE FROM public.user_roles WHERE user_id = _user_id;
  DELETE FROM public.profiles WHERE id = _user_id;
  DELETE FROM auth.users WHERE id = _user_id;

  RETURN jsonb_build_object('ok', true, 'user_id', _user_id);
END;
$$;

------------------------------------------------------------------
-- Admin: update booking status (inline row actions)
------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_update_booking_status(_booking_id uuid, _new_status text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF _new_status NOT IN ('pending','confirmed','completed','no_show','cancelled') THEN
    RAISE EXCEPTION 'Invalid status: %', _new_status;
  END IF;

  UPDATE public.bookings
  SET status = _new_status, updated_at = now()
  WHERE id = _booking_id;

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (auth.uid(), 'booking.status_changed', 'bookings', _booking_id,
          jsonb_build_object('new_status', _new_status));

  RETURN jsonb_build_object('ok', true, 'booking_id', _booking_id, 'status', _new_status);
END;
$$;

------------------------------------------------------------------
-- Admin: hide review
------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_hide_review(_review_id uuid, _reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'psychologist_reviews') THEN
    EXECUTE format('UPDATE public.psychologist_reviews SET is_hidden = true, hidden_reason = %L WHERE id = %L', _reason, _review_id);
  END IF;

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (auth.uid(), 'review.hidden', 'psychologist_reviews', _review_id,
          jsonb_build_object('reason', _reason));

  RETURN jsonb_build_object('ok', true);
END;
$$;

------------------------------------------------------------------
-- Admin: rich user list with email + roles + status
------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_list_users_rich(_search text DEFAULT NULL, _limit integer DEFAULT 200)
RETURNS TABLE(
  id uuid,
  full_name text,
  email text,
  avatar_url text,
  city text,
  phone text,
  created_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  email_confirmed_at timestamp with time zone,
  is_suspended boolean,
  suspended_reason text,
  roles text[]
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    u.email::text,
    p.avatar_url,
    p.city,
    p.phone,
    p.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at,
    COALESCE(p.is_suspended, false),
    p.suspended_reason,
    COALESCE(ARRAY_AGG(DISTINCT ur.role::text) FILTER (WHERE ur.role IS NOT NULL), ARRAY[]::text[])
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE _search IS NULL
     OR p.full_name ILIKE '%' || _search || '%'
     OR u.email ILIKE '%' || _search || '%'
  GROUP BY p.id, u.email, u.last_sign_in_at, u.email_confirmed_at
  ORDER BY p.created_at DESC NULLS LAST
  LIMIT _limit;
END;
$$;

------------------------------------------------------------------
-- Admin: activity tail for a single user
------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_user_activity(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_recent_bookings jsonb;
  v_recent_assessments jsonb;
  v_audit_tail jsonb;
  v_journals_30d int;
  v_moods_30d int;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COALESCE(jsonb_agg(b ORDER BY b.scheduled_at DESC), '[]'::jsonb)
    INTO v_recent_bookings
  FROM (
    SELECT id, scheduled_at, status, payment_status, amount_mad
    FROM public.bookings
    WHERE patient_id = _user_id OR psychologist_id = _user_id
    ORDER BY scheduled_at DESC LIMIT 10
  ) b;

  SELECT COALESCE(jsonb_agg(a ORDER BY a.completed_at DESC), '[]'::jsonb)
    INTO v_recent_assessments
  FROM (
    SELECT id, assessment_id, total_score, completed_at
    FROM public.assessment_results
    WHERE user_id = _user_id
    ORDER BY completed_at DESC NULLS LAST LIMIT 5
  ) a;

  SELECT COALESCE(jsonb_agg(al ORDER BY al.created_at DESC), '[]'::jsonb)
    INTO v_audit_tail
  FROM (
    SELECT id, action, resource_type, resource_id, created_at, metadata
    FROM public.audit_log
    WHERE user_id = _user_id OR resource_id = _user_id
    ORDER BY created_at DESC LIMIT 10
  ) al;

  SELECT COUNT(*) INTO v_journals_30d
  FROM public.journal_entries
  WHERE user_id = _user_id AND created_at >= now() - interval '30 days';

  SELECT COUNT(*) INTO v_moods_30d
  FROM public.mood_entries
  WHERE user_id = _user_id AND created_at >= now() - interval '30 days';

  RETURN jsonb_build_object(
    'recent_bookings', v_recent_bookings,
    'recent_assessments', v_recent_assessments,
    'audit_tail', v_audit_tail,
    'journals_30d', v_journals_30d,
    'moods_30d', v_moods_30d
  );
END;
$$;
