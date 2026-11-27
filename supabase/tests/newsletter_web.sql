-- The newsletter on the site: only sent issues are public, without their
-- send counters; one vote per reader and issue; only admins see the tally.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
CREATE FUNCTION pg_temp.raises(_sql text, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE _sql;
  RAISE EXCEPTION 'FAILED: % (no error)', _what;
EXCEPTION WHEN raise_exception OR insufficient_privilege OR unique_violation OR check_violation THEN
  IF SQLERRM LIKE 'FAILED%' THEN RAISE; END IF;
  RAISE NOTICE 'ok: %', _what;
END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text), pg_temp.raises(text, text) TO anon, authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000ad001', 'nl-admin@mail.ma'),
  ('00000000-0000-0000-0000-0000000ad002', 'nl-reader@mail.ma');
INSERT INTO public.user_roles (user_id, role)
  VALUES ('00000000-0000-0000-0000-0000000ad001', 'admin') ON CONFLICT DO NOTHING;

INSERT INTO public.newsletter_issues (period, status, scheduled_for, intro_fr, items, recipients, sent, sent_at) VALUES
  ('2091-01', 'sent', now(), 'Janvier', '[{"slug":"a"}]', 120, 118, now()),
  ('2091-02', 'scheduled', now() + interval '3 days', 'Février', '[]', 0, 0, NULL),
  ('2091-03', 'cancelled', now(), NULL, '[]', 0, 0, NULL);

SET LOCAL ROLE anon;
SELECT pg_temp.expect((SELECT array_agg(period) FROM public.newsletter_archive(120) WHERE period LIKE '2091-%') = ARRAY['2091-01'],
  'visitors see sent issues only');
SELECT pg_temp.expect((SELECT intro_fr = 'Janvier' AND items = '[{"slug":"a"}]'::jsonb
                         FROM public.newsletter_archive() WHERE period = '2091-01'),
  'with their intro and articles');
SELECT pg_temp.raises($q$SELECT * FROM public.newsletter_votes$q$, 'visitors cannot read votes');
SELECT pg_temp.raises($q$SELECT * FROM public.newsletter_vote_tally('2091-01')$q$, 'visitors cannot read the tally');
RESET ROLE;

-- The newsletter-vote function writes with the service role.
INSERT INTO public.newsletter_votes (period, email, topic) VALUES
  ('2091-01', 'a@mail.ma', 'sleep'), ('2091-01', 'b@mail.ma', 'sleep'), ('2091-01', 'c@mail.ma', 'stress'), ('2091-01', 'f@mail.ma', 'sleep');
SELECT pg_temp.raises($q$INSERT INTO public.newsletter_votes (period, email, topic) VALUES ('2091-01', 'a@mail.ma', 'work')$q$,
  'one vote per reader and issue');
INSERT INTO public.newsletter_votes (period, email, topic) VALUES ('2091-01', 'a@mail.ma', 'work')
  ON CONFLICT (period, email) DO UPDATE SET topic = excluded.topic;
SELECT pg_temp.raises($q$INSERT INTO public.newsletter_votes (period, email, topic) VALUES ('2091-01', 'd@mail.ma', 'politics')$q$,
  'only the listed topics');
SELECT pg_temp.raises($q$INSERT INTO public.newsletter_votes (period, email, topic) VALUES ('2091-01', 'E@mail.ma', 'sleep')$q$,
  'addresses are stored in lower case');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000ad002', true);
SELECT pg_temp.expect((SELECT count(*) = 0 FROM public.newsletter_votes), 'a reader sees no votes');
SELECT pg_temp.raises($q$SELECT * FROM public.newsletter_vote_tally('2091-01')$q$, 'nor the tally');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000ad001', true);
SELECT pg_temp.expect((SELECT array_agg(topic || ':' || votes ORDER BY votes DESC, topic)
                         FROM public.newsletter_vote_tally('2091-01')) = ARRAY['sleep:2', 'stress:1', 'work:1'],
  'admins see the tally, a changed vote counted once');
RESET ROLE;

ROLLBACK;
