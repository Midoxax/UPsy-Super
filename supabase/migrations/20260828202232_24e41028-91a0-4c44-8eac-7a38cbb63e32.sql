-- ---------- 1. Role-based access control ----------
CREATE TABLE IF NOT EXISTS public.crm_staff (
  user_id    uuid PRIMARY KEY,
  crm_role   text NOT NULL DEFAULT 'viewer' CHECK (crm_role IN ('viewer','agent','manager')),
  granted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.crm_staff TO authenticated;
GRANT ALL ON public.crm_staff TO service_role;
ALTER TABLE public.crm_staff ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.crm_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN _user_id IS NULL THEN NULL
    WHEN public.has_role(_user_id, 'admin'::app_role) THEN 'manager'
    ELSE (SELECT s.crm_role FROM public.crm_staff s WHERE s.user_id = _user_id)
  END;
$$;

CREATE OR REPLACE FUNCTION public.has_crm_access(_user_id uuid, _min text DEFAULT 'viewer')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    CASE public.crm_role(_user_id)
      WHEN 'manager' THEN 3 WHEN 'agent' THEN 2 WHEN 'viewer' THEN 1 ELSE 0 END
    >= CASE _min WHEN 'manager' THEN 3 WHEN 'agent' THEN 2 ELSE 1 END,
  false);
$$;

REVOKE ALL ON FUNCTION public.crm_role(uuid) FROM public;
REVOKE ALL ON FUNCTION public.has_crm_access(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.crm_role(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_crm_access(uuid, text) TO authenticated, service_role;

DROP POLICY IF EXISTS "Staff read own crm role" ON public.crm_staff;
CREATE POLICY "Staff read own crm role" ON public.crm_staff
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));
DROP POLICY IF EXISTS "Managers manage crm staff" ON public.crm_staff;
CREATE POLICY "Managers manage crm staff" ON public.crm_staff
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

DROP POLICY IF EXISTS "Admins manage organisations" ON public.crm_organisations;
CREATE POLICY "CRM read organisations" ON public.crm_organisations
  FOR SELECT TO authenticated USING (public.has_crm_access(auth.uid(),'viewer'));
CREATE POLICY "CRM write organisations" ON public.crm_organisations
  FOR ALL TO authenticated
  USING (public.has_crm_access(auth.uid(),'agent'))
  WITH CHECK (public.has_crm_access(auth.uid(),'agent'));

DROP POLICY IF EXISTS "Admins manage contacts" ON public.crm_contacts;
CREATE POLICY "CRM read contacts" ON public.crm_contacts
  FOR SELECT TO authenticated USING (public.has_crm_access(auth.uid(),'viewer'));
CREATE POLICY "CRM write contacts" ON public.crm_contacts
  FOR ALL TO authenticated
  USING (public.has_crm_access(auth.uid(),'agent'))
  WITH CHECK (public.has_crm_access(auth.uid(),'agent'));

DROP POLICY IF EXISTS "Admins manage stages" ON public.crm_stages;
CREATE POLICY "CRM read stages" ON public.crm_stages
  FOR SELECT TO authenticated USING (public.has_crm_access(auth.uid(),'viewer'));
CREATE POLICY "CRM manage stages" ON public.crm_stages
  FOR ALL TO authenticated
  USING (public.has_crm_access(auth.uid(),'manager'))
  WITH CHECK (public.has_crm_access(auth.uid(),'manager'));

DROP POLICY IF EXISTS "Admins manage deals" ON public.crm_deals;
CREATE POLICY "CRM read deals" ON public.crm_deals
  FOR SELECT TO authenticated USING (public.has_crm_access(auth.uid(),'viewer'));
CREATE POLICY "CRM write deals" ON public.crm_deals
  FOR ALL TO authenticated
  USING (public.has_crm_access(auth.uid(),'agent'))
  WITH CHECK (public.has_crm_access(auth.uid(),'agent'));

DROP POLICY IF EXISTS "Admins manage activities" ON public.crm_activities;
CREATE POLICY "CRM read activities" ON public.crm_activities
  FOR SELECT TO authenticated USING (public.has_crm_access(auth.uid(),'viewer'));
CREATE POLICY "CRM write activities" ON public.crm_activities
  FOR ALL TO authenticated
  USING (public.has_crm_access(auth.uid(),'agent'))
  WITH CHECK (public.has_crm_access(auth.uid(),'agent'));

DROP POLICY IF EXISTS "Admins manage consents" ON public.crm_consents;
CREATE POLICY "CRM read consents" ON public.crm_consents
  FOR SELECT TO authenticated USING (public.has_crm_access(auth.uid(),'viewer'));
