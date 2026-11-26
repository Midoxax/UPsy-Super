-- The League's webinars, end to end: access per webinar (members only,
-- paid with a free member seat), the transfer confirmed by U.Psy with a
-- numbered receipt, confirmation and reminders sent once, certificates and
-- League participation for those who attended long enough (and speakers),
-- the replay notice and members' access to it, and the League's report
-- with the revenue split.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
CREATE FUNCTION pg_temp.raises(_sql text, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE _sql;
  RAISE EXCEPTION 'FAILED: % (no error)', _what;
EXCEPTION WHEN raise_exception OR insufficient_privilege THEN
  IF SQLERRM LIKE 'FAILED%' THEN RAISE; END IF;
  RAISE NOTICE 'ok: %', _what;
END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text), pg_temp.raises(text, text) TO authenticated;

-- a: U.Psy admin (host) · m: League member · n: non-member · s: speaker
-- z: another member · l: League staff
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000aa01', 'web-admin@mail.ma'),
  ('00000000-0000-0000-0000-00000000aa02', 'web-member@mail.ma'),
  ('00000000-0000-0000-0000-00000000aa03', 'web-guest@mail.ma'),
  ('00000000-0000-0000-0000-00000000aa04', 'web-speaker@mail.ma'),
  ('00000000-0000-0000-0000-00000000aa05', 'web-member2@mail.ma'),
  ('00000000-0000-0000-0000-00000000aa06', 'web-league@mail.ma');
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-00000000aa01', 'admin'),
  ('00000000-0000-0000-0000-00000000aa06', 'league') ON CONFLICT DO NOTHING;
INSERT INTO public.league_memberships (user_id, plan_id, status, member_number, starts_on, ends_on)
  SELECT u, (SELECT id FROM public.league_membership_plans WHERE code = 'praticien'), 'active', n,
         current_date - 10, current_date + 300
    FROM (VALUES ('00000000-0000-0000-0000-00000000aa02'::uuid, 'WEB-T-1'),
                 ('00000000-0000-0000-0000-00000000aa05'::uuid, 'WEB-T-2')) v(u, n);
UPDATE public.training_settings SET upsy_share_pct = 20, rib = '011 780 0000123456789012 34';

INSERT INTO public.live_classes (id, title, host_id, starts_at, duration_minutes, recording_enabled, is_published,
                                 organizer, access, price_mad, member_price_mad, training_hours, speaker_name)
VALUES
  ('00000000-0000-0000-0000-00000000ab01', 'Trauma et EMDR', '00000000-0000-0000-0000-00000000aa01',
   now() + interval '3 days', 60, false, true, 'lsspm', 'paid', 200, 0, 1.5, 'Dr Amina'),
  ('00000000-0000-0000-0000-00000000ab02', 'Supervision clinique', '00000000-0000-0000-0000-00000000aa01',
   now() + interval '3 days', 60, false, true, 'lsspm', 'members', NULL, 0, 1, NULL);

SET LOCAL ROLE authenticated;
-- The non-member: a paid seat, and no members-only webinar.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000aa03', true);
SELECT pg_temp.expect(public.register_live_class('00000000-0000-0000-0000-00000000ab02') = 'members_only',
  'members-only webinars refuse non-members');
SELECT pg_temp.expect(public.register_live_class('00000000-0000-0000-0000-00000000ab01') = 'payment_required',
  'a non-member must pay for a paid webinar');
SELECT pg_temp.expect((SELECT (j->>'amount_mad')::numeric = 200 AND j->>'rib' IS NOT NULL AND j->>'reference' LIKE 'WEB-%'
                         FROM public.webinar_payment_info('00000000-0000-0000-0000-00000000ab01') j),
  'they see the amount, the account and a reference');
SELECT public.submit_webinar_payment('00000000-0000-0000-0000-00000000ab01', 'VIR 778812');

-- The member: free seat, confirmed at once.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000aa02', true);
SELECT pg_temp.expect(public.register_live_class('00000000-0000-0000-0000-00000000ab01') = 'registered',
  'a member''s seat is free and confirmed');
SELECT pg_temp.raises($q$SELECT public.verify_webinar_payment((SELECT id FROM public.live_class_registrations
  WHERE user_id = '00000000-0000-0000-0000-00000000aa03'), true)$q$, 'only U.Psy confirms payments');
SELECT pg_temp.raises($q$SELECT public.league_training_report()$q$, 'a member cannot read the League report');

-- U.Psy confirms the transfer.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000aa01', true);
SELECT pg_temp.expect(public.verify_webinar_payment((SELECT id FROM public.live_class_registrations
  WHERE user_id = '00000000-0000-0000-0000-00000000aa03'), true) LIKE 'WEB-%-0%',
  'the confirmed transfer gets a numbered receipt');
SELECT public.add_live_class_speaker('00000000-0000-0000-0000-00000000ab01', 'WEB-speaker@mail.ma');
RESET ROLE;

SELECT pg_temp.expect((SELECT count(*) = 2 FROM public.notifications
                        WHERE type = 'league_training' AND title LIKE 'Inscription confirmée%'
                          AND user_id IN ('00000000-0000-0000-0000-00000000aa02', '00000000-0000-0000-0000-00000000aa03')),
  'member and paying guest get one confirmation each, League-branded');
