-- The League's training platform, run by U.Psy (live classes, extended).
--
-- U.Psy organises and hosts the League's webinars; each one sets who may
-- attend: anyone (open), active members only (members), or paying seats
-- (paid, with a member price, free by default). Paid seats are settled by
-- bank transfer and confirmed by U.Psy, like League dues. Every webinar then
-- produces, on its own:
--   - reminders the day before and an hour before, and a notice when the
--     replay is published (in-app and email, through notify_user);
--   - attendance certificates (numbered, verifiable) with training hours,
--     for whoever attended long enough;
--   - for League webinars, a validated contribution on the participation
--     scoreboard for each member who attended or spoke;
-- and the League sees a report: registrations, attendance, certificates,
-- paid seats and the revenue split of its licence (licence + share).

-- 1. Webinar settings ---------------------------------------------------------
ALTER TABLE public.live_classes
  ADD COLUMN IF NOT EXISTS organizer text CHECK (organizer IS NULL OR organizer = 'lsspm'),
  ADD COLUMN IF NOT EXISTS access text NOT NULL DEFAULT 'open'
    CHECK (access IN ('open', 'members', 'paid')),
  ADD COLUMN IF NOT EXISTS price_mad numeric(10,2) CHECK (price_mad IS NULL OR price_mad >= 0),
  ADD COLUMN IF NOT EXISTS member_price_mad numeric(10,2) NOT NULL DEFAULT 0 CHECK (member_price_mad >= 0),
  ADD COLUMN IF NOT EXISTS training_hours numeric(4,1)
    CHECK (training_hours IS NULL OR (training_hours > 0 AND training_hours <= 100)),
  ADD COLUMN IF NOT EXISTS min_attendance_pct integer NOT NULL DEFAULT 75
    CHECK (min_attendance_pct BETWEEN 10 AND 100),
  ADD COLUMN IF NOT EXISTS speaker_name text CHECK (speaker_name IS NULL OR length(speaker_name) <= 200),
  ADD COLUMN IF NOT EXISTS speaker_title text CHECK (speaker_title IS NULL OR length(speaker_title) <= 300),
  -- When certificates and participation were issued (see close_live_class).
  ADD COLUMN IF NOT EXISTS closed_at timestamptz;

