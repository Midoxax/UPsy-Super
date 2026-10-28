-- Media agent ↔ CRM. Content links carry utm_* tags (social posts and the
-- newsletter use the article slug as utm_campaign); the site stores the
-- first touch and sends it with every form, signup and subscription.
-- Here: signups copy it onto their CRM contact, and admins get a report of
-- which content and channels produced contacts and clients.

-- 1. Signups: first_touch travels in the auth metadata.
CREATE OR REPLACE FUNCTION public.crm_link_profile_to_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_touch jsonb;
  v_id uuid;
BEGIN
  SELECT lower(u.email), coalesce(u.raw_user_meta_data -> 'first_touch', '{}'::jsonb)
    INTO v_email, v_touch
  FROM auth.users u WHERE u.id = NEW.id;
  IF v_email IS NULL THEN RETURN NEW; END IF;
  IF jsonb_typeof(v_touch) <> 'object' THEN v_touch := '{}'::jsonb; END IF;

  INSERT INTO public.crm_contacts (email, full_name, phone, contact_type, source, user_id, lifecycle, first_touch)
  VALUES (v_email, NEW.full_name, NEW.phone, 'client', 'registration', NEW.id, 'active', v_touch)
  ON CONFLICT (lower(email)) DO UPDATE
    SET user_id   = coalesce(public.crm_contacts.user_id, excluded.user_id),
        full_name = coalesce(public.crm_contacts.full_name, excluded.full_name),
        phone     = coalesce(public.crm_contacts.phone, excluded.phone),
        -- A lead keeps the first touch it arrived with.
        first_touch = CASE WHEN public.crm_contacts.first_touch = '{}'::jsonb
                           THEN excluded.first_touch ELSE public.crm_contacts.first_touch END,
        lifecycle = 'active',
        updated_at = now()
  RETURNING id INTO v_id;

  INSERT INTO public.crm_activities (contact_id, kind, subject)
  VALUES (v_id, 'account_created', 'Registered on the platform');

  RETURN NEW;
END;
$$;

-- 2. Content → contacts → clients, by first-touch campaign and source.
CREATE OR REPLACE FUNCTION public.crm_content_attribution(p_days int DEFAULT 90)
RETURNS TABLE (
  campaign text, source text, medium text,
  contacts bigint, accounts bigint, clients bigint, last_contact_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'admins only';
  END IF;
  RETURN QUERY
  SELECT coalesce(c.first_touch ->> 'utm_campaign', '(none)'),
         coalesce(c.first_touch ->> 'utm_source',
                  CASE WHEN c.first_touch ? 'referrer' THEN 'referral' END, '(direct)'),
         coalesce(c.first_touch ->> 'utm_medium', '(none)'),
         count(*),
         count(c.user_id),
         count(*) FILTER (WHERE EXISTS (
           SELECT 1 FROM public.bookings b WHERE b.patient_id = c.user_id)),
         max(c.created_at)
  FROM public.crm_contacts c
  WHERE c.created_at > now() - make_interval(days => greatest(p_days, 1))
  GROUP BY 1, 2, 3
  ORDER BY 4 DESC, 7 DESC;
END $$;
REVOKE ALL ON FUNCTION public.crm_content_attribution(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_content_attribution(int) TO authenticated, service_role;
