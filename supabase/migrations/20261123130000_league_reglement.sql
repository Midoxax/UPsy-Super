-- LSSPM membership aligned with the League's internal rules (règlement
-- intérieur, approved 13 September 2026).
--
-- Art. 2  Categories, each with its card colour: founders (blue-green),
--         official members (blue-white), honorary members / experts
--         (blue-orange), supporters (blue-yellow).
-- Art. 5  The file includes a photo; students add their enrolment
--         certificate for the current academic year (Art. 8).
-- Art. 8  Fees: practitioners 900 MAD, PhD students 700, master students
--         500, executive bureau / board members 300, supporters (licence
--         students and others) 300; honorary members are exempt. The League
--         decided that student rates apply only under 30; a student aged 30
--         or more joins at the practitioner rate.
-- Art. 9  Dues cover the calendar year: a first membership is paid on
--         acceptance for the whole current year, and every payment gets an
--         official receipt recorded in the register.
--
-- Each confirmed membership also gets an attestation number and a
-- verification token: the digital card carries a QR code that opens a public
-- page confirming the card is genuine and still valid.

ALTER TABLE public.league_membership_plans
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'official'
    CHECK (category IN ('founder', 'official', 'honorary', 'supporter')),
  ADD COLUMN IF NOT EXISTS max_age integer CHECK (max_age IS NULL OR max_age BETWEEN 18 AND 99),
  ADD COLUMN IF NOT EXISTS requires_enrolment boolean NOT NULL DEFAULT false,
  -- false: granted by the League (honorary, bureau), not chosen by the member.
  ADD COLUMN IF NOT EXISTS self_service boolean NOT NULL DEFAULT true;

ALTER TABLE public.league_memberships
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS photo_path text,
  ADD COLUMN IF NOT EXISTS enrolment_path text,
  -- Overrides the plan's category for the card (e.g. a founder).
  ADD COLUMN IF NOT EXISTS category text
    CHECK (category IS NULL OR category IN ('founder', 'official', 'honorary', 'supporter')),
  ADD COLUMN IF NOT EXISTS attestation_number text UNIQUE,
  ADD COLUMN IF NOT EXISTS verify_token text UNIQUE;

-- The fee grid of Art. 8.
UPDATE public.league_membership_plans SET is_active = false WHERE code = 'etudiant';
INSERT INTO public.league_membership_plans
  (code, label_fr, label_en, label_ar, amount_mad, is_active, position, category, max_age,
   requires_enrolment, self_service, description_fr)
VALUES
  ('praticien', 'Membre adhérent — psychologue praticien(ne)', 'Member — practising psychologist',
   'منخرط رسمي — أخصائي ممارس', 900, true, 1, 'official', NULL, false, true,
   'Professionnels titulaires au moins d''un master en psychologie, psychiatrie ou santé mentale.'),
  ('doctorant', 'Étudiant(e) en doctorat (moins de 30 ans)', 'PhD student (under 30)',
   'طالب في سلك الدكتوراه (أقل من 30 سنة)', 700, true, 2, 'official', 29, true, true,
   'Attestation d''inscription de l''année universitaire en cours requise.'),
  ('master', 'Étudiant(e) en master (moins de 30 ans)', 'Master''s student (under 30)',
   'طالب في سلك الماستر (أقل من 30 سنة)', 500, true, 3, 'supporter', 29, true, true,
   'Attestation d''inscription de l''année universitaire en cours requise.'),
  ('sympathisant', 'Membre sympathisant (étudiant en licence et autres)', 'Supporter (bachelor''s students and others)',
   'عضو منتسب (طلبة الإجازة وغيرهم)', 300, true, 4, 'supporter', NULL, false, true,
   'Soutien à la Ligue, sans droit de vote ni d''éligibilité.'),
  ('bureau', 'Membre du bureau exécutif / conseil d''administration', 'Executive bureau / board member',
   'عضو المكتب التنفيذي أو مجلس الإدارة', 300, true, 5, 'official', NULL, false, false,
   'Attribué par la Ligue.'),
  ('honoraire', 'Membre honoraire / expert', 'Honorary member / expert',
   'عضو شرفي / خبير', 0, true, 6, 'honorary', NULL, false, false,
   'Attribué par le bureau exécutif ; cotisation facultative.')
