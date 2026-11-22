-- LSSPM engagement: commitments, divisions, personal project, participation.
--
-- Commitments. A member reads and accepts the règlement intérieur, the
--   honour declaration and the ethics charter (typed name, timestamp), then
--   uploads the legalised signed copy of the règlement acknowledgement and of
--   the honour declaration; the League verifies it.
-- Divisions. The four working pôles of Art. 32, editable by the League; a
--   member chooses one or more and writes their personal project within the
--   League (what they bring, what they want to do).
-- Participation. Members log their contributions (meetings, trainings given,
--   events, publications, supervision, committee work, outreach); the
--   supervision and training divisions (League reviewers or division leads)
--   validate them with points and rate each member each semester. The
--   scoreboard ranks active members by points + ratings; members with no
--   validated contribution for 180 days are listed, and the League can open
--   the disciplinary procedure of Art. 15-16 (written notice, 15 days for
--   the defence, reasoned decision notified, exclusion only for serious
--   breaches). Nothing is automatic: every step is a League decision.

CREATE TABLE IF NOT EXISTS public.league_divisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9_-]{2,40}$'),
  label_fr text NOT NULL,
  label_en text,
  label_ar text,
  description_fr text,
  -- The divisions whose leads evaluate members (supervision, training).
  evaluates boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0
);
INSERT INTO public.league_divisions (code, label_fr, label_en, label_ar, description_fr, evaluates, position) VALUES
  ('formation', 'Pôle formation et activités', 'Training and activities', 'قطب التكوين والأنشطة',
   'Formations, ateliers, journées scientifiques et activités de la Ligue.', true, 1),
  ('supervision', 'Pôle supervision et pratique clinique', 'Supervision and clinical practice', 'قطب الإشراف والممارسة الإكلينيكية',
   'Supervision des pairs, intervision, qualité et éthique de la pratique.', true, 2),
  ('recherche', 'Pôle recherche et publications', 'Research and publications', 'قطب البحث والمنشورات',
   'Études, recherches, publications et livrets de la Ligue.', false, 3),
  ('communication', 'Pôle communication, partenariats et événements', 'Communication, partnerships and events', 'قطب التواصل والشراكات والتظاهرات',
   'Campagnes, partenariats, presse, congrès et événements.', false, 4)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.league_division_leads (
  division_id uuid NOT NULL REFERENCES public.league_divisions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (division_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.league_member_profiles (
  user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  division_ids uuid[] NOT NULL DEFAULT '{}',
  project text CHECK (project IS NULL OR length(project) <= 4000),
  contribution_offer text CHECK (contribution_offer IS NULL OR length(contribution_offer) <= 2000),
  hours_per_month integer CHECK (hours_per_month IS NULL OR hours_per_month BETWEEN 0 AND 200),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.league_commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc text NOT NULL CHECK (doc IN ('reglement', 'honour', 'ethics')),
  version text NOT NULL,
  signer_name text NOT NULL CHECK (length(signer_name) BETWEEN 3 AND 160),
  accepted_at timestamptz NOT NULL DEFAULT now(),
  legalized_path text,
  status text NOT NULL DEFAULT 'accepted'
    CHECK (status IN ('accepted', 'legalized_submitted', 'verified', 'rejected')),
  review_note text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  UNIQUE (user_id, doc, version)
);

CREATE TABLE IF NOT EXISTS public.league_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  division_id uuid REFERENCES public.league_divisions(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('meeting', 'training', 'event', 'publication', 'supervision',
                                     'committee', 'outreach', 'other')),
  title text NOT NULL CHECK (length(title) BETWEEN 3 AND 200),
  details text CHECK (details IS NULL OR length(details) <= 2000),
  happened_on date NOT NULL,
  evidence_url text CHECK (evidence_url IS NULL OR evidence_url ~ '^https?://'),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'validated', 'rejected')),
  points integer CHECK (points IS NULL OR points BETWEEN 0 AND 30),
  review_note text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (happened_on <= current_date + 1)
);
CREATE INDEX IF NOT EXISTS league_contributions_user_idx ON public.league_contributions (user_id, happened_on);
CREATE INDEX IF NOT EXISTS league_contributions_queue_idx ON public.league_contributions (status) WHERE status = 'submitted';

