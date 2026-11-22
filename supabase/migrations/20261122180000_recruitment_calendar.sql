-- Recruitment calendar: the League and a candidate agree on an interview slot.
--
-- A League recruiter invites a candidate whose file is shared with the League
-- (Law 09-08: no consent, no invitation), proposing slots and saying how the
-- interview happens (video link, in person, phone). The candidate confirms
-- one of them or proposes their own; each side confirms only slots the other
-- proposed, so both have agreed to the time that is scheduled. Either side
-- can reopen (reschedule) or cancel with a reason. A recruiter cannot be
-- booked twice at the same time. Each step notifies the other side in-app.

CREATE TABLE IF NOT EXISTS public.recruitment_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES public.psychologist_applications(id) ON DELETE SET NULL,
  title text NOT NULL CHECK (length(title) BETWEEN 2 AND 160),
  message text CHECK (message IS NULL OR length(message) <= 2000),
  mode text NOT NULL DEFAULT 'video' CHECK (mode IN ('video', 'in_person', 'phone')),
  location text CHECK (location IS NULL OR length(location) <= 300),
  meeting_url text CHECK (meeting_url IS NULL OR meeting_url ~ '^https://'),
  duration_minutes integer NOT NULL DEFAULT 30 CHECK (duration_minutes BETWEEN 10 AND 240),
  status text NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed', 'scheduled', 'declined', 'cancelled', 'done')),
  scheduled_at timestamptz,
  cancelled_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  cancel_reason text CHECK (cancel_reason IS NULL OR length(cancel_reason) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'scheduled') = (scheduled_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS recruitment_invitations_candidate_idx ON public.recruitment_invitations (candidate_id);
CREATE INDEX IF NOT EXISTS recruitment_invitations_recruiter_idx
  ON public.recruitment_invitations (recruiter_id, scheduled_at) WHERE status = 'scheduled';

CREATE TABLE IF NOT EXISTS public.recruitment_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL REFERENCES public.recruitment_invitations(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  proposed_by text NOT NULL CHECK (proposed_by IN ('recruiter', 'candidate')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (invitation_id, starts_at)
);

ALTER TABLE public.recruitment_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_slots ENABLE ROW LEVEL SECURITY;

-- Both parties read their invitations; the League's team reads all of its
-- own. All writes go through the functions below.
DROP POLICY IF EXISTS recruitment_invitations_read ON public.recruitment_invitations;
CREATE POLICY recruitment_invitations_read ON public.recruitment_invitations FOR SELECT TO authenticated
  USING (candidate_id = auth.uid() OR recruiter_id = auth.uid() OR public.is_league_reviewer(auth.uid()));
DROP POLICY IF EXISTS recruitment_slots_read ON public.recruitment_slots;
CREATE POLICY recruitment_slots_read ON public.recruitment_slots FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.recruitment_invitations i WHERE i.id = invitation_id
                 AND (i.candidate_id = auth.uid() OR i.recruiter_id = auth.uid()
                      OR public.is_league_reviewer(auth.uid()))));
GRANT SELECT ON public.recruitment_invitations TO authenticated;
GRANT SELECT ON public.recruitment_slots TO authenticated;

-- The caller's side in an invitation, or null if they have none.
CREATE OR REPLACE FUNCTION public.recruitment_side(_inv public.recruitment_invitations, _uid uuid)
RETURNS text LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT CASE WHEN _inv.candidate_id = _uid THEN 'candidate'
              WHEN _inv.recruiter_id = _uid OR public.is_league_reviewer(_uid) THEN 'recruiter' END;
$$;

CREATE OR REPLACE FUNCTION public.recruitment_notify(_user uuid, _title text, _body text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications (user_id, type, title, body, action_url)
  VALUES (_user, 'recruitment', _title, _body, '/dashboard');
$$;

-- Adds future slots for one side; at most 6 open proposals per side.
CREATE OR REPLACE FUNCTION public.recruitment_add_slots(_inv uuid, _side text, _slots timestamptz[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _t timestamptz;
BEGIN
  IF _slots IS NULL OR cardinality(_slots) = 0 THEN RAISE EXCEPTION 'no slot'; END IF;
  FOREACH _t IN ARRAY _slots LOOP
    IF _t <= now() + interval '1 hour' THEN RAISE EXCEPTION 'slot in the past'; END IF;
    INSERT INTO public.recruitment_slots (invitation_id, starts_at, proposed_by)
    VALUES (_inv, _t, _side) ON CONFLICT (invitation_id, starts_at) DO NOTHING;
  END LOOP;
  IF (SELECT count(*) FROM public.recruitment_slots
      WHERE invitation_id = _inv AND proposed_by = _side AND starts_at > now()) > 6 THEN
    RAISE EXCEPTION 'too many slots';
  END IF;
END $$;

-- The League invites the candidate behind a shared file.
CREATE OR REPLACE FUNCTION public.recruitment_invite(
  _application uuid, _title text, _message text, _mode text, _location text,
  _meeting_url text, _duration integer, _slots timestamptz[])
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _candidate uuid; _id uuid;
BEGIN
  IF NOT public.is_league_reviewer(_uid) THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT user_id INTO _candidate FROM public.psychologist_applications
  WHERE id = _application AND league_share_consent;
  IF _candidate IS NULL THEN RAISE EXCEPTION 'file not shared with the League'; END IF;
  INSERT INTO public.recruitment_invitations (recruiter_id, candidate_id, application_id, title,
    message, mode, location, meeting_url, duration_minutes)
  VALUES (_uid, _candidate, _application, _title, nullif(trim(_message), ''), _mode,
          nullif(trim(_location), ''), nullif(trim(_meeting_url), ''), coalesce(_duration, 30))
  RETURNING id INTO _id;
  PERFORM public.recruitment_add_slots(_id, 'recruiter', _slots);
  PERFORM public.recruitment_notify(_candidate, 'Invitation à un entretien',
    _title || ' : choisissez un créneau ou proposez les vôtres.');
  RETURN _id;
END $$;

-- Either side proposes more slots while the invitation is open.
CREATE OR REPLACE FUNCTION public.recruitment_propose(_invitation uuid, _slots timestamptz[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i public.recruitment_invitations; _side text;
BEGIN
  SELECT * INTO i FROM public.recruitment_invitations WHERE id = _invitation FOR UPDATE;
  _side := public.recruitment_side(i, auth.uid());
  IF _side IS NULL THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF i.status <> 'proposed' THEN RAISE EXCEPTION 'not open'; END IF;
  PERFORM public.recruitment_add_slots(_invitation, _side, _slots);
  PERFORM public.recruitment_notify(
    CASE _side WHEN 'candidate' THEN i.recruiter_id ELSE i.candidate_id END,
    'Nouveaux créneaux proposés', i.title);
END $$;

-- Confirms a slot the other side proposed.
CREATE OR REPLACE FUNCTION public.recruitment_confirm(_slot uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.recruitment_slots; i public.recruitment_invitations; _side text;
BEGIN
  SELECT * INTO s FROM public.recruitment_slots WHERE id = _slot;
  IF NOT FOUND THEN RAISE EXCEPTION 'not found'; END IF;
  SELECT * INTO i FROM public.recruitment_invitations WHERE id = s.invitation_id FOR UPDATE;
  _side := public.recruitment_side(i, auth.uid());
  IF _side IS NULL THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF i.status <> 'proposed' THEN RAISE EXCEPTION 'not open'; END IF;
  IF s.proposed_by = _side THEN RAISE EXCEPTION 'the other side must confirm'; END IF;
  IF s.starts_at <= now() THEN RAISE EXCEPTION 'slot in the past'; END IF;
  -- The recruiter cannot hold two interviews at the same time.
  IF EXISTS (SELECT 1 FROM public.recruitment_invitations o
             WHERE o.recruiter_id = i.recruiter_id AND o.status = 'scheduled' AND o.id <> i.id
               AND tstzrange(o.scheduled_at, o.scheduled_at + make_interval(mins => o.duration_minutes))
                && tstzrange(s.starts_at, s.starts_at + make_interval(mins => i.duration_minutes))) THEN
    RAISE EXCEPTION 'conflict';
  END IF;
  UPDATE public.recruitment_invitations SET status = 'scheduled', scheduled_at = s.starts_at,
    updated_at = now() WHERE id = i.id;
  PERFORM public.recruitment_notify(
    CASE _side WHEN 'candidate' THEN i.recruiter_id ELSE i.candidate_id END,
    'Entretien confirmé', i.title);
END $$;

-- Reopens a scheduled interview so a new slot can be agreed.
CREATE OR REPLACE FUNCTION public.recruitment_reschedule(_invitation uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i public.recruitment_invitations; _side text;
BEGIN
  SELECT * INTO i FROM public.recruitment_invitations WHERE id = _invitation FOR UPDATE;
  _side := public.recruitment_side(i, auth.uid());
  IF _side IS NULL THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF i.status <> 'scheduled' THEN RAISE EXCEPTION 'not scheduled'; END IF;
  UPDATE public.recruitment_invitations SET status = 'proposed', scheduled_at = NULL,
    updated_at = now() WHERE id = i.id;
  PERFORM public.recruitment_notify(
    CASE _side WHEN 'candidate' THEN i.recruiter_id ELSE i.candidate_id END,
    'Entretien à replanifier', i.title);
END $$;

-- Ends an invitation: the candidate declines, or either side cancels.
CREATE OR REPLACE FUNCTION public.recruitment_cancel(_invitation uuid, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i public.recruitment_invitations; _side text;
BEGIN
  SELECT * INTO i FROM public.recruitment_invitations WHERE id = _invitation FOR UPDATE;
  _side := public.recruitment_side(i, auth.uid());
  IF _side IS NULL THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF i.status NOT IN ('proposed', 'scheduled') THEN RAISE EXCEPTION 'not open'; END IF;
  UPDATE public.recruitment_invitations SET
    status = CASE WHEN _side = 'candidate' AND i.status = 'proposed' THEN 'declined' ELSE 'cancelled' END,
    scheduled_at = NULL, cancelled_by = auth.uid(), cancel_reason = nullif(trim(_reason), ''),
    updated_at = now()
  WHERE id = i.id;
  PERFORM public.recruitment_notify(
    CASE _side WHEN 'candidate' THEN i.recruiter_id ELSE i.candidate_id END,
    'Entretien annulé', i.title);
END $$;

REVOKE ALL ON FUNCTION public.recruitment_side(public.recruitment_invitations, uuid),
  public.recruitment_notify(uuid, text, text),
  public.recruitment_add_slots(uuid, text, timestamptz[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION
  public.recruitment_invite(uuid, text, text, text, text, text, integer, timestamptz[]),
  public.recruitment_propose(uuid, timestamptz[]), public.recruitment_confirm(uuid),
  public.recruitment_reschedule(uuid), public.recruitment_cancel(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION
  public.recruitment_invite(uuid, text, text, text, text, text, integer, timestamptz[]),
  public.recruitment_propose(uuid, timestamptz[]), public.recruitment_confirm(uuid),
  public.recruitment_reschedule(uuid), public.recruitment_cancel(uuid, text) TO authenticated;
