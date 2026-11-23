-- LSSPM engagement: members log contributions that only evaluators validate
-- (never their own), the scoreboard ranks members by points and ratings,
-- legalised documents are verified by the League, and the disciplinary
-- procedure keeps the 15-day defence period before any decision, with
-- exclusion ending the membership.
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
  ('00000000-0000-0000-0000-00000000f301', 'active@test'),
  ('00000000-0000-0000-0000-00000000f302', 'idle@test'),
  ('00000000-0000-0000-0000-00000000f303', 'league@test'),
  ('00000000-0000-0000-0000-00000000f304', 'lead@test');
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-00000000f303', 'league') ON CONFLICT DO NOTHING;
INSERT INTO public.league_division_leads (division_id, user_id)
  SELECT id, '00000000-0000-0000-0000-00000000f304' FROM public.league_divisions WHERE code = 'supervision';
INSERT INTO public.league_memberships (user_id, plan_id, status, member_number, starts_on, ends_on)
  SELECT u, (SELECT id FROM public.league_membership_plans WHERE code = 'praticien'), 'active', n,
         current_date - 400, make_date(extract(year FROM current_date)::int, 12, 31)
  FROM (VALUES ('00000000-0000-0000-0000-00000000f301'::uuid, 'LSSPM-T-1'),
               ('00000000-0000-0000-0000-00000000f302'::uuid, 'LSSPM-T-2')) v(u, n);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000f301', true);
SELECT pg_temp.expect((SELECT count(*) = 4 FROM public.league_divisions), 'the four pôles are offered');
INSERT INTO public.league_member_profiles (division_ids, project)
  SELECT ARRAY[id], 'Animer un groupe de supervision' FROM public.league_divisions WHERE code = 'supervision';
INSERT INTO public.league_contributions (kind, title, happened_on) VALUES ('training', 'Atelier gestion du stress', current_date);
DO $$ BEGIN
  INSERT INTO public.league_contributions (kind, title, happened_on, status, points)
  VALUES ('training', 'Auto-validé', current_date, 'validated', 30);
  RAISE EXCEPTION 'FAILED: a member validated their own contribution';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: members cannot self-validate';
END $$;
SELECT pg_temp.raises(format('SELECT public.league_review_contribution(%L, true, 30, NULL)',
  (SELECT id FROM public.league_contributions LIMIT 1)), 'forbidden', 'members cannot review contributions');
SELECT public.league_accept('honour', '2026-09', 'Membre Actif');
SELECT public.league_submit_legalized((SELECT id FROM public.league_commitments), '00000000-0000-0000-0000-00000000f301/legal.pdf');

-- The supervision lead validates (default points) and rates the member.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000f304', true);
-- The portal leaves _points and _note out to apply the default points.
SELECT public.league_review_contribution((SELECT id FROM public.league_contributions LIMIT 1), true);
INSERT INTO public.league_evaluations (user_id, period, engagement, quality, collaboration, reliability)
  VALUES ('00000000-0000-0000-0000-00000000f301', extract(year FROM current_date) || '-S2', 5, 4, 5, 4);
SELECT pg_temp.expect((SELECT points = 10 AND rating = 4.5 AND score = 32.5 AND rank() OVER () = 1
  FROM public.league_scoreboard(extract(year FROM current_date)::int) LIMIT 1),
  'the scoreboard ranks by points + 5 × rating');

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000f301', true);
SELECT pg_temp.expect((SELECT rank = 1 AND members = 2 FROM public.league_my_standing()),
  'the member sees their rank');

-- The League verifies the legalised copy, lists the idle member, opens a procedure.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000f303', true);
SELECT public.league_review_commitment((SELECT id FROM public.league_commitments), true, NULL);
SELECT pg_temp.expect((SELECT status = 'verified' FROM public.league_commitments), 'the League verifies the legalised copy');
SELECT pg_temp.expect((SELECT array_agg(member_number) = ARRAY['LSSPM-T-2'] FROM public.league_inactive_members()),
  'only the member without contribution is listed as inactive');
CREATE TEMP TABLE k AS SELECT public.league_discipline_open('00000000-0000-0000-0000-00000000f302', 'exclusion',
  'Aucune participation depuis plus de six mois malgré relance.') AS id;
GRANT SELECT ON k TO authenticated;
SELECT pg_temp.raises(format('SELECT public.league_discipline_decide(%L, %L)', (SELECT id FROM k), 'Exclusion'),
  'defence period not over', 'no decision before the 15-day defence period');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000f302', true);
SELECT public.league_discipline_defend((SELECT id FROM k), 'Je reprends mes activités au pôle formation.');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000f303', true);
SELECT public.league_discipline_decide((SELECT id FROM k), 'Exclusion après défense examinée.');
SELECT pg_temp.expect(NOT public.is_league_member('00000000-0000-0000-0000-00000000f302'),
  'exclusion ends the membership once the defence is heard');

ROLLBACK;
