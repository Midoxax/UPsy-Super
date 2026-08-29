-- ============================================================
-- CRM core (runbook phase 2, part 1)
-- ============================================================

CREATE TABLE public.crm_organisations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  sector        text,
  size_range    text,
  city          text,
  country       text,
  website       text,
  ice           text,
  rc_number     text,
  billing_email text,
  contract_state text NOT NULL DEFAULT 'prospect',
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_organisations TO authenticated;
GRANT ALL ON public.crm_organisations TO service_role;
ALTER TABLE public.crm_organisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage organisations" ON public.crm_organisations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.crm_contacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid,
  organisation_id uuid REFERENCES public.crm_organisations(id) ON DELETE SET NULL,
  email           text NOT NULL,
  full_name       text,
  phone           text,
  locale          text DEFAULT 'fr',
  country         text,
  city            text,
  contact_type    text NOT NULL DEFAULT 'client',
  lifecycle       text NOT NULL DEFAULT 'lead',
  source          text,
  first_touch     jsonb NOT NULL DEFAULT '{}'::jsonb,
  data_class      text NOT NULL DEFAULT 'C2',
  owner_id        uuid,
  last_activity_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX crm_contacts_email_key ON public.crm_contacts (lower(email));
CREATE INDEX crm_contacts_user_id_idx ON public.crm_contacts (user_id);
CREATE INDEX crm_contacts_created_idx ON public.crm_contacts (created_at DESC);
CREATE INDEX crm_contacts_lifecycle_idx ON public.crm_contacts (lifecycle);
CREATE INDEX crm_contacts_source_idx ON public.crm_contacts (source);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_contacts TO authenticated;
GRANT ALL ON public.crm_contacts TO service_role;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage contacts" ON public.crm_contacts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users read own contact record" ON public.crm_contacts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE public.crm_stages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline   text NOT NULL,
  key        text NOT NULL,
  label      text NOT NULL,
  position   int  NOT NULL DEFAULT 0,
  is_won     boolean NOT NULL DEFAULT false,
  is_lost    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pipeline, key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_stages TO authenticated;
GRANT ALL ON public.crm_stages TO service_role;
ALTER TABLE public.crm_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage stages" ON public.crm_stages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.crm_stages (pipeline, key, label, position, is_won, is_lost) VALUES
  ('b2c_first_session','new','New lead',0,false,false),
  ('b2c_first_session','qualified','Qualified',1,false,false),
  ('b2c_first_session','matched','Matched',2,false,false),
  ('b2c_first_session','booked','Session booked',3,false,false),
  ('b2c_first_session','held','Session held',4,true,false),
  ('b2c_first_session','lost','Lost',5,false,true),
  ('b2b_program','new','Inbound',0,false,false),
  ('b2b_program','discovery','Discovery call',1,false,false),
  ('b2b_program','proposal','Proposal sent',2,false,false),
  ('b2b_program','negotiation','Negotiation',3,false,false),
  ('b2b_program','signed','Signed',4,true,false),
  ('b2b_program','lost','Lost',5,false,true),
  ('specialist_onboarding','applied','Applied',0,false,false),
  ('specialist_onboarding','screening','Screening',1,false,false),
  ('specialist_onboarding','accredited','Accredited',2,false,false),
  ('specialist_onboarding','live','Live on platform',3,true,false),
  ('specialist_onboarding','rejected','Rejected',4,false,true),
  ('training_enrolment','interested','Interested',0,false,false),
  ('training_enrolment','applied','Applied',1,false,false),
  ('training_enrolment','paid','Paid',2,true,false),
  ('training_enrolment','dropped','Dropped',3,false,true);

CREATE TABLE public.crm_deals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  organisation_id uuid REFERENCES public.crm_organisations(id) ON DELETE SET NULL,
  pipeline        text NOT NULL,
  stage           text NOT NULL,
  title           text,
  value_mad       numeric(12,2) NOT NULL DEFAULT 0,
  currency        text NOT NULL DEFAULT 'MAD',
  expected_close  date,
  owner_id        uuid,
  lost_reason     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX crm_deals_pipeline_idx ON public.crm_deals (pipeline, stage);