ON CONFLICT (code) DO UPDATE SET
  label_fr = EXCLUDED.label_fr, label_en = EXCLUDED.label_en, label_ar = EXCLUDED.label_ar,
  amount_mad = EXCLUDED.amount_mad, is_active = EXCLUDED.is_active, position = EXCLUDED.position,
  category = EXCLUDED.category, max_age = EXCLUDED.max_age,
  requires_enrolment = EXCLUDED.requires_enrolment, self_service = EXCLUDED.self_service,
  description_fr = EXCLUDED.description_fr;

-- Join (or switch the pending request to another category). Students give
-- their birth date and enrolment certificate; everyone gives a photo.
DROP FUNCTION IF EXISTS public.league_join(uuid);
CREATE OR REPLACE FUNCTION public.league_join(
  _plan uuid, _birth_date date DEFAULT NULL, _photo_path text DEFAULT NULL,
  _enrolment_path text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _id uuid; p public.league_membership_plans;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  SELECT * INTO p FROM public.league_membership_plans WHERE id = _plan AND is_active AND self_service;
  IF NOT FOUND THEN RAISE EXCEPTION 'plan unavailable'; END IF;
  IF _photo_path IS NULL OR _photo_path NOT LIKE _uid::text || '/%' THEN
    RAISE EXCEPTION 'photo required';
  END IF;
  IF p.max_age IS NOT NULL THEN
    IF _birth_date IS NULL THEN RAISE EXCEPTION 'birth date required'; END IF;
    IF date_part('year', age(current_date, _birth_date)) > p.max_age THEN
      RAISE EXCEPTION 'age limit';
    END IF;
  END IF;
  IF p.requires_enrolment AND (_enrolment_path IS NULL OR _enrolment_path NOT LIKE _uid::text || '/%') THEN
    RAISE EXCEPTION 'enrolment certificate required';
  END IF;
  SELECT id INTO _id FROM public.league_memberships WHERE user_id = _uid AND status = 'pending';
  IF _id IS NOT NULL THEN
    UPDATE public.league_memberships SET plan_id = _plan, birth_date = coalesce(_birth_date, birth_date),
      photo_path = _photo_path, enrolment_path = _enrolment_path
    WHERE id = _id;
    RETURN _id;
  END IF;
  -- Renewal for next year opens on 1 November.
  IF EXISTS (SELECT 1 FROM public.league_memberships WHERE user_id = _uid AND status = 'active'
             AND ends_on > current_date + 61) THEN
    RAISE EXCEPTION 'already a member';
  END IF;
  INSERT INTO public.league_memberships (user_id, plan_id, birth_date, photo_path, enrolment_path)
  VALUES (_uid, _plan, _birth_date, _photo_path, _enrolment_path) RETURNING id INTO _id;
  RETURN _id;
END $$;

-- Confirms a membership for the calendar year (Art. 9): a first membership
-- runs to 31 December of this year; a renewal paid before its end covers
-- the next calendar year.
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
    ends_on = make_date(extract(year FROM _start)::int, 12, 31),
    commission_free_until = CASE WHEN _first THEN (current_date + interval '3 months')::date END,
    confirmed_by = _by,
    confirmed_at = now()
  WHERE id = _membership;
  -- The previous record no longer carries the token (unique), the new one does.
  IF _prev.id IS NOT NULL AND _prev.id <> _membership THEN
    UPDATE public.league_memberships SET verify_token = NULL WHERE id = _prev.id;
  END IF;
END $$;

-- The League grants an honorary membership or a bureau/board seat: no
-- payment is required (honorary dues are optional, Art. 8.6).
CREATE OR REPLACE FUNCTION public.league_grant(_email text, _plan_code text, _category text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _plan uuid; _id uuid; _user uuid;
BEGIN
  IF NOT public.is_league_reviewer(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT id INTO _user FROM auth.users WHERE lower(email) = lower(trim(_email));
  IF _user IS NULL THEN RAISE EXCEPTION 'no account with this email'; END IF;
  SELECT id INTO _plan FROM public.league_membership_plans WHERE code = _plan_code AND NOT self_service;
  IF _plan IS NULL THEN RAISE EXCEPTION 'not a granted category'; END IF;
  SELECT id INTO _id FROM public.league_memberships WHERE user_id = _user AND status = 'pending';
  IF _id IS NULL THEN
    INSERT INTO public.league_memberships (user_id, plan_id, category)
    VALUES (_user, _plan, _category) RETURNING id INTO _id;
  ELSE
    UPDATE public.league_memberships SET plan_id = _plan, category = _category WHERE id = _id;
  END IF;
  IF _plan_code = 'honoraire' THEN
    PERFORM public.league_activate(_id, auth.uid());
  END IF;
  RETURN _id;
END $$;

-- The League marks a member as founder (card colour) or clears it.
CREATE OR REPLACE FUNCTION public.league_set_category(_membership uuid, _category text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_league_reviewer(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.league_memberships SET category = _category WHERE id = _membership;
END $$;

-- Public check behind the card's QR code: who holds this card and whether it
-- is valid today. No contact details, no photo.
CREATE OR REPLACE FUNCTION public.league_verify(_token text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'full_name', coalesce(pr.full_name, ''),
    'member_number', m.member_number,
    'category', coalesce(m.category, pl.category),
    'plan_fr', pl.label_fr, 'plan_en', pl.label_en, 'plan_ar', pl.label_ar,
    'valid_until', m.ends_on,
    'valid', m.status = 'active' AND m.ends_on >= current_date)
  FROM public.league_memberships m
  JOIN public.league_membership_plans pl ON pl.id = m.plan_id
  LEFT JOIN public.profiles pr ON pr.id = m.user_id
  WHERE m.verify_token = _token AND length(_token) >= 32;
$$;

-- The desk now shows the file: photo, birth date, enrolment certificate.
DROP FUNCTION IF EXISTS public.league_membership_desk();
CREATE OR REPLACE FUNCTION public.league_membership_desk()
RETURNS TABLE (membership_id uuid, user_id uuid, full_name text, email text, plan_label text,
               plan_amount numeric, plan_code text, category text, status text, member_number text,
               starts_on date, ends_on date, attestation_number text, birth_date date,
               photo_path text, enrolment_path text, verify_token text, created_at timestamptz,
               confirmed_at timestamptz, payment_id uuid, payment_status text, payment_method text,
               payment_amount numeric, payer_reference text, proof_path text, receipt_number text,
               paid_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_league_reviewer(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT m.id, m.user_id, p.full_name, u.email::text, pl.label_fr, pl.amount_mad, pl.code,
         coalesce(m.category, pl.category), m.status, m.member_number, m.starts_on, m.ends_on,
         m.attestation_number, m.birth_date, m.photo_path, m.enrolment_path, m.verify_token,
         m.created_at, m.confirmed_at,
         lp.id, lp.status, lp.method, lp.amount_mad, lp.payer_reference, lp.proof_path,
         lp.receipt_number, lp.created_at
  FROM public.league_memberships m
  JOIN auth.users u ON u.id = m.user_id
  LEFT JOIN public.profiles p ON p.id = m.user_id
  JOIN public.league_membership_plans pl ON pl.id = m.plan_id
  LEFT JOIN LATERAL (SELECT * FROM public.league_payments x WHERE x.membership_id = m.id
                     ORDER BY x.created_at DESC LIMIT 1) lp ON true
  ORDER BY (lp.status = 'submitted') DESC NULLS LAST, m.created_at DESC;
END $$;

-- Notices: the confirmation carries the receipt and attestation numbers and
-- the League is told of every new member; a verified payment that does not
-- activate a membership gets its own receipt notice.
CREATE OR REPLACE FUNCTION public.league_membership_notify() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _receipt text; _name text;
BEGIN
  IF NEW.status = 'active' AND OLD.status IS DISTINCT FROM 'active' THEN
    SELECT receipt_number INTO _receipt FROM public.league_payments
    WHERE membership_id = NEW.id AND status = 'verified' ORDER BY verified_at DESC LIMIT 1;
    PERFORM public.notify_user(NEW.user_id, 'league',
      'Votre adhésion à la LSSPM est confirmée',
      'Bienvenue dans la Ligue des Spécialistes de la Santé Psychique et Mentale.' || E'\n\n' ||
      'Numéro de membre : ' || coalesce(NEW.member_number, '—') || E'\n' ||
      'Valable jusqu''au ' || public.fr_date(NEW.ends_on) || '.' || E'\n' ||
      coalesce('Reçu de paiement : ' || _receipt || E'\n', '') ||
      'Attestation d''adhésion : ' || coalesce(NEW.attestation_number, '—') || E'\n\n' ||
      'Votre carte de membre numérique, votre attestation et votre reçu sont téléchargeables depuis votre tableau de bord.',
      '/dashboard');
    SELECT full_name INTO _name FROM public.profiles WHERE id = NEW.user_id;
    PERFORM public.notify_league_staff('Nouvelle adhésion confirmée : ' || coalesce(_name, NEW.member_number),
      'Membre n° ' || coalesce(NEW.member_number, '—') || ', attestation ' ||
      coalesce(NEW.attestation_number, '—') || '. L''attestation est téléchargeable dans le portail.',
      '/league');
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.league_payment_notify() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'submitted' THEN
    PERFORM public.notify_league_staff('Un paiement de cotisation est à vérifier',
      'Un reçu de ' || NEW.amount_mad || ' MAD a été envoyé. Vérifiez-le dans le portail de la Ligue.',
      '/league');
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'rejected' AND OLD.status = 'submitted' THEN
    PERFORM public.notify_user(NEW.user_id, 'league',
      'Votre paiement de cotisation n''a pas été validé',
      coalesce('Motif : ' || NEW.review_note || E'\n\n', '') ||
      'Vous pouvez envoyer un nouveau reçu depuis votre tableau de bord.',
      '/dashboard');
  ELSIF NEW.status = 'verified' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'verified')
        AND NEW.nature <> 'cotisation' THEN
    PERFORM public.notify_user(NEW.user_id, 'league',
      'Reçu de paiement ' || NEW.receipt_number,
      'Votre paiement de ' || NEW.amount_mad || ' MAD a été reçu par la Ligue.' || E'\n\n' ||
      'Le reçu est téléchargeable depuis votre tableau de bord.', '/dashboard');
  END IF;
  RETURN NEW;
END $$;

REVOKE ALL ON FUNCTION public.league_join(uuid, date, text, text),
  public.league_grant(text, text, text), public.league_set_category(uuid, text),
  public.league_membership_desk() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.league_join(uuid, date, text, text),
  public.league_grant(text, text, text), public.league_set_category(uuid, text),
  public.league_membership_desk() TO authenticated;
REVOKE ALL ON FUNCTION public.league_verify(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.league_verify(text) TO anon, authenticated;

-- Photos and enrolment certificates: the member's own folder; the League reads.
INSERT INTO storage.buckets (id, name, public) VALUES ('league-files', 'league-files', false)
ON CONFLICT (id) DO UPDATE SET public = false;
DROP POLICY IF EXISTS "Members upload own league files" ON storage.objects;
CREATE POLICY "Members upload own league files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'league-files' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Members and League read league files" ON storage.objects;
CREATE POLICY "Members and League read league files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'league-files'
         AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_league_reviewer(auth.uid())));