CREATE TABLE IF NOT EXISTS public.league_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluator_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  division_id uuid REFERENCES public.league_divisions(id) ON DELETE SET NULL,
  period text NOT NULL CHECK (period ~ '^[0-9]{4}-S[12]$'),
  engagement smallint NOT NULL CHECK (engagement BETWEEN 1 AND 5),
  quality smallint NOT NULL CHECK (quality BETWEEN 1 AND 5),
  collaboration smallint NOT NULL CHECK (collaboration BETWEEN 1 AND 5),
  reliability smallint NOT NULL CHECK (reliability BETWEEN 1 AND 5),
  comment text CHECK (comment IS NULL OR length(comment) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, evaluator_id, period)
);

-- Disciplinary steps of Art. 15, recorded with the Art. 16 safeguards.
CREATE TABLE IF NOT EXISTS public.league_discipline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level text NOT NULL CHECK (level IN ('avertissement', 'blame', 'reprimande', 'suspension',
                                       'revocation_fonction', 'exclusion')),
  facts text NOT NULL CHECK (length(facts) BETWEEN 10 AND 4000),
  opened_by uuid NOT NULL REFERENCES auth.users(id),
  opened_at timestamptz NOT NULL DEFAULT now(),
  defence_due date NOT NULL,
  defence text CHECK (defence IS NULL OR length(defence) <= 6000),
  defence_at timestamptz,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'decided', 'withdrawn')),
  decision text CHECK (decision IS NULL OR length(decision) <= 4000),
  decided_at timestamptz,
  decided_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.league_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_division_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_discipline ENABLE ROW LEVEL SECURITY;

-- A League reviewer, or a lead of a division that evaluates members.
CREATE OR REPLACE FUNCTION public.is_league_evaluator(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_league_reviewer(_uid) OR EXISTS (
    SELECT 1 FROM public.league_division_leads l JOIN public.league_divisions d ON d.id = l.division_id
    WHERE l.user_id = _uid AND d.evaluates AND d.is_active);
$$;
REVOKE ALL ON FUNCTION public.is_league_evaluator(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_league_evaluator(uuid) TO authenticated;

-- Divisions: public list (plain policy, no function call, so visitors read it).
DROP POLICY IF EXISTS league_divisions_read ON public.league_divisions;
CREATE POLICY league_divisions_read ON public.league_divisions FOR SELECT USING (is_active);
DROP POLICY IF EXISTS league_divisions_manage ON public.league_divisions;
CREATE POLICY league_divisions_manage ON public.league_divisions FOR ALL TO authenticated
  USING (public.is_league_reviewer(auth.uid())) WITH CHECK (public.is_league_reviewer(auth.uid()));
DROP POLICY IF EXISTS league_division_leads_read ON public.league_division_leads;
CREATE POLICY league_division_leads_read ON public.league_division_leads FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_league_reviewer(auth.uid()));
DROP POLICY IF EXISTS league_division_leads_manage ON public.league_division_leads;
CREATE POLICY league_division_leads_manage ON public.league_division_leads FOR ALL TO authenticated
  USING (public.is_league_reviewer(auth.uid())) WITH CHECK (public.is_league_reviewer(auth.uid()));

DROP POLICY IF EXISTS league_member_profiles_own ON public.league_member_profiles;
CREATE POLICY league_member_profiles_own ON public.league_member_profiles FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS league_member_profiles_league ON public.league_member_profiles;
CREATE POLICY league_member_profiles_league ON public.league_member_profiles FOR SELECT TO authenticated
  USING (public.is_league_evaluator(auth.uid()));

DROP POLICY IF EXISTS league_commitments_read ON public.league_commitments;
CREATE POLICY league_commitments_read ON public.league_commitments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_league_reviewer(auth.uid()));

DROP POLICY IF EXISTS league_contributions_read ON public.league_contributions;
CREATE POLICY league_contributions_read ON public.league_contributions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_league_evaluator(auth.uid()));
-- Members log and edit their own while not reviewed.
DROP POLICY IF EXISTS league_contributions_insert ON public.league_contributions;
CREATE POLICY league_contributions_insert ON public.league_contributions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'submitted' AND points IS NULL AND reviewed_by IS NULL);
DROP POLICY IF EXISTS league_contributions_delete ON public.league_contributions;
CREATE POLICY league_contributions_delete ON public.league_contributions FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND status = 'submitted');

DROP POLICY IF EXISTS league_evaluations_read ON public.league_evaluations;
CREATE POLICY league_evaluations_read ON public.league_evaluations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_league_evaluator(auth.uid()));
DROP POLICY IF EXISTS league_evaluations_write ON public.league_evaluations;
CREATE POLICY league_evaluations_write ON public.league_evaluations FOR INSERT TO authenticated
  WITH CHECK (evaluator_id = auth.uid() AND user_id <> auth.uid() AND public.is_league_evaluator(auth.uid()));