DO $$ BEGIN
  ALTER TABLE public.live_classes ADD CONSTRAINT live_classes_paid_price
    CHECK (access <> 'paid' OR coalesce(price_mad, 0) > 0);
  ALTER TABLE public.live_classes ADD CONSTRAINT live_classes_members_league
    CHECK (access <> 'members' OR organizer IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Registrations: speakers, paid seats, reminders --------------------------
ALTER TABLE public.live_class_registrations
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'participant'
    CHECK (role IN ('participant', 'speaker')),
  ADD COLUMN IF NOT EXISTS amount_mad numeric(10,2) NOT NULL DEFAULT 0 CHECK (amount_mad >= 0),
  -- none: nothing to pay. pending → submitted (reference given) → verified / rejected.
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'none'
    CHECK (payment_status IN ('none', 'pending', 'submitted', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS payer_reference text CHECK (payer_reference IS NULL OR length(payer_reference) <= 200),
  ADD COLUMN IF NOT EXISTS payment_verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS receipt_number text UNIQUE,
  ADD COLUMN IF NOT EXISTS reminded_24h_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminded_1h_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_notified_at timestamptz;

CREATE INDEX IF NOT EXISTS live_class_registrations_payment_idx
  ON public.live_class_registrations (payment_status) WHERE payment_status IN ('pending', 'submitted');
CREATE INDEX IF NOT EXISTS live_class_registrations_verified_by_idx
  ON public.live_class_registrations (payment_verified_by);

CREATE SEQUENCE IF NOT EXISTS public.webinar_receipt_seq;

-- A registration counts (room access, certificate, reminders) once nothing
-- is left to pay.
CREATE OR REPLACE FUNCTION public.webinar_confirmed(_payment text, _cancelled timestamptz)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT _cancelled IS NULL AND _payment IN ('none', 'verified');
$$;

-- 3. The licence: U.Psy's annual fee and share of paid seats, and the bank
-- account paid seats go to (U.Psy collects, the League's share is paid back).
CREATE TABLE IF NOT EXISTS public.training_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  licence_annual_mad numeric(12,2) NOT NULL DEFAULT 0 CHECK (licence_annual_mad >= 0),
  upsy_share_pct numeric(5,2) NOT NULL DEFAULT 20 CHECK (upsy_share_pct BETWEEN 0 AND 100),
  bank_name text,
  account_holder text,
  rib text CHECK (rib IS NULL OR rib ~ '^[0-9 ]{20,34}$'),
  instructions_fr text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.training_settings (id, account_holder) VALUES (true, 'U.Psy')
ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.training_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.training_settings FROM PUBLIC, anon;
GRANT SELECT, UPDATE ON public.training_settings TO authenticated;
GRANT ALL ON public.training_settings TO service_role;
DROP POLICY IF EXISTS training_settings_read ON public.training_settings;
CREATE POLICY training_settings_read ON public.training_settings FOR SELECT TO authenticated
  USING ((SELECT public.has_role((SELECT auth.uid()), 'admin'))
      OR (SELECT public.has_role((SELECT auth.uid()), 'league')));
DROP POLICY IF EXISTS training_settings_admin ON public.training_settings;
CREATE POLICY training_settings_admin ON public.training_settings FOR UPDATE TO authenticated
  USING ((SELECT public.has_role((SELECT auth.uid()), 'admin')))
  WITH CHECK ((SELECT public.has_role((SELECT auth.uid()), 'admin')));

-- 4. Registration by access ---------------------------------------------------
-- Returns: registered | payment_required | members_only | consent_required |
--          full | past | unavailable.
DROP FUNCTION IF EXISTS public.register_live_class(uuid, boolean);
CREATE OR REPLACE FUNCTION public.register_live_class(_class uuid, _recording_consent boolean DEFAULT false)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  c public.live_classes;
  taken integer;
  _member boolean;
  _amount numeric;
  _existing public.live_class_registrations;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'sign in required'; END IF;
  SELECT * INTO c FROM public.live_classes WHERE id = _class FOR UPDATE;
  IF NOT FOUND OR NOT c.is_published OR c.status <> 'scheduled' THEN
    RETURN 'unavailable';
  END IF;
  IF c.starts_at + make_interval(mins => c.duration_minutes) < now() THEN
    RETURN 'past';
  END IF;
  _member := c.organizer = 'lsspm' AND public.is_league_member(auth.uid());
  IF c.access = 'members' AND NOT _member THEN
    RETURN 'members_only';
  END IF;
  IF c.recording_enabled AND NOT coalesce(_recording_consent, false) THEN
    RETURN 'consent_required';
  END IF;

  SELECT * INTO _existing FROM public.live_class_registrations
   WHERE class_id = _class AND user_id = auth.uid();
  IF FOUND AND _existing.cancelled_at IS NULL THEN
    RETURN CASE WHEN public.webinar_confirmed(_existing.payment_status, NULL)
                THEN 'registered' ELSE 'payment_required' END;
  END IF;

  IF c.capacity IS NOT NULL THEN
    SELECT count(*) INTO taken FROM public.live_class_registrations
      WHERE class_id = _class AND cancelled_at IS NULL;
    IF taken >= c.capacity THEN RETURN 'full'; END IF;
  END IF;

  _amount := CASE WHEN c.access = 'paid'
                  THEN CASE WHEN _member THEN c.member_price_mad ELSE c.price_mad END
                  ELSE 0 END;
  INSERT INTO public.live_class_registrations
    (class_id, user_id, recording_consent_at, amount_mad, payment_status)
  VALUES (_class, auth.uid(), CASE WHEN _recording_consent THEN now() END,
          coalesce(_amount, 0), CASE WHEN coalesce(_amount, 0) > 0 THEN 'pending' ELSE 'none' END)
  ON CONFLICT (class_id, user_id) DO UPDATE
    SET cancelled_at = NULL, registered_at = now(),
        recording_consent_at = CASE WHEN _recording_consent THEN now() END,
        amount_mad = EXCLUDED.amount_mad,
        payment_status = CASE
          WHEN public.live_class_registrations.payment_status = 'verified' THEN 'verified'
          ELSE EXCLUDED.payment_status END;
  RETURN CASE WHEN coalesce(_amount, 0) > 0
                   AND coalesce(_existing.payment_status, '') <> 'verified'
              THEN 'payment_required' ELSE 'registered' END;
END $$;

-- What to pay for a seat, and where.
CREATE OR REPLACE FUNCTION public.webinar_payment_info(_class uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'amount_mad', r.amount_mad, 'payment_status', r.payment_status,
    'payer_reference', r.payer_reference, 'receipt_number', r.receipt_number,
    'reference', 'WEB-' || upper(left(replace(r.id::text, '-', ''), 8)),
    'bank_name', s.bank_name, 'account_holder', s.account_holder, 'rib', s.rib,
    'instructions', s.instructions_fr)
  FROM public.live_class_registrations r CROSS JOIN public.training_settings s
  WHERE r.class_id = _class AND r.user_id = auth.uid() AND r.cancelled_at IS NULL;
$$;

-- The participant says they paid, with their transfer reference.
CREATE OR REPLACE FUNCTION public.submit_webinar_payment(_class uuid, _reference text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF length(btrim(coalesce(_reference, ''))) < 3 THEN RAISE EXCEPTION 'reference required'; END IF;
  UPDATE public.live_class_registrations
     SET payment_status = 'submitted', payer_reference = left(btrim(_reference), 200)
   WHERE class_id = _class AND user_id = auth.uid() AND cancelled_at IS NULL
     AND payment_status IN ('pending', 'submitted', 'rejected');
  IF NOT FOUND THEN RAISE EXCEPTION 'nothing to pay'; END IF;
  PERFORM public.notify_admins('Paiement de webinaire à vérifier',
    'Une référence de virement a été transmise pour une place de webinaire.', '/learn/live/manage');
END $$;

-- U.Psy confirms (numbered receipt) or rejects a paid seat.
CREATE OR REPLACE FUNCTION public.verify_webinar_payment(_registration uuid, _ok boolean, _note text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.live_class_registrations; c public.live_classes; _receipt text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO r FROM public.live_class_registrations WHERE id = _registration FOR UPDATE;
  IF NOT FOUND OR r.payment_status NOT IN ('pending', 'submitted') THEN
    RAISE EXCEPTION 'nothing to verify';
  END IF;
  SELECT * INTO c FROM public.live_classes WHERE id = r.class_id;
  IF _ok THEN
    _receipt := 'WEB-' || extract(year FROM now())::int || '-'
                || lpad(nextval('public.webinar_receipt_seq')::text, 4, '0');
    UPDATE public.live_class_registrations
       SET payment_status = 'verified', receipt_number = _receipt,
           payment_verified_by = auth.uid(), payment_verified_at = now()
     WHERE id = _registration;
  ELSE
    UPDATE public.live_class_registrations
       SET payment_status = 'rejected', payment_verified_by = auth.uid(), payment_verified_at = now()
     WHERE id = _registration;
    PERFORM public.notify_user(r.user_id, public.webinar_notice_type(c.organizer), 'Paiement non confirmé : ' || c.title,
      'Nous n''avons pas pu confirmer votre virement' || coalesce(' (' || nullif(btrim(_note), '') || ')', '')
      || '. Vérifiez la référence ou écrivez-nous à contact@upsy.ma.', '/learn/live', true);
  END IF;
  RETURN _receipt;
END $$;

-- 5. Notices: confirmation, reminders, replay ----------------------------------
-- League webinars carry the League's co-branding in emails.
CREATE OR REPLACE FUNCTION public.webinar_notice_type(_organizer text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT CASE WHEN _organizer = 'lsspm' THEN 'league_training' ELSE 'training' END;
$$;

CREATE OR REPLACE FUNCTION public.webinar_when(_at timestamptz)
RETURNS text LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT public.fr_date((_at AT TIME ZONE 'Africa/Casablanca')::date) || ' à '
         || to_char(_at AT TIME ZONE 'Africa/Casablanca', 'HH24"h"MI');
$$;

-- Confirmation as soon as a seat is confirmed (free, or payment verified).
CREATE OR REPLACE FUNCTION public.webinar_registration_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.live_classes;
BEGIN
  IF public.webinar_confirmed(NEW.payment_status, NEW.cancelled_at)
     AND NEW.confirmed_notified_at IS NULL AND NEW.role = 'participant' THEN
    SELECT * INTO c FROM public.live_classes WHERE id = NEW.class_id;
    PERFORM public.notify_user(NEW.user_id, public.webinar_notice_type(c.organizer), 'Inscription confirmée : ' || c.title,
      'Rendez-vous le ' || public.webinar_when(c.starts_at) || ' (heure du Maroc), pour '
      || c.duration_minutes || ' minutes.'
      || coalesce(E'\n' || 'Intervenant : ' || c.speaker_name, '')
      || coalesce(E'\n' || 'Reçu de paiement : ' || NEW.receipt_number, '')
      || E'\n\n' || 'La salle ouvre 10 minutes avant. Ajoutez la séance à votre agenda depuis la page du webinaire.',
      '/learn/live/' || c.id, true);
    UPDATE public.live_class_registrations SET confirmed_notified_at = now() WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS webinar_registration_notify ON public.live_class_registrations;
CREATE TRIGGER webinar_registration_notify
  AFTER INSERT OR UPDATE OF payment_status, cancelled_at ON public.live_class_registrations
  FOR EACH ROW EXECUTE FUNCTION public.webinar_registration_notify();

-- Replay published → every confirmed participant is told.
CREATE OR REPLACE FUNCTION public.webinar_replay_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.live_classes; r record;
BEGIN
  IF NEW.is_published AND NEW.status = 'stored'
     AND NOT (coalesce(OLD.is_published, false) AND OLD.status = 'stored') THEN
    SELECT * INTO c FROM public.live_classes WHERE id = NEW.class_id;
    FOR r IN SELECT user_id FROM public.live_class_registrations
              WHERE class_id = NEW.class_id
                AND public.webinar_confirmed(payment_status, cancelled_at) LOOP
      PERFORM public.notify_user(r.user_id, public.webinar_notice_type(c.organizer), 'Le replay est disponible : ' || c.title,
        'L''enregistrement de la séance du ' || public.webinar_when(c.starts_at)
        || ' est en ligne. Vous pouvez le revoir à votre rythme.', '/learn/live/' || c.id, true);
    END LOOP;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS webinar_replay_notify ON public.live_class_recordings;
CREATE TRIGGER webinar_replay_notify
  AFTER UPDATE OF is_published, status ON public.live_class_recordings
  FOR EACH ROW EXECUTE FUNCTION public.webinar_replay_notify();

-- 6. After the webinar: certificates and participation -----------------------
DO $$ BEGIN
  ALTER TYPE public.certificate_type ADD VALUE IF NOT EXISTS 'webinar_attendance';
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Minutes a person spent in the room (attendance heartbeats).
CREATE OR REPLACE FUNCTION public.live_class_minutes(_class uuid, _user uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(round(sum(extract(epoch FROM a.last_seen_at - a.joined_at)) / 60)::int, 0)
  FROM public.live_class_attendance a WHERE a.class_id = _class AND a.user_id = _user;
$$;

-- Issues certificates (whoever stayed min_attendance_pct of the time, and
-- speakers) and, for League webinars, the participation of members. Run by
-- the scheduler 30 minutes after the end; an admin can run it again later
-- (nothing is issued twice).
CREATE OR REPLACE FUNCTION public.close_live_class(_class uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  c public.live_classes;
  r record;
  _certs integer := 0;
  _points integer := 0;
  _name text;
  _need integer;
BEGIN
  -- Admins, or the scheduler / server (no signed-in user).
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT * INTO c FROM public.live_classes WHERE id = _class FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'not found'; END IF;
  IF c.starts_at + make_interval(mins => c.duration_minutes) > now() THEN
    RAISE EXCEPTION 'not finished';
  END IF;
  _need := ceil(c.duration_minutes * c.min_attendance_pct / 100.0);

  FOR r IN
    SELECT g.user_id, g.role
      FROM public.live_class_registrations g
     WHERE g.class_id = _class AND public.webinar_confirmed(g.payment_status, g.cancelled_at)
       AND (g.role = 'speaker' OR public.live_class_minutes(_class, g.user_id) >= _need)
  LOOP
    IF c.training_hours IS NOT NULL AND NOT EXISTS (
         SELECT 1 FROM public.certificates
          WHERE user_id = r.user_id AND certificate_type = 'webinar_attendance' AND reference_id = _class) THEN
      SELECT coalesce(nullif(btrim(p.full_name), ''), u.email) INTO _name
        FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id WHERE u.id = r.user_id;
      INSERT INTO public.certificates (user_id, certificate_type, title, description,
                                       recipient_name, reference_id, metadata)
      VALUES (r.user_id, 'webinar_attendance', coalesce(c.title_fr, c.title),
              CASE WHEN r.role = 'speaker' THEN 'Intervention' ELSE 'Participation' END
                || ' au webinaire du ' || public.webinar_when(c.starts_at)
                || ' (' || c.training_hours || ' h de formation)',
              coalesce(_name, 'Participant'), _class,
              jsonb_build_object('training_hours', c.training_hours, 'role', r.role,
                                 'organizer', c.organizer, 'starts_at', c.starts_at,
                                 'speaker', c.speaker_name,
                                 'minutes', public.live_class_minutes(_class, r.user_id)));
      _certs := _certs + 1;
    END IF;

    IF c.organizer = 'lsspm' AND public.is_league_member(r.user_id)
       AND NOT EXISTS (SELECT 1 FROM public.league_contributions
                        WHERE user_id = r.user_id AND evidence_url = 'https://upsy.ma/learn/live/' || _class) THEN
      INSERT INTO public.league_contributions (user_id, kind, title, happened_on, evidence_url,
                                               status, points, review_note, reviewed_at)
      VALUES (r.user_id, CASE WHEN r.role = 'speaker' THEN 'event' ELSE 'training' END,
              left(CASE WHEN r.role = 'speaker' THEN 'Intervention : ' ELSE 'Webinaire : ' END
                   || coalesce(c.title_fr, c.title), 200),
              (c.starts_at AT TIME ZONE 'Africa/Casablanca')::date,
              'https://upsy.ma/learn/live/' || _class, 'validated',
              CASE WHEN r.role = 'speaker' THEN public.league_default_points('event') + 4
                   ELSE public.league_default_points('training') END,
              'Présence enregistrée automatiquement sur U.Psy.', now());
      _points := _points + 1;
    END IF;
  END LOOP;

  UPDATE public.live_classes SET closed_at = now() WHERE id = _class AND closed_at IS NULL;
  RETURN jsonb_build_object('certificates', _certs, 'participations', _points);
END $$;

-- 7. The scheduler: reminders, and closing finished webinars ----------------
CREATE OR REPLACE FUNCTION public.webinar_tick()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT g.id, g.user_id, c.id AS class_id, c.title, c.starts_at, c.organizer,
           (c.starts_at - now() <= interval '75 minutes') AS soon
      FROM public.live_class_registrations g JOIN public.live_classes c ON c.id = g.class_id
     WHERE c.status = 'scheduled' AND c.is_published AND c.starts_at > now()
       AND public.webinar_confirmed(g.payment_status, g.cancelled_at)
       AND ((c.starts_at - now() <= interval '75 minutes' AND g.reminded_1h_at IS NULL)
         OR (c.starts_at - now() <= interval '25 hours' AND c.starts_at - now() > interval '75 minutes'
             AND g.reminded_24h_at IS NULL))
  LOOP
    PERFORM public.notify_user(r.user_id, public.webinar_notice_type(r.organizer),
      CASE WHEN r.soon THEN 'Dans une heure : ' ELSE 'Demain : ' END || r.title,
      'Votre webinaire commence le ' || public.webinar_when(r.starts_at)
      || ' (heure du Maroc). La salle ouvre 10 minutes avant.', '/learn/live/' || r.class_id, true);
    IF r.soon THEN
      UPDATE public.live_class_registrations SET reminded_1h_at = now(), reminded_24h_at = coalesce(reminded_24h_at, now())
       WHERE id = r.id;
    ELSE
      UPDATE public.live_class_registrations SET reminded_24h_at = now() WHERE id = r.id;
    END IF;
  END LOOP;

  FOR r IN
    SELECT id FROM public.live_classes
     WHERE closed_at IS NULL AND status = 'scheduled'
       AND starts_at + make_interval(mins => duration_minutes) + interval '30 minutes' < now()
       AND starts_at > now() - interval '7 days'
  LOOP
    PERFORM public.close_live_class(r.id);
  END LOOP;
END $$;

-- 8. The League's report ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.league_training_report(_from date DEFAULT NULL, _to date DEFAULT NULL)
RETURNS TABLE (class_id uuid, title text, starts_at timestamptz, access text, speaker_name text,
               training_hours numeric, registered integer, attended integer, certificates integer,
               paid_seats integer, revenue_mad numeric, upsy_share_mad numeric, league_share_mad numeric,
               recording_published boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _pct numeric;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'league')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT upsy_share_pct INTO _pct FROM public.training_settings;
  RETURN QUERY
  SELECT c.id, coalesce(c.title_fr, c.title), c.starts_at, c.access, c.speaker_name, c.training_hours,
    (SELECT count(*)::int FROM public.live_class_registrations g
      WHERE g.class_id = c.id AND public.webinar_confirmed(g.payment_status, g.cancelled_at)),
    (SELECT count(DISTINCT a.user_id)::int FROM public.live_class_attendance a WHERE a.class_id = c.id),
    (SELECT count(*)::int FROM public.certificates x
      WHERE x.certificate_type = 'webinar_attendance' AND x.reference_id = c.id),
    (SELECT count(*)::int FROM public.live_class_registrations g
      WHERE g.class_id = c.id AND g.payment_status = 'verified'),
    v.revenue,
    round(v.revenue * coalesce(_pct, 0) / 100, 2),
    v.revenue - round(v.revenue * coalesce(_pct, 0) / 100, 2),
    EXISTS (SELECT 1 FROM public.live_class_recordings k
             WHERE k.class_id = c.id AND k.is_published AND k.status = 'stored')
  FROM public.live_classes c
  CROSS JOIN LATERAL (
    SELECT coalesce(sum(g.amount_mad) FILTER (WHERE g.payment_status = 'verified'), 0)::numeric AS revenue
      FROM public.live_class_registrations g WHERE g.class_id = c.id) v
  WHERE c.organizer = 'lsspm'
    AND (_from IS NULL OR c.starts_at >= _from)
    AND (_to IS NULL OR c.starts_at < _to + 1)
  ORDER BY c.starts_at DESC;
END $$;

-- 9. Access to League webinars and replays ----------------------------------
-- The League's staff can see its webinars even unpublished; members watch
-- the replays of open and members-only League webinars without registering.
DROP POLICY IF EXISTS live_classes_read ON public.live_classes;
CREATE POLICY live_classes_read ON public.live_classes FOR SELECT
  USING (is_published OR host_id = (SELECT auth.uid())
         OR (SELECT public.has_role((SELECT auth.uid()), 'admin'))
         OR (organizer = 'lsspm' AND (SELECT public.has_role((SELECT auth.uid()), 'league'))));

DROP POLICY IF EXISTS live_rec_read ON public.live_class_recordings;
CREATE POLICY live_rec_read ON public.live_class_recordings FOR SELECT TO authenticated
  USING (public.manages_live_class(class_id, (SELECT auth.uid()))
    OR (is_published AND status = 'stored' AND (
          EXISTS (SELECT 1 FROM public.live_class_registrations r
                   WHERE r.class_id = live_class_recordings.class_id AND r.user_id = (SELECT auth.uid())
                     AND public.webinar_confirmed(r.payment_status, r.cancelled_at))
       OR (public.recording_in_published_series(id) AND public.has_all_access((SELECT auth.uid())))
       OR EXISTS (SELECT 1 FROM public.live_classes c
                   WHERE c.id = live_class_recordings.class_id AND c.organizer = 'lsspm'
                     AND c.access IN ('open', 'members')
                     AND public.is_league_member((SELECT auth.uid()))))));

-- The roster now shows the role and the payment of each seat.
DROP FUNCTION IF EXISTS public.live_class_roster(uuid);
CREATE OR REPLACE FUNCTION public.live_class_roster(_class uuid)
RETURNS TABLE (registration_id uuid, user_id uuid, full_name text, email text, registered_at timestamptz,
               cancelled_at timestamptz, recording_consent_at timestamptz,
               minutes_attended integer, first_joined_at timestamptz, role text,
               amount_mad numeric, payment_status text, payer_reference text, receipt_number text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.manages_live_class(_class, auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY
  SELECT r.id, r.user_id, p.full_name, u.email::text, r.registered_at, r.cancelled_at,
         r.recording_consent_at, public.live_class_minutes(_class, r.user_id),
         (SELECT min(a.joined_at) FROM public.live_class_attendance a
          WHERE a.class_id = _class AND a.user_id = r.user_id),
         r.role, r.amount_mad, r.payment_status, r.payer_reference, r.receipt_number
  FROM public.live_class_registrations r
  JOIN auth.users u ON u.id = r.user_id
  LEFT JOIN public.profiles p ON p.id = r.user_id
  WHERE r.class_id = _class
  ORDER BY r.registered_at;
END $$;

-- An admin adds a speaker (an existing account, by email): moderator in the
-- room, certificate and participation like attendees.
CREATE OR REPLACE FUNCTION public.add_live_class_speaker(_class uuid, _email text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT id INTO _uid FROM auth.users WHERE lower(email) = lower(btrim(_email));
  IF _uid IS NULL THEN RAISE EXCEPTION 'no account with this email'; END IF;
  INSERT INTO public.live_class_registrations (class_id, user_id, role, recording_consent_at)
  VALUES (_class, _uid, 'speaker', now())
  ON CONFLICT (class_id, user_id) DO UPDATE
    SET role = 'speaker', cancelled_at = NULL, payment_status = 'none', amount_mad = 0,
        recording_consent_at = coalesce(public.live_class_registrations.recording_consent_at, now());
  RETURN _uid;
END $$;

REVOKE ALL ON FUNCTION
  public.register_live_class(uuid, boolean), public.webinar_payment_info(uuid),
  public.submit_webinar_payment(uuid, text), public.verify_webinar_payment(uuid, boolean, text),
  public.close_live_class(uuid), public.webinar_tick(), public.league_training_report(date, date),
  public.live_class_roster(uuid), public.add_live_class_speaker(uuid, text),
  public.live_class_minutes(uuid, uuid), public.webinar_registration_notify(),
  public.webinar_replay_notify()
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION
  public.register_live_class(uuid, boolean), public.webinar_payment_info(uuid),
  public.submit_webinar_payment(uuid, text), public.verify_webinar_payment(uuid, boolean, text),
  public.close_live_class(uuid), public.league_training_report(date, date),
  public.live_class_roster(uuid), public.add_live_class_speaker(uuid, text)
TO authenticated;
REVOKE EXECUTE ON FUNCTION public.webinar_tick(), public.live_class_minutes(uuid, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.webinar_tick(), public.close_live_class(uuid) TO service_role;

-- Every 10 minutes: reminders and closing finished webinars.
DO $$
BEGIN
  IF to_regnamespace('cron') IS NULL THEN RETURN; END IF;
  PERFORM cron.schedule('webinar-tick', '*/10 * * * *', 'SELECT public.webinar_tick();');
END $$;