SELECT pg_temp.expect(NOT EXISTS (SELECT 1 FROM public.notifications
                                   WHERE user_id = '00000000-0000-0000-0000-00000000aa04' AND title LIKE 'Inscription%'),
  'speakers do not get a participant confirmation');

-- Reminders: once the day before, once an hour before.
UPDATE public.live_classes SET starts_at = now() + interval '20 hours' WHERE id = '00000000-0000-0000-0000-00000000ab01';
SELECT public.webinar_tick(); SELECT public.webinar_tick();
SELECT pg_temp.expect((SELECT count(*) = 3 FROM public.notifications WHERE title LIKE 'Demain : Trauma%'),
  'one day-before reminder per confirmed seat, not repeated');
UPDATE public.live_classes SET starts_at = now() + interval '50 minutes' WHERE id = '00000000-0000-0000-0000-00000000ab01';
SELECT public.webinar_tick();
SELECT pg_temp.expect((SELECT count(*) = 3 FROM public.notifications WHERE title LIKE 'Dans une heure : Trauma%'),
  'then the hour-before reminder');

-- After the webinar: 60 minutes, 75 % needed (45 minutes).
UPDATE public.live_classes SET starts_at = now() - interval '2 hours' WHERE id = '00000000-0000-0000-0000-00000000ab01';
INSERT INTO public.live_class_attendance (class_id, user_id, joined_at, last_seen_at) VALUES
  ('00000000-0000-0000-0000-00000000ab01', '00000000-0000-0000-0000-00000000aa02', now() - interval '2 hours', now() - interval '65 minutes'),
  ('00000000-0000-0000-0000-00000000ab01', '00000000-0000-0000-0000-00000000aa03', now() - interval '2 hours', now() - interval '90 minutes');
SELECT public.webinar_tick();
SELECT pg_temp.expect((SELECT closed_at IS NOT NULL FROM public.live_classes WHERE id = '00000000-0000-0000-0000-00000000ab01'),
  'the scheduler closes a finished webinar');
SELECT pg_temp.expect((SELECT array_agg(user_id ORDER BY user_id) = ARRAY['00000000-0000-0000-0000-00000000aa02',
                                                                          '00000000-0000-0000-0000-00000000aa04']::uuid[]
                         FROM public.certificates WHERE certificate_type = 'webinar_attendance'
                          AND reference_id = '00000000-0000-0000-0000-00000000ab01'),
  'certificates for who stayed 45 minutes and for the speaker, not for 30 minutes');
SELECT pg_temp.expect((SELECT (metadata->>'training_hours')::numeric = 1.5 FROM public.certificates
                        WHERE user_id = '00000000-0000-0000-0000-00000000aa02' AND certificate_type = 'webinar_attendance'),
  'the certificate carries the training hours');
SELECT pg_temp.expect((SELECT count(*) = 1 AND bool_and(status = 'validated' AND kind = 'training' AND points = 10)
                         FROM public.league_contributions WHERE evidence_url LIKE '%00000000-0000-0000-0000-00000000ab01'),
  'the member''s attendance counts on the League scoreboard; the non-members'' do not');
SELECT public.close_live_class('00000000-0000-0000-0000-00000000ab01');
SELECT pg_temp.expect((SELECT count(*) = 2 FROM public.certificates WHERE reference_id = '00000000-0000-0000-0000-00000000ab01')
  AND (SELECT count(*) = 1 FROM public.league_contributions WHERE evidence_url LIKE '%00000000-0000-0000-0000-00000000ab01'),
  'closing again issues nothing twice');

-- The replay.
INSERT INTO public.live_class_recordings (id, class_id, source_key, status, storage_path)
  VALUES ('00000000-0000-0000-0000-00000000ac01', '00000000-0000-0000-0000-00000000ab02', 'k1', 'stored', 'x/y.mp4');
UPDATE public.live_class_recordings SET is_published = true WHERE id = '00000000-0000-0000-0000-00000000ac01';
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000aa05', true);
SELECT pg_temp.expect((SELECT count(*) = 1 FROM public.live_class_recordings WHERE id = '00000000-0000-0000-0000-00000000ac01'),
  'a member watches a League replay without having registered');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000aa03', true);
SELECT pg_temp.expect((SELECT count(*) = 0 FROM public.live_class_recordings WHERE id = '00000000-0000-0000-0000-00000000ac01'),
  'a non-member does not see a members-only replay');

-- The League's report.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000aa06', true);
SELECT pg_temp.expect((SELECT paid_seats = 1 AND revenue_mad = 200 AND upsy_share_mad = 40 AND league_share_mad = 160
                              AND registered = 3 AND attended = 2 AND certificates = 2
                         FROM public.league_training_report() WHERE class_id = '00000000-0000-0000-0000-00000000ab01'),
  'the League sees seats, attendance, certificates and the 20 % / 80 % split');
SELECT pg_temp.expect((SELECT count(*) = 2 FROM public.live_classes WHERE organizer = 'lsspm'),
  'League staff see the League''s webinars');
RESET ROLE;

SELECT pg_temp.expect(NOT has_function_privilege('authenticated', 'public.webinar_tick()', 'EXECUTE'),
  'only the scheduler runs reminders and closing');

ROLLBACK;