DROP POLICY IF EXISTS league_discipline_read ON public.league_discipline;
CREATE POLICY league_discipline_read ON public.league_discipline FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_league_reviewer(auth.uid()));

GRANT SELECT ON public.league_divisions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.league_divisions, public.league_division_leads,
  public.league_member_profiles TO authenticated;
GRANT SELECT ON public.league_commitments, public.league_discipline TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.league_contributions TO authenticated;
GRANT SELECT, INSERT ON public.league_evaluations TO authenticated;

-- Accept a document (typed name = signature); re-accepting a new version
-- adds a row.
CREATE OR REPLACE FUNCTION public.league_accept(_doc text, _version text, _signer_name text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  INSERT INTO public.league_commitments (user_id, doc, version, signer_name)
  VALUES (auth.uid(), _doc, _version, trim(_signer_name))
  ON CONFLICT (user_id, doc, version) DO UPDATE SET signer_name = EXCLUDED.signer_name
  RETURNING id INTO _id;
  RETURN _id;
END $$;

-- Upload the legalised signed copy.
CREATE OR REPLACE FUNCTION public.league_submit_legalized(_commitment uuid, _path text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _path IS NULL OR _path NOT LIKE auth.uid()::text || '/%' THEN RAISE EXCEPTION 'file required'; END IF;
  UPDATE public.league_commitments SET legalized_path = _path, status = 'legalized_submitted', review_note = NULL
  WHERE id = _commitment AND user_id = auth.uid() AND doc IN ('reglement', 'honour')
    AND status IN ('accepted', 'rejected');
  IF NOT FOUND THEN RAISE EXCEPTION 'not allowed'; END IF;
  PERFORM public.notify_league_staff('Document légalisé à vérifier',
    'Un membre a envoyé un document signé et légalisé. Vérifiez-le dans le portail de la Ligue.', '/league');
END $$;

CREATE OR REPLACE FUNCTION public.league_review_commitment(_commitment uuid, _ok boolean, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.league_commitments;
BEGIN
  IF NOT public.is_league_reviewer(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.league_commitments SET status = CASE WHEN _ok THEN 'verified' ELSE 'rejected' END,
    review_note = nullif(trim(_note), ''), reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = _commitment AND status = 'legalized_submitted' RETURNING * INTO c;
  IF NOT FOUND THEN RAISE EXCEPTION 'not reviewable'; END IF;
  PERFORM public.notify_user(c.user_id, 'league',
    CASE WHEN _ok THEN 'Document légalisé validé' ELSE 'Document légalisé non validé' END,
    CASE WHEN _ok THEN 'La Ligue a validé votre document signé et légalisé.'
         ELSE 'La Ligue n''a pas validé votre document.' || coalesce(E'\n\nMotif : ' || c.review_note, '') ||
              E'\n\nVous pouvez envoyer une nouvelle copie depuis votre tableau de bord.' END,
    '/dashboard');
END $$;

-- Default points by kind; the reviewer may adjust (0-30).
CREATE OR REPLACE FUNCTION public.league_default_points(_kind text) RETURNS integer
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE _kind WHEN 'training' THEN 10 WHEN 'publication' THEN 10 WHEN 'event' THEN 8
    WHEN 'supervision' THEN 6 WHEN 'committee' THEN 5 WHEN 'outreach' THEN 4
    WHEN 'meeting' THEN 2 ELSE 2 END;
$$;

CREATE OR REPLACE FUNCTION public.league_review_contribution(
  _contribution uuid, _ok boolean, _points integer, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.league_contributions;
BEGIN
  IF NOT public.is_league_evaluator(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO c FROM public.league_contributions WHERE id = _contribution FOR UPDATE;
  IF NOT FOUND OR c.status <> 'submitted' THEN RAISE EXCEPTION 'not reviewable'; END IF;
  IF c.user_id = auth.uid() THEN RAISE EXCEPTION 'cannot review own contribution'; END IF;
  UPDATE public.league_contributions SET
    status = CASE WHEN _ok THEN 'validated' ELSE 'rejected' END,
    points = CASE WHEN _ok THEN least(30, greatest(0, coalesce(_points, public.league_default_points(c.kind)))) END,
    review_note = nullif(trim(_note), ''), reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = _contribution;
END $$;

-- Scoreboard of active members for a year: validated points + 5 × the
-- average of their ratings (each rating is the mean of the four criteria).
CREATE OR REPLACE FUNCTION public.league_scoreboard(_year integer)
RETURNS TABLE (user_id uuid, full_name text, member_number text, divisions text[],
               points integer, contributions integer, rating numeric, score numeric,
               last_activity date, open_procedures integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_league_evaluator(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  WITH members AS (
    SELECT DISTINCT ON (m.user_id) m.user_id, m.member_number
    FROM public.league_memberships m
    WHERE m.status = 'active' AND m.ends_on >= make_date(_year, 1, 1)
      AND m.starts_on <= make_date(_year, 12, 31)
    ORDER BY m.user_id, m.ends_on DESC),
  c AS (
    SELECT x.user_id, sum(x.points)::int AS pts, count(*)::int AS n, max(x.happened_on) AS last_on
    FROM public.league_contributions x
    WHERE x.status = 'validated' AND extract(year FROM x.happened_on) = _year GROUP BY x.user_id),
  e AS (
    SELECT y.user_id, avg((y.engagement + y.quality + y.collaboration + y.reliability) / 4.0) AS r
    FROM public.league_evaluations y WHERE y.period LIKE _year || '-%' GROUP BY y.user_id),
  d AS (
    SELECT z.user_id, count(*)::int AS n FROM public.league_discipline z
    WHERE z.status = 'open' GROUP BY z.user_id)
  SELECT mb.user_id, pr.full_name, mb.member_number,
         ARRAY(SELECT dv.label_fr FROM public.league_divisions dv
               WHERE dv.id = ANY (coalesce(lp.division_ids, '{}'))),
         coalesce(c.pts, 0), coalesce(c.n, 0), round(e.r, 2),
         round(coalesce(c.pts, 0) + 5 * coalesce(e.r, 0), 1), c.last_on, coalesce(d.n, 0)
  FROM members mb
  LEFT JOIN public.profiles pr ON pr.id = mb.user_id
  LEFT JOIN public.league_member_profiles lp ON lp.user_id = mb.user_id
  LEFT JOIN c ON c.user_id = mb.user_id
  LEFT JOIN e ON e.user_id = mb.user_id
  LEFT JOIN d ON d.user_id = mb.user_id
  ORDER BY 8 DESC, 1;
END $$;

-- The member's own standing: score and rank among active members.
CREATE OR REPLACE FUNCTION public.league_my_standing()
RETURNS TABLE (points integer, contributions integer, rating numeric, score numeric,
               rank integer, members integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH y AS (SELECT extract(year FROM current_date)::int AS y),
  c AS (SELECT x.user_id, sum(x.points)::int AS pts, count(*)::int AS n FROM public.league_contributions x, y
        WHERE x.status = 'validated' AND extract(year FROM x.happened_on) = y.y GROUP BY x.user_id),
  e AS (SELECT z.user_id, avg((z.engagement + z.quality + z.collaboration + z.reliability) / 4.0) AS r
        FROM public.league_evaluations z, y WHERE z.period LIKE y.y || '-%' GROUP BY z.user_id),
  s AS (SELECT DISTINCT m.user_id, coalesce(c.pts, 0) AS pts, coalesce(c.n, 0) AS n, e.r,
               coalesce(c.pts, 0) + 5 * coalesce(e.r, 0) AS score
        FROM public.league_memberships m LEFT JOIN c ON c.user_id = m.user_id
        LEFT JOIN e ON e.user_id = m.user_id
        WHERE m.status = 'active' AND m.ends_on >= current_date),
  r AS (SELECT s.*, rank() OVER (ORDER BY s.score DESC)::int AS rk, count(*) OVER ()::int AS total FROM s)
  SELECT r.pts, r.n, round(r.r, 2), round(r.score, 1), r.rk, r.total FROM r WHERE r.user_id = auth.uid();
$$;

-- Active members with no validated contribution in the last 180 days.
CREATE OR REPLACE FUNCTION public.league_inactive_members()
RETURNS TABLE (user_id uuid, full_name text, email text, member_number text,
               last_activity date, member_since date, open_procedures integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_league_reviewer(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT m.user_id, pr.full_name, u.email::text, m.member_number,
         (SELECT max(x.happened_on) FROM public.league_contributions x
          WHERE x.user_id = m.user_id AND x.status = 'validated'),
         (SELECT min(m2.starts_on) FROM public.league_memberships m2
          WHERE m2.user_id = m.user_id AND m2.status = 'active'),
         (SELECT count(*)::int FROM public.league_discipline z WHERE z.user_id = m.user_id AND z.status = 'open')
  FROM public.league_memberships m
  JOIN auth.users u ON u.id = m.user_id
  LEFT JOIN public.profiles pr ON pr.id = m.user_id
  WHERE m.status = 'active' AND m.ends_on >= current_date
    -- New members get 180 days before being listed.
    AND m.starts_on <= current_date - 180
    AND NOT EXISTS (SELECT 1 FROM public.league_contributions x WHERE x.user_id = m.user_id
                    AND x.status = 'validated' AND x.happened_on > current_date - 180)
  ORDER BY 5 NULLS FIRST;
END $$;

-- Art. 16: written notice of the facts, at least 15 days for the defence.
CREATE OR REPLACE FUNCTION public.league_discipline_open(_user uuid, _level text, _facts text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; _due date := current_date + 15;
BEGIN
  IF NOT public.is_league_reviewer(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  INSERT INTO public.league_discipline (user_id, level, facts, opened_by, defence_due)
  VALUES (_user, _level, trim(_facts), auth.uid(), _due) RETURNING id INTO _id;
  PERFORM public.notify_user(_user, 'league', 'Procédure de la Ligue : présentez votre défense',
    'La Ligue vous notifie les faits suivants (règlement intérieur, art. 15 et 16) :' || E'\n\n' ||
    trim(_facts) || E'\n\n' ||
    'Vous disposez de quinze jours, jusqu''au ' || public.fr_date(_due) ||
    ', pour présenter votre défense par écrit depuis votre tableau de bord ou oralement devant le bureau exécutif, ' ||
    'en vous faisant assister si vous le souhaitez par un membre de la Ligue.', '/dashboard');
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.league_discipline_defend(_case uuid, _defence text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.league_discipline SET defence = trim(_defence), defence_at = now()
  WHERE id = _case AND user_id = auth.uid() AND status = 'open';
  IF NOT FOUND THEN RAISE EXCEPTION 'not allowed'; END IF;
  PERFORM public.notify_league_staff('Défense reçue dans une procédure',
    'Un membre a présenté sa défense. Consultez-la dans le portail de la Ligue.', '/league');
END $$;

-- The reasoned decision, notified to the member (Art. 16.5). Exclusion
-- ends the membership; it cannot be decided before the defence period ends.
CREATE OR REPLACE FUNCTION public.league_discipline_decide(_case uuid, _decision text, _withdraw boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.league_discipline;
BEGIN
  IF NOT public.is_league_reviewer(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO c FROM public.league_discipline WHERE id = _case FOR UPDATE;
  IF NOT FOUND OR c.status <> 'open' THEN RAISE EXCEPTION 'not open'; END IF;
  IF NOT _withdraw AND c.level <> 'avertissement' AND current_date < c.defence_due AND c.defence IS NULL THEN
    RAISE EXCEPTION 'defence period not over';
  END IF;
  UPDATE public.league_discipline SET status = CASE WHEN _withdraw THEN 'withdrawn' ELSE 'decided' END,
    decision = nullif(trim(_decision), ''), decided_at = now(), decided_by = auth.uid()
  WHERE id = _case;
  IF NOT _withdraw AND c.level = 'exclusion' THEN
    UPDATE public.league_memberships SET status = 'cancelled', review_note = 'Exclusion : ' || coalesce(_decision, '')
    WHERE user_id = c.user_id AND status IN ('active', 'pending');
  END IF;
  PERFORM public.notify_user(c.user_id, 'league',
    CASE WHEN _withdraw THEN 'Procédure de la Ligue close sans suite' ELSE 'Décision de la Ligue' END,
    coalesce(_decision, '') || CASE WHEN _withdraw THEN '' ELSE
      E'\n\nVous pouvez demander le réexamen de cette décision devant le conseil d''administration ou le bureau exécutif dans un délai de trente jours (art. 16.6).' END,
    '/dashboard');
END $$;

REVOKE ALL ON FUNCTION public.league_accept(text, text, text), public.league_submit_legalized(uuid, text),
  public.league_review_commitment(uuid, boolean, text), public.league_review_contribution(uuid, boolean, integer, text),
  public.league_scoreboard(integer), public.league_my_standing(), public.league_inactive_members(),
  public.league_discipline_open(uuid, text, text), public.league_discipline_defend(uuid, text),
  public.league_discipline_decide(uuid, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.league_accept(text, text, text), public.league_submit_legalized(uuid, text),
  public.league_review_commitment(uuid, boolean, text), public.league_review_contribution(uuid, boolean, integer, text),
  public.league_scoreboard(integer), public.league_my_standing(), public.league_inactive_members(),
  public.league_discipline_open(uuid, text, text), public.league_discipline_defend(uuid, text),
  public.league_discipline_decide(uuid, text, boolean) TO authenticated;
