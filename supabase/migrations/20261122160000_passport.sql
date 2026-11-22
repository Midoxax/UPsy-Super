-- Psychologist passport: a professional record where each item is checked.
--
-- The psychologist records degrees, continuing education, clinical
-- experience, conferences, publications, research, teaching, awards and
-- affiliations, each with a proof document, and submits them to the League.
-- A League reviewer validates or rejects each item against its proof.
-- Aspirations are declared, not validated. Changing a validated item sends
-- it back for validation, so "validated" always means what is shown.
--
-- Sharing (Law 09-08): nothing is public by default. The psychologist
-- creates share links (revocable, optional expiry) for references or
-- recruitment; a link shows only validated items marked shareable, plus
-- facts U.Psy already holds (accreditation, League membership, earned
-- training certificates). The League sees only what was submitted to it.

CREATE TABLE IF NOT EXISTS public.passport_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('degree', 'training', 'experience', 'conference',
    'publication', 'research', 'teaching', 'award', 'affiliation', 'aspiration')),
  title text NOT NULL CHECK (length(title) BETWEEN 2 AND 300),
  organization text CHECK (organization IS NULL OR length(organization) <= 200),
  role text CHECK (role IS NULL OR length(role) <= 120),
  location text CHECK (location IS NULL OR length(location) <= 120),
  start_date date,
  end_date date,
  description text CHECK (description IS NULL OR length(description) <= 3000),
  url text CHECK (url IS NULL OR url ~ '^https?://'),
  doi text CHECK (doi IS NULL OR length(doi) <= 200),
  proof_path text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'validated', 'rejected', 'declared')),
  shareable boolean NOT NULL DEFAULT true,
  validated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);
CREATE INDEX IF NOT EXISTS passport_entries_user_idx ON public.passport_entries (user_id, kind);
CREATE INDEX IF NOT EXISTS passport_entries_queue_idx ON public.passport_entries (status, updated_at)
  WHERE status = 'submitted';

CREATE TABLE IF NOT EXISTS public.passport_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE
    DEFAULT replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  label text CHECK (label IS NULL OR length(label) <= 120),
  expires_at timestamptz,
  revoked_at timestamptz,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.passport_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passport_shares ENABLE ROW LEVEL SECURITY;

-- Entries: the owner manages their own; the League reads what was submitted
-- to it (never drafts or aspirations).
DROP POLICY IF EXISTS passport_entries_owner ON public.passport_entries;
CREATE POLICY passport_entries_owner ON public.passport_entries FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS passport_entries_league ON public.passport_entries;
CREATE POLICY passport_entries_league ON public.passport_entries FOR SELECT TO authenticated
  USING (status IN ('submitted', 'validated', 'rejected') AND public.is_league_reviewer(auth.uid()));

DROP POLICY IF EXISTS passport_shares_owner ON public.passport_shares;
CREATE POLICY passport_shares_owner ON public.passport_shares FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.passport_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.passport_shares TO authenticated;

-- The owner cannot set validation fields; editing content of a submitted or
-- validated entry returns it to draft. Aspirations are always "declared".
CREATE OR REPLACE FUNCTION public.passport_entry_guard() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_setting('upsy.passport_review', true) = 'on'
     AND public.is_league_reviewer(auth.uid()) THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.status := CASE WHEN NEW.kind = 'aspiration' THEN 'declared'
                       WHEN NEW.status = 'submitted' THEN 'submitted' ELSE 'draft' END;
    NEW.validated_by := NULL; NEW.validated_at := NULL; NEW.review_note := NULL;
    RETURN NEW;
  END IF;
  -- Validation fields belong to the reviewer.
  NEW.validated_by := OLD.validated_by;
  NEW.validated_at := OLD.validated_at;
  NEW.review_note := OLD.review_note;
  IF NEW.kind = 'aspiration' THEN
    NEW.status := 'declared';
  ELSIF (NEW.kind, NEW.title, NEW.organization, NEW.role, NEW.location, NEW.start_date,
         NEW.end_date, NEW.description, NEW.url, NEW.doi, NEW.proof_path)
        IS DISTINCT FROM
        (OLD.kind, OLD.title, OLD.organization, OLD.role, OLD.location, OLD.start_date,
         OLD.end_date, OLD.description, OLD.url, OLD.doi, OLD.proof_path) THEN
    -- Content changed: it must be checked again.
    NEW.status := CASE WHEN NEW.status = 'submitted' THEN 'submitted' ELSE 'draft' END;
    NEW.validated_by := NULL; NEW.validated_at := NULL;
  ELSIF NEW.status NOT IN ('draft', 'submitted') OR
        (NEW.status <> OLD.status AND OLD.status = 'validated') THEN
    -- Only draft <-> submitted is the owner's to change.
    NEW.status := OLD.status;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS passport_entry_guard ON public.passport_entries;