CREATE INDEX crm_deals_contact_idx ON public.crm_deals (contact_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_deals TO authenticated;
GRANT ALL ON public.crm_deals TO service_role;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage deals" ON public.crm_deals
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.crm_activities (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  uuid NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  deal_id     uuid REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  kind        text NOT NULL,
  subject     text,
  body        text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_id    uuid,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX crm_activities_contact_idx ON public.crm_activities (contact_id, occurred_at DESC);
CREATE INDEX crm_activities_occurred_idx ON public.crm_activities (occurred_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_activities TO authenticated;
GRANT ALL ON public.crm_activities TO service_role;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage activities" ON public.crm_activities
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.crm_consents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id   uuid NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  purpose      text NOT NULL,
  granted      boolean NOT NULL,
  basis        text NOT NULL DEFAULT 'consent',
  evidence     jsonb NOT NULL DEFAULT '{}'::jsonb,
  recorded_at  timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz
);

CREATE INDEX crm_consents_contact_idx ON public.crm_consents (contact_id, purpose, recorded_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_consents TO authenticated;
GRANT ALL ON public.crm_consents TO service_role;
ALTER TABLE public.crm_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage consents" ON public.crm_consents
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users read own consents" ON public.crm_consents
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.crm_contacts c WHERE c.id = contact_id AND c.user_id = auth.uid()));

-- updated_at triggers
CREATE TRIGGER trg_crm_contacts_updated_at BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_crm_organisations_updated_at BEFORE UPDATE ON public.crm_organisations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_crm_deals_updated_at BEFORE UPDATE ON public.crm_deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Ingestion RPC — the single write path for every funnel
-- ============================================================
CREATE OR REPLACE FUNCTION public.crm_upsert_contact(
  _email text,
  _full_name text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _contact_type text DEFAULT 'client',
  _source text DEFAULT NULL,
  _locale text DEFAULT 'fr',
  _country text DEFAULT NULL,
  _first_touch jsonb DEFAULT '{}'::jsonb,
  _activity_kind text DEFAULT 'form_submitted',
  _activity_subject text DEFAULT NULL,
  _activity_metadata jsonb DEFAULT '{}'::jsonb,
  _consent_purpose text DEFAULT NULL,
  _consent_granted boolean DEFAULT NULL,
  _consent_evidence jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(_email));
  v_id uuid;
BEGIN
  IF v_email IS NULL OR v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'invalid email';
  END IF;

  INSERT INTO public.crm_contacts (email, full_name, phone, contact_type, source, locale, country, first_touch)
  VALUES (v_email, nullif(trim(coalesce(_full_name,'')),''), nullif(trim(coalesce(_phone,'')),''),
          coalesce(_contact_type,'client'), _source, coalesce(_locale,'fr'), _country,
          coalesce(_first_touch,'{}'::jsonb))
  ON CONFLICT (lower(email)) DO UPDATE
    SET full_name = coalesce(public.crm_contacts.full_name, excluded.full_name),
        phone     = coalesce(public.crm_contacts.phone, excluded.phone),
        country   = coalesce(public.crm_contacts.country, excluded.country),
        last_activity_at = now(),
        updated_at = now()
  RETURNING id INTO v_id;

  INSERT INTO public.crm_activities (contact_id, kind, subject, metadata)
  VALUES (v_id, coalesce(_activity_kind,'form_submitted'), _activity_subject,
          coalesce(_activity_metadata,'{}'::jsonb));

  UPDATE public.crm_contacts SET last_activity_at = now() WHERE id = v_id;

  IF _consent_purpose IS NOT NULL AND _consent_granted IS NOT NULL THEN
    INSERT INTO public.crm_consents (contact_id, purpose, granted, basis, evidence)
    VALUES (v_id, _consent_purpose, _consent_granted, 'consent', coalesce(_consent_evidence,'{}'::jsonb));
  END IF;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.crm_upsert_contact(text,text,text,text,text,text,text,jsonb,text,text,jsonb,text,boolean,jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.crm_upsert_contact(text,text,text,text,text,text,text,jsonb,text,text,jsonb,text,boolean,jsonb) TO anon, authenticated, service_role;

-- ============================================================
-- Registration links the account to the existing lead identity
-- ============================================================
CREATE OR REPLACE FUNCTION public.crm_link_profile_to_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_id uuid;
BEGIN
  SELECT lower(u.email) INTO v_email FROM auth.users u WHERE u.id = NEW.id;
  IF v_email IS NULL THEN RETURN NEW; END IF;

  INSERT INTO public.crm_contacts (email, full_name, phone, contact_type, source, user_id, lifecycle)
  VALUES (v_email, NEW.full_name, NEW.phone, 'client', 'registration', NEW.id, 'active')
  ON CONFLICT (lower(email)) DO UPDATE
    SET user_id   = coalesce(public.crm_contacts.user_id, excluded.user_id),
        full_name = coalesce(public.crm_contacts.full_name, excluded.full_name),
        phone     = coalesce(public.crm_contacts.phone, excluded.phone),
        lifecycle = 'active',
        updated_at = now()
  RETURNING id INTO v_id;

  INSERT INTO public.crm_activities (contact_id, kind, subject)
  VALUES (v_id, 'account_created', 'Registered on the platform');

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_crm_link_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.crm_link_profile_to_contact();

-- ============================================================
-- Backfill from existing funnels (deduped on lowercased email)
-- ============================================================
INSERT INTO public.crm_contacts (email, full_name, phone, contact_type, source, locale, created_at, lifecycle)
SELECT DISTINCT ON (lower(g.email))
  lower(g.email), g.full_name, g.phone, 'client', coalesce(g.source,'growth_lead'), coalesce(g.locale,'fr'), g.created_at, 'lead'
FROM public.growth_leads g
WHERE g.email IS NOT NULL AND g.email <> ''
ORDER BY lower(g.email), g.created_at ASC
ON CONFLICT (lower(email)) DO NOTHING;

INSERT INTO public.crm_contacts (email, full_name, phone, contact_type, source, created_at, lifecycle)
SELECT DISTINCT ON (lower(p.email))
  lower(p.email), p.contact_name, p.phone, 'org_contact', 'proposal_request', p.created_at, 'qualified'
FROM public.proposal_requests p
WHERE p.email IS NOT NULL AND p.email <> ''
ORDER BY lower(p.email), p.created_at ASC
ON CONFLICT (lower(email)) DO NOTHING;

INSERT INTO public.crm_contacts (email, full_name, phone, contact_type, source, created_at)
SELECT DISTINCT ON (lower(c.email))
  lower(c.email), c.name, c.phone, 'client', 'contact_form', c.created_at
FROM public.contact_submissions c
WHERE c.email IS NOT NULL AND c.email <> ''
ORDER BY lower(c.email), c.created_at ASC
ON CONFLICT (lower(email)) DO NOTHING;

INSERT INTO public.crm_contacts (email, full_name, phone, contact_type, source, country, city, created_at, lifecycle)
SELECT DISTINCT ON (lower(o.contact_email))
  lower(o.contact_email), o.contact_name, o.contact_phone, 'org_contact', 'organization_application', o.country, o.city, o.created_at, 'qualified'
FROM public.organization_applications o
WHERE o.contact_email IS NOT NULL AND o.contact_email <> ''
ORDER BY lower(o.contact_email), o.created_at ASC
ON CONFLICT (lower(email)) DO NOTHING;

INSERT INTO public.crm_contacts (email, full_name, phone, contact_type, source, created_at, lifecycle)
SELECT DISTINCT ON (lower(a.email))
  lower(a.email), a.full_name, a.phone, 'specialist', 'specialist_application', a.submitted_at, 'qualified'
FROM public.psychologist_applications a
WHERE a.email IS NOT NULL AND a.email <> ''
ORDER BY lower(a.email), a.submitted_at ASC
ON CONFLICT (lower(email)) DO NOTHING;

INSERT INTO public.crm_contacts (email, full_name, phone, contact_type, source, user_id, created_at, lifecycle)
SELECT DISTINCT ON (lower(u.email))
  lower(u.email), pr.full_name, pr.phone, 'client', 'registration', pr.id, pr.created_at, 'active'
FROM public.profiles pr
JOIN auth.users u ON u.id = pr.id
WHERE u.email IS NOT NULL AND u.email <> ''
ORDER BY lower(u.email), pr.created_at ASC
ON CONFLICT (lower(email)) DO UPDATE
  SET user_id = coalesce(public.crm_contacts.user_id, excluded.user_id),
      lifecycle = 'active';

-- seed timeline entries for the backfilled identities
INSERT INTO public.crm_activities (contact_id, kind, subject, occurred_at, metadata)
SELECT c.id, 'form_submitted', 'Lead magnet / free score', g.created_at,
       jsonb_build_object('source', g.source, 'score_total', g.score_total)
FROM public.growth_leads g
JOIN public.crm_contacts c ON c.email = lower(g.email);

INSERT INTO public.crm_activities (contact_id, kind, subject, occurred_at, metadata)
SELECT c.id, 'form_submitted', 'Proposal request', p.created_at,
       jsonb_build_object('organization', p.organization_name, 'service', p.service_interest)
FROM public.proposal_requests p
JOIN public.crm_contacts c ON c.email = lower(p.email);

INSERT INTO public.crm_activities (contact_id, kind, subject, body, occurred_at)
SELECT c.id, 'form_submitted', 'Contact form', left(coalesce(s.message,''), 2000), s.created_at
FROM public.contact_submissions s
JOIN public.crm_contacts c ON c.email = lower(s.email);

INSERT INTO public.crm_activities (contact_id, kind, subject, occurred_at, metadata)
SELECT c.id, 'form_submitted', 'Organisation application', o.created_at,
       jsonb_build_object('organization', o.organization_name, 'status', o.status)
FROM public.organization_applications o
JOIN public.crm_contacts c ON c.email = lower(o.contact_email);

INSERT INTO public.crm_activities (contact_id, kind, subject, occurred_at, metadata)
SELECT c.id, 'form_submitted', 'Specialist application', a.submitted_at,
       jsonb_build_object('status', a.status)
FROM public.psychologist_applications a
JOIN public.crm_contacts c ON c.email = lower(a.email);

UPDATE public.crm_contacts c
SET last_activity_at = sub.last_at
FROM (SELECT contact_id, max(occurred_at) AS last_at FROM public.crm_activities GROUP BY contact_id) sub
WHERE sub.contact_id = c.id;