CREATE POLICY "CRM write consents" ON public.crm_consents
  FOR ALL TO authenticated
  USING (public.has_crm_access(auth.uid(),'manager'))
  WITH CHECK (public.has_crm_access(auth.uid(),'manager'));

-- ---------- 2. Stage probability ----------
ALTER TABLE public.crm_stages
  ADD COLUMN IF NOT EXISTS probability numeric(5,2) NOT NULL DEFAULT 20
  CHECK (probability >= 0 AND probability <= 100);

UPDATE public.crm_stages SET probability = CASE
  WHEN is_won THEN 100 WHEN is_lost THEN 0
  ELSE LEAST(90, 10 + position * 20) END;

-- ---------- 3. Notifications ----------
CREATE TABLE IF NOT EXISTS public.crm_notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   uuid,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  deal_id    uuid REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  title      text NOT NULL,
  body       text,
  severity   text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','action','urgent')),
  read_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crm_notifications_owner_idx
  ON public.crm_notifications (owner_id, read_at, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_notifications TO authenticated;
GRANT ALL ON public.crm_notifications TO service_role;
ALTER TABLE public.crm_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRM read notifications" ON public.crm_notifications
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_crm_access(auth.uid(),'manager'));
CREATE POLICY "CRM update notifications" ON public.crm_notifications
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_crm_access(auth.uid(),'manager'))
  WITH CHECK (owner_id = auth.uid() OR public.has_crm_access(auth.uid(),'manager'));
CREATE POLICY "CRM managers manage notifications" ON public.crm_notifications
  FOR ALL TO authenticated
  USING (public.has_crm_access(auth.uid(),'manager'))
  WITH CHECK (public.has_crm_access(auth.uid(),'manager'));