CREATE TRIGGER passport_entry_guard BEFORE INSERT OR UPDATE ON public.passport_entries
  FOR EACH ROW EXECUTE FUNCTION public.passport_entry_guard();

-- The League validates or rejects a submitted entry.
CREATE OR REPLACE FUNCTION public.passport_review(_entry uuid, _approve boolean, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT public.is_league_reviewer(_uid) THEN RAISE EXCEPTION 'forbidden'; END IF;
  PERFORM set_config('upsy.passport_review', 'on', true);
  UPDATE public.passport_entries SET
    status = CASE WHEN _approve THEN 'validated' ELSE 'rejected' END,
    validated_by = _uid, validated_at = now(), review_note = nullif(trim(_note), '')
  WHERE id = _entry AND status = 'submitted';
  IF NOT FOUND THEN RAISE EXCEPTION 'not reviewable'; END IF;
  PERFORM set_config('upsy.passport_review', 'off', true);
END $$;

-- The League's queue: submitted entries with the psychologist's name.
CREATE OR REPLACE FUNCTION public.passport_review_queue()
RETURNS TABLE (id uuid, user_id uuid, full_name text, kind text, title text, organization text,
               role text, start_date date, end_date date, description text, url text, doi text,
               proof_path text, submitted_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_league_reviewer(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT e.id, e.user_id, p.full_name, e.kind, e.title, e.organization, e.role, e.start_date,
         e.end_date, e.description, e.url, e.doi, e.proof_path, e.updated_at
  FROM public.passport_entries e LEFT JOIN public.profiles p ON p.id = e.user_id
  WHERE e.status = 'submitted' ORDER BY e.updated_at;
END $$;

-- The public view behind a share link: validated, shareable entries and the
-- facts U.Psy holds. Counts the view. Null when the link is unknown,
-- revoked or expired.
CREATE OR REPLACE FUNCTION public.passport_public(_token text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.passport_shares; _out jsonb;
BEGIN
  SELECT * INTO s FROM public.passport_shares
  WHERE token = _token AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > now());
  IF NOT FOUND THEN RETURN NULL; END IF;
  UPDATE public.passport_shares SET views = views + 1 WHERE id = s.id;

  SELECT jsonb_build_object(
    'full_name', p.full_name,
    'avatar_url', p.avatar_url,
    'issued_at', now(),
    'upsy_accredited', EXISTS (SELECT 1 FROM public.psychologist_applications a
                               WHERE a.user_id = s.user_id AND a.status = 'approved'),
    'league', (SELECT jsonb_build_object('member_number', m.member_number, 'since', m.starts_on,
                                         'until', m.ends_on)
               FROM public.league_memberships m
               WHERE m.user_id = s.user_id AND m.status = 'active' AND m.ends_on >= current_date
               ORDER BY m.ends_on DESC LIMIT 1),
    'certificates', coalesce((SELECT jsonb_agg(jsonb_build_object(
                       'title', c.title, 'number', c.certificate_number, 'issued_at', c.issued_at,
                       'cpd_hours', c.metadata->'cpd_hours') ORDER BY c.issued_at DESC)
                     FROM public.certificates c
                     WHERE c.user_id = s.user_id AND c.certificate_type IN ('mooc_training', 'course_completion')), '[]'),
    'entries', coalesce((SELECT jsonb_agg(jsonb_build_object(
                  'kind', e.kind, 'title', e.title, 'organization', e.organization, 'role', e.role,
                  'location', e.location, 'start_date', e.start_date, 'end_date', e.end_date,
                  'description', e.description, 'url', e.url, 'doi', e.doi, 'status', e.status,
                  'validated_at', e.validated_at)
                  ORDER BY e.kind, coalesce(e.end_date, e.start_date) DESC NULLS LAST)
                FROM public.passport_entries e
                WHERE e.user_id = s.user_id AND e.shareable
                  AND e.status IN ('validated', 'declared')), '[]'))
  INTO _out
  FROM (SELECT s.user_id AS id) u LEFT JOIN public.profiles p ON p.id = u.id;
  RETURN _out;
END $$;

REVOKE ALL ON FUNCTION public.passport_review(uuid, boolean, text), public.passport_review_queue()
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.passport_review(uuid, boolean, text), public.passport_review_queue()
  TO authenticated;
-- A share link is the access control here: anyone holding it may read.
REVOKE ALL ON FUNCTION public.passport_public(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.passport_public(text) TO anon, authenticated;

-- Proof documents: the owner uploads into their own folder; the League reads.
INSERT INTO storage.buckets (id, name, public) VALUES ('passport-proofs', 'passport-proofs', false)
ON CONFLICT (id) DO UPDATE SET public = false;
DROP POLICY IF EXISTS "Owners manage own passport proofs" ON storage.objects;
CREATE POLICY "Owners manage own passport proofs" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'passport-proofs' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'passport-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "League reads passport proofs" ON storage.objects;
CREATE POLICY "League reads passport proofs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'passport-proofs' AND public.is_league_reviewer(auth.uid()));
