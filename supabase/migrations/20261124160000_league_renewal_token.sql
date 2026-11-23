-- Renewals still failed after 20261124140000: the renewed membership took
-- the member's QR token (verify_token, unique) before the previous membership
-- released it. The token is now released first and taken from the latest
-- earlier membership (the one ending last, not the first), so a member keeps
-- the same QR code through any number of renewals. Photo and card category
-- also follow the latest membership.

CREATE OR REPLACE FUNCTION public.league_activate(_membership uuid, _by uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m public.league_memberships; _start date; _first boolean; _prev public.league_memberships;
  _last public.league_memberships;
BEGIN
  SELECT * INTO m FROM public.league_memberships WHERE id = _membership FOR UPDATE;
  IF m.status <> 'pending' THEN RETURN; END IF;
  SELECT greatest(current_date, max(ends_on) + 1) INTO _start
  FROM public.league_memberships WHERE user_id = m.user_id AND status = 'active';
  _start := coalesce(_start, current_date);
  _first := NOT EXISTS (SELECT 1 FROM public.league_memberships
                        WHERE user_id = m.user_id AND status = 'active');
  SELECT * INTO _prev FROM public.league_memberships
  WHERE user_id = m.user_id AND member_number IS NOT NULL ORDER BY created_at LIMIT 1;
  -- The latest earlier membership carries the QR token, photo and category.
  SELECT * INTO _last FROM public.league_memberships
  WHERE user_id = m.user_id AND id <> _membership AND member_number IS NOT NULL
  ORDER BY ends_on DESC NULLS LAST, created_at DESC LIMIT 1;
  -- verify_token is unique: release it before the new membership takes it.
  UPDATE public.league_memberships SET verify_token = NULL
  WHERE user_id = m.user_id AND id <> _membership AND verify_token IS NOT NULL;
  UPDATE public.league_memberships SET
    status = 'active',
    member_number = coalesce(_prev.member_number, public.league_next_number('LSSPM')),
    -- One QR per member, kept across renewals.
    verify_token = coalesce(_last.verify_token,
                            replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')),
    photo_path = coalesce(m.photo_path, _last.photo_path),
    category = coalesce(m.category, _last.category),
    attestation_number = public.league_next_number('ATT'),
    starts_on = _start,
    -- From 1 October, a membership runs to the end of the following year.
    ends_on = make_date(extract(year FROM _start)::int
                        + CASE WHEN extract(month FROM _start) >= 10 THEN 1 ELSE 0 END, 12, 31),
    commission_free_until = CASE WHEN _first THEN (current_date + interval '3 months')::date END,
    confirmed_by = _by,
    confirmed_at = now()
  WHERE id = _membership;
END $$;