-- ---------- 4. Automation rules ----------
CREATE TABLE IF NOT EXISTS public.crm_automation_rules (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  event_kind    text NOT NULL,
  source_match  text,
  subject_match text,
  pipeline      text NOT NULL,
  stage         text NOT NULL,
  deal_title    text,
  deal_value_mad numeric(12,2) NOT NULL DEFAULT 0,
  set_lifecycle text,
  notify        boolean NOT NULL DEFAULT true,
  default_owner uuid,
  active        boolean NOT NULL DEFAULT true,
  position      int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_automation_rules TO authenticated;
GRANT ALL ON public.crm_automation_rules TO service_role;
ALTER TABLE public.crm_automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRM read rules" ON public.crm_automation_rules
  FOR SELECT TO authenticated USING (public.has_crm_access(auth.uid(),'viewer'));
CREATE POLICY "CRM managers manage rules" ON public.crm_automation_rules
  FOR ALL TO authenticated
  USING (public.has_crm_access(auth.uid(),'manager'))
  WITH CHECK (public.has_crm_access(auth.uid(),'manager'));

DROP TRIGGER IF EXISTS trg_crm_rules_updated_at ON public.crm_automation_rules;
CREATE TRIGGER trg_crm_rules_updated_at BEFORE UPDATE ON public.crm_automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.crm_automation_rules (name, event_kind, source_match, subject_match, pipeline, stage, deal_title, deal_value_mad, set_lifecycle, position)
SELECT * FROM (VALUES
  ('Observatoire completion','form_submitted','observatoire%',NULL::text,'b2c_first_session','qualified','Observatoire opt-in',600::numeric,'qualified',0),
  ('FreeScore submission','form_submitted','free_score%',NULL,'b2c_first_session','new','Mental Performance Score lead',600,'lead',1),
  ('Quiz / lead magnet','form_submitted','growth_lead%',NULL,'b2c_first_session','new','Lead magnet',600,'lead',2),
  ('Booking created','booking_created',NULL,NULL,'b2c_first_session','booked','First session',600,'active',3),
  ('Session held','session_completed',NULL,NULL,'b2c_first_session','held','First session held',600,'customer',4),
  ('B2B proposal request','form_submitted','proposal_request%',NULL,'b2b_program','new','Organisation programme',25000,'qualified',5),
  ('Specialist application','form_submitted','specialist_application%',NULL,'specialist_onboarding','applied','Specialist onboarding',0,'qualified',6)
) AS v(name,event_kind,source_match,subject_match,pipeline,stage,deal_title,deal_value_mad,set_lifecycle,position)
WHERE NOT EXISTS (SELECT 1 FROM public.crm_automation_rules);

CREATE OR REPLACE FUNCTION public.crm_pick_owner()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.user_id
  FROM public.crm_staff s
  LEFT JOIN public.crm_deals d ON d.owner_id = s.user_id
  WHERE s.crm_role IN ('agent','manager')
  GROUP BY s.user_id
  ORDER BY count(d.id) ASC, s.user_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.crm_run_automations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r         public.crm_automation_rules%ROWTYPE;
  v_contact public.crm_contacts%ROWTYPE;
  v_deal    public.crm_deals%ROWTYPE;
  v_owner   uuid;
  v_new_pos int;
  v_cur_pos int;
BEGIN
  SELECT * INTO v_contact FROM public.crm_contacts WHERE id = NEW.contact_id;
  IF NOT FOUND THEN RETURN NEW; END IF;

  SELECT * INTO r FROM public.crm_automation_rules
  WHERE active
    AND event_kind = NEW.kind
    AND (source_match IS NULL OR coalesce(v_contact.source,'') LIKE source_match)
    AND (subject_match IS NULL OR coalesce(NEW.subject,'') ILIKE subject_match)
  ORDER BY position ASC
  LIMIT 1;
  IF NOT FOUND THEN RETURN NEW; END IF;

  v_owner := coalesce(v_contact.owner_id, r.default_owner, public.crm_pick_owner());

  SELECT * INTO v_deal FROM public.crm_deals d
  WHERE d.contact_id = v_contact.id AND d.pipeline = r.pipeline
    AND d.stage NOT IN (SELECT key FROM public.crm_stages s WHERE s.pipeline = r.pipeline AND (s.is_won OR s.is_lost))
  ORDER BY d.created_at DESC LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO public.crm_deals (contact_id, organisation_id, pipeline, stage, title, value_mad, owner_id)
    VALUES (v_contact.id, v_contact.organisation_id, r.pipeline, r.stage,
            coalesce(r.deal_title, r.name), r.deal_value_mad, v_owner)
    RETURNING * INTO v_deal;
  ELSE
    SELECT s2.position INTO v_new_pos FROM public.crm_stages s2 WHERE s2.pipeline = r.pipeline AND s2.key = r.stage;
    SELECT s3.position INTO v_cur_pos FROM public.crm_stages s3 WHERE s3.pipeline = r.pipeline AND s3.key = v_deal.stage;
    IF coalesce(v_new_pos, -1) > coalesce(v_cur_pos, -1) THEN
      UPDATE public.crm_deals
      SET stage = r.stage, owner_id = coalesce(owner_id, v_owner), updated_at = now()
      WHERE id = v_deal.id
      RETURNING * INTO v_deal;
    END IF;
  END IF;

  UPDATE public.crm_contacts
  SET owner_id  = coalesce(owner_id, v_owner),
      lifecycle = coalesce(r.set_lifecycle, lifecycle),
      last_activity_at = now(),
      updated_at = now()
  WHERE id = v_contact.id;

  IF r.notify THEN
    INSERT INTO public.crm_notifications (owner_id, contact_id, deal_id, title, body, severity)
    VALUES (v_owner, v_contact.id, v_deal.id,
            r.name || ' -> ' || r.stage,
            coalesce(v_contact.full_name, v_contact.email) || ' triggered "' || r.name || '".',
            'action');
  END IF;

  INSERT INTO public.crm_activities (contact_id, deal_id, kind, subject, metadata)
  VALUES (v_contact.id, v_deal.id, 'automation', 'Automation: ' || r.name,
          jsonb_build_object('rule_id', r.id, 'pipeline', r.pipeline, 'stage', r.stage, 'owner_id', v_owner));

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_run_automations ON public.crm_activities;
CREATE TRIGGER trg_crm_run_automations
  AFTER INSERT ON public.crm_activities
  FOR EACH ROW
  WHEN (NEW.kind <> 'automation')
  EXECUTE FUNCTION public.crm_run_automations();

-- ---------- 5. Email sync ----------
CREATE TABLE IF NOT EXISTS public.crm_email_messages (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id          uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  email               text NOT NULL,
  direction           text NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound','inbound')),
  provider            text NOT NULL DEFAULT 'resend',
  provider_message_id text,
  campaign            text,
  template            text,
  subject             text,
  preview             text,
  status              text NOT NULL DEFAULT 'queued',
  opened_at           timestamptz,
  clicked_at          timestamptz,
  sent_at             timestamptz NOT NULL DEFAULT now(),
  metadata            jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS crm_email_provider_id_key
  ON public.crm_email_messages (provider, provider_message_id)
  WHERE provider_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS crm_email_contact_idx
  ON public.crm_email_messages (contact_id, sent_at DESC);

CREATE TABLE IF NOT EXISTS public.crm_email_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  uuid REFERENCES public.crm_email_messages(id) ON DELETE CASCADE,
  contact_id  uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  event_type  text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS crm_email_events_msg_idx ON public.crm_email_events (message_id, occurred_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.crm_email_messages TO authenticated;
GRANT SELECT ON public.crm_email_events TO authenticated;
GRANT ALL ON public.crm_email_messages TO service_role;
GRANT ALL ON public.crm_email_events TO service_role;
ALTER TABLE public.crm_email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_email_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CRM read emails" ON public.crm_email_messages
  FOR SELECT TO authenticated USING (public.has_crm_access(auth.uid(),'viewer'));
CREATE POLICY "CRM write emails" ON public.crm_email_messages
  FOR ALL TO authenticated
  USING (public.has_crm_access(auth.uid(),'agent'))
  WITH CHECK (public.has_crm_access(auth.uid(),'agent'));
CREATE POLICY "CRM read email events" ON public.crm_email_events
  FOR SELECT TO authenticated USING (public.has_crm_access(auth.uid(),'viewer'));

CREATE OR REPLACE FUNCTION public.crm_log_email(
  _email text,
  _subject text,
  _direction text DEFAULT 'outbound',
  _provider text DEFAULT 'resend',
  _provider_message_id text DEFAULT NULL,
  _campaign text DEFAULT NULL,
  _template text DEFAULT NULL,
  _preview text DEFAULT NULL,
  _status text DEFAULT 'sent',
  _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(_email));
  v_contact uuid;
  v_id uuid;
BEGIN
  SELECT id INTO v_contact FROM public.crm_contacts WHERE email = v_email;

  INSERT INTO public.crm_email_messages
    (contact_id, email, direction, provider, provider_message_id, campaign, template, subject, preview, status, metadata)
  VALUES (v_contact, v_email, coalesce(_direction,'outbound'), coalesce(_provider,'resend'),
          _provider_message_id, _campaign, _template, _subject, left(coalesce(_preview,''), 500),
          coalesce(_status,'sent'), coalesce(_metadata,'{}'::jsonb))
  ON CONFLICT (provider, provider_message_id) WHERE provider_message_id IS NOT NULL
  DO UPDATE SET status = excluded.status,
                subject = coalesce(excluded.subject, public.crm_email_messages.subject)
  RETURNING id INTO v_id;

  IF v_contact IS NOT NULL THEN
    INSERT INTO public.crm_activities (contact_id, kind, subject, body, metadata)
    VALUES (v_contact,
            CASE WHEN _direction = 'inbound' THEN 'email_received' ELSE 'email_sent' END,
            _subject, left(coalesce(_preview,''), 2000),
            jsonb_build_object('campaign', _campaign, 'template', _template, 'message_id', v_id));
  END IF;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.crm_record_email_event(
  _event_type text,
  _email text DEFAULT NULL,
  _provider_message_id text DEFAULT NULL,
  _provider text DEFAULT 'resend',
  _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_msg public.crm_email_messages%ROWTYPE;
  v_contact uuid;
  v_id uuid;
BEGIN
  IF _provider_message_id IS NOT NULL THEN
    SELECT * INTO v_msg FROM public.crm_email_messages
    WHERE provider = coalesce(_provider,'resend') AND provider_message_id = _provider_message_id;
  END IF;

  IF v_msg.id IS NULL AND _email IS NOT NULL THEN
    SELECT * INTO v_msg FROM public.crm_email_messages
    WHERE email = lower(trim(_email)) ORDER BY sent_at DESC LIMIT 1;
  END IF;

  v_contact := v_msg.contact_id;
  IF v_contact IS NULL AND _email IS NOT NULL THEN
    SELECT id INTO v_contact FROM public.crm_contacts WHERE email = lower(trim(_email));
  END IF;

  INSERT INTO public.crm_email_events (message_id, contact_id, event_type, metadata)
  VALUES (v_msg.id, v_contact, _event_type, coalesce(_metadata,'{}'::jsonb))
  RETURNING id INTO v_id;

  IF v_msg.id IS NOT NULL THEN
    UPDATE public.crm_email_messages
    SET status    = _event_type,
        opened_at = CASE WHEN _event_type IN ('opened','email.opened') THEN coalesce(opened_at, now()) ELSE opened_at END,
        clicked_at= CASE WHEN _event_type IN ('clicked','email.clicked') THEN coalesce(clicked_at, now()) ELSE clicked_at END
    WHERE id = v_msg.id;
  END IF;

  IF v_contact IS NOT NULL AND _event_type IN ('clicked','email.clicked') THEN
    INSERT INTO public.crm_activities (contact_id, kind, subject, metadata)
    VALUES (v_contact, 'email_clicked', coalesce(v_msg.subject,'Campaign email'), coalesce(_metadata,'{}'::jsonb));
    UPDATE public.crm_contacts SET last_activity_at = now() WHERE id = v_contact;
  END IF;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.crm_log_email(text,text,text,text,text,text,text,text,text,jsonb) FROM public;
REVOKE ALL ON FUNCTION public.crm_record_email_event(text,text,text,text,jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.crm_log_email(text,text,text,text,text,text,text,text,text,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.crm_record_email_event(text,text,text,text,jsonb) TO service_role;

-- ---------- 6. Consent evidence export ----------
CREATE OR REPLACE FUNCTION public.crm_consent_evidence()
RETURNS TABLE (
  contact_id uuid,
  email text,
  full_name text,
  contact_type text,
  lifecycle text,
  source text,
  first_touch jsonb,
  contact_created_at timestamptz,
  purpose text,
  granted boolean,
  basis text,
  recorded_at timestamptz,
  withdrawn_at timestamptz,
  evidence jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_crm_access(auth.uid(),'manager') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT c.id, c.email, c.full_name, c.contact_type, c.lifecycle, c.source, c.first_touch, c.created_at,
         k.purpose, k.granted, k.basis, k.recorded_at, k.withdrawn_at, k.evidence
  FROM public.crm_contacts c
  LEFT JOIN public.crm_consents k ON k.contact_id = c.id
  ORDER BY c.created_at DESC, k.recorded_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.crm_consent_evidence() FROM public;
GRANT EXECUTE ON FUNCTION public.crm_consent_evidence() TO authenticated, service_role;

-- ---------- 7. Forecasting ----------
CREATE OR REPLACE FUNCTION public.crm_pipeline_forecast()
RETURNS TABLE (
  pipeline text,
  stage text,
  label text,
  stage_position int,
  probability numeric,
  deal_count bigint,
  value_mad numeric,
  weighted_mad numeric,
  is_won boolean,
  is_lost boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_crm_access(auth.uid(),'viewer') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT s.pipeline, s.key, s.label, s.position, s.probability,
         count(d.id),
         coalesce(sum(d.value_mad),0)::numeric,
         coalesce(sum(d.value_mad * s.probability / 100.0),0)::numeric,
         s.is_won, s.is_lost
  FROM public.crm_stages s
  LEFT JOIN public.crm_deals d ON d.pipeline = s.pipeline AND d.stage = s.key
  GROUP BY s.pipeline, s.key, s.label, s.position, s.probability, s.is_won, s.is_lost
  ORDER BY s.pipeline, s.position;
END;
$$;

CREATE OR REPLACE FUNCTION public.crm_next_best_actions(_limit int DEFAULT 10)
RETURNS TABLE (
  deal_id uuid,
  contact_id uuid,
  contact_name text,
  contact_email text,
  pipeline text,
  stage text,
  value_mad numeric,
  probability numeric,
  weighted_mad numeric,
  days_idle int,
  action text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_crm_access(auth.uid(),'viewer') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT d.id, c.id, c.full_name, c.email, d.pipeline, d.stage, d.value_mad, s.probability,
         (d.value_mad * s.probability / 100.0)::numeric,
         GREATEST(0, EXTRACT(DAY FROM now() - d.updated_at)::int),
         CASE
           WHEN EXTRACT(DAY FROM now() - d.updated_at) > 14 THEN 'Re-engage - idle over 2 weeks'
           WHEN s.probability >= 60 THEN 'Push to close - high probability'
           WHEN d.expected_close IS NOT NULL AND d.expected_close < current_date THEN 'Reschedule - close date passed'
           ELSE 'Qualify - book the next touchpoint'
         END
  FROM public.crm_deals d
  JOIN public.crm_stages s ON s.pipeline = d.pipeline AND s.key = d.stage
  LEFT JOIN public.crm_contacts c ON c.id = d.contact_id
  WHERE NOT s.is_won AND NOT s.is_lost
  ORDER BY (d.value_mad * s.probability / 100.0) DESC, d.updated_at ASC
  LIMIT GREATEST(1, LEAST(coalesce(_limit,10), 50));
END;
$$;

REVOKE ALL ON FUNCTION public.crm_pipeline_forecast() FROM public;
REVOKE ALL ON FUNCTION public.crm_next_best_actions(int) FROM public;
GRANT EXECUTE ON FUNCTION public.crm_pipeline_forecast() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.crm_next_best_actions(int) TO authenticated, service_role;