-- Recruitment calendar: only the League invites, and only candidates whose
-- file is shared; each side confirms only the other's slots; the recruiter
-- cannot be double-booked; outsiders see nothing; both are notified.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
CREATE FUNCTION pg_temp.raises(_sql text, _msg text, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE _sql;
  RAISE EXCEPTION 'FAILED: % (no error)', _what;
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM LIKE 'FAILED%' THEN RAISE; END IF;
  IF SQLERRM <> _msg THEN RAISE EXCEPTION 'FAILED: % (got %)', _what, SQLERRM; END IF;
  RAISE NOTICE 'ok: %', _what;
END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text), pg_temp.raises(text, text, text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000a701', 'recruiter@test'),
  ('00000000-0000-0000-0000-00000000a702', 'candidate@test'),
  ('00000000-0000-0000-0000-00000000a703', 'private@test'),
  ('00000000-0000-0000-0000-00000000a704', 'outsider@test');
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-00000000a701', 'league') ON CONFLICT DO NOTHING;
INSERT INTO public.psychologist_applications (id, user_id, full_name, email, league_share_consent) VALUES
  ('00000000-0000-0000-0000-00000000a7a2', '00000000-0000-0000-0000-00000000a702', 'Candidate', 'candidate@test', true),
  ('00000000-0000-0000-0000-00000000a7a3', '00000000-0000-0000-0000-00000000a703', 'Private', 'private@test', false);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a701', true);

SELECT pg_temp.raises($q$SELECT public.recruitment_invite('00000000-0000-0000-0000-00000000a7a3', 'Entretien', NULL,
  'video', NULL, NULL, 30, ARRAY[now() + interval '2 days'])$q$,
  'file not shared with the League', 'a file not shared with the League cannot be invited');

CREATE TEMP TABLE inv AS SELECT public.recruitment_invite('00000000-0000-0000-0000-00000000a7a2',
  'Entretien LSSPM', 'Bienvenue', 'video', NULL, 'https://meet.example/abc', 30,
  ARRAY[date_trunc('hour', now()) + interval '2 days 10 hours',
        date_trunc('hour', now()) + interval '3 days 10 hours']) AS id;
GRANT SELECT ON inv TO authenticated;

-- The recruiter cannot confirm their own proposal.
SELECT pg_temp.raises(format('SELECT public.recruitment_confirm(%L)',
  (SELECT id FROM public.recruitment_slots ORDER BY starts_at LIMIT 1)),
  'the other side must confirm', 'a side cannot confirm its own slot');

-- Outsiders see nothing and cannot act.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a704', true);
SELECT pg_temp.expect((SELECT count(*) = 0 FROM public.recruitment_invitations), 'outsiders see no invitation');
SELECT pg_temp.raises(format('SELECT public.recruitment_cancel(%L, NULL)', (SELECT id FROM inv)),
  'forbidden', 'outsiders cannot cancel');

-- The candidate proposes a slot of their own, then the recruiter confirms it.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a702', true);
SELECT pg_temp.expect((SELECT count(*) = 2 FROM public.recruitment_slots), 'the candidate sees the proposed slots');
SELECT pg_temp.expect((SELECT count(*) = 1 FROM public.notifications WHERE type = 'recruitment'),
  'the candidate is notified of the invitation');
SELECT public.recruitment_propose((SELECT id FROM inv), ARRAY[date_trunc('hour', now()) + interval '4 days 15 hours']);

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a701', true);
SELECT public.recruitment_confirm((SELECT id FROM public.recruitment_slots WHERE proposed_by = 'candidate'));
SELECT pg_temp.expect((SELECT status = 'scheduled' AND scheduled_at = date_trunc('hour', now()) + interval '4 days 15 hours'
  FROM public.recruitment_invitations WHERE id = (SELECT id FROM inv)), 'the agreed slot is scheduled');

-- A second invitation at the same time cannot be confirmed: no double booking.
RESET ROLE;
INSERT INTO public.psychologist_applications (id, user_id, full_name, email, league_share_consent)
VALUES ('00000000-0000-0000-0000-00000000a7a4', '00000000-0000-0000-0000-00000000a704', 'Other', 'outsider@test', true);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a701', true);
CREATE TEMP TABLE inv2 AS SELECT public.recruitment_invite('00000000-0000-0000-0000-00000000a7a4',
  'Entretien 2', NULL, 'phone', NULL, NULL, 30,
  ARRAY[date_trunc('hour', now()) + interval '4 days 15 hours 15 minutes']) AS id;
GRANT SELECT ON inv2 TO authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a704', true);
SELECT pg_temp.raises(format('SELECT public.recruitment_confirm(%L)',
  (SELECT s.id FROM public.recruitment_slots s WHERE s.invitation_id = (SELECT id FROM inv2))),
  'conflict', 'the recruiter cannot be booked twice at once');

-- The candidate reschedules, then declines.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a702', true);
SELECT public.recruitment_reschedule((SELECT id FROM inv));
SELECT public.recruitment_cancel((SELECT id FROM inv), 'Poste pourvu ailleurs');
SELECT pg_temp.expect((SELECT status = 'declined' AND cancel_reason = 'Poste pourvu ailleurs'
  FROM public.recruitment_invitations WHERE id = (SELECT id FROM inv)), 'the candidate can decline');

ROLLBACK;
