-- League decision (23 November 2026): a membership approved from 1 October
-- runs to 31 December of the following year, so late joiners do not pay a
-- full year's dues for a few weeks. Earlier in the year, Art. 9 is unchanged:
-- the membership runs to 31 December of the current year. A renewal paid
-- before the end of a membership starts on 1 January and covers that year.
--
-- Also fixes renewals, which could not be confirmed: a member keeps one
-- member number across years, so the renewed membership reuses the number of
-- the first one, but member_number was UNIQUE across all rows. A number now
-- belongs to one member (checked by trigger) and may appear on each of that
-- member's yearly memberships.

ALTER TABLE public.league_memberships DROP CONSTRAINT IF EXISTS league_memberships_member_number_key;
CREATE INDEX IF NOT EXISTS league_memberships_member_number_idx
  ON public.league_memberships (member_number) WHERE member_number IS NOT NULL;

CREATE OR REPLACE FUNCTION public.league_member_number_owner() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.member_number IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.league_memberships
    WHERE member_number = NEW.member_number AND user_id <> NEW.user_id) THEN
    RAISE EXCEPTION 'member number % belongs to another member', NEW.member_number;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS league_member_number_owner ON public.league_memberships;
CREATE TRIGGER league_member_number_owner
  BEFORE INSERT OR UPDATE OF member_number, user_id ON public.league_memberships
  FOR EACH ROW EXECUTE FUNCTION public.league_member_number_owner();

CREATE OR REPLACE FUNCTION public.league_activate(_membership uuid, _by uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m public.league_memberships; _start date; _first boolean; _prev public.league_memberships;
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
  UPDATE public.league_memberships SET
    status = 'active',
    member_number = coalesce(_prev.member_number, public.league_next_number('LSSPM')),
    -- One QR per member, kept across renewals.
    verify_token = coalesce(_prev.verify_token,
                            replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')),
    photo_path = coalesce(m.photo_path, _prev.photo_path),
    category = coalesce(m.category, _prev.category),
    attestation_number = public.league_next_number('ATT'),
    starts_on = _start,
    -- From 1 October, a membership runs to the end of the following year.
    ends_on = make_date(extract(year FROM _start)::int
                        + CASE WHEN extract(month FROM _start) >= 10 THEN 1 ELSE 0 END, 12, 31),
    commission_free_until = CASE WHEN _first THEN (current_date + interval '3 months')::date END,
    confirmed_by = _by,
    confirmed_at = now()
  WHERE id = _membership;
  -- The previous record no longer carries the token (unique), the new one does.
  IF _prev.id IS NOT NULL AND _prev.id <> _membership THEN
    UPDATE public.league_memberships SET verify_token = NULL WHERE id = _prev.id;
  END IF;
END $$;
