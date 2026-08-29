-- Moroccan tax IDs on org accounts
ALTER TABLE public.organization_accounts
  ADD COLUMN IF NOT EXISTS ice TEXT,
  ADD COLUMN IF NOT EXISTS if_number TEXT,
  ADD COLUMN IF NOT EXISTS rc_number TEXT,
  ADD COLUMN IF NOT EXISTS billing_address TEXT;

-- Pulse surveys
CREATE TABLE IF NOT EXISTS public.org_pulse_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organization_accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','closed')),
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pulse_surveys_org ON public.org_pulse_surveys(org_id, status);

ALTER TABLE public.org_pulse_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all surveys" ON public.org_pulse_surveys
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Org owners manage own surveys" ON public.org_pulse_surveys
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM organization_accounts oa WHERE oa.id = org_pulse_surveys.org_id AND oa.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_accounts oa WHERE oa.id = org_pulse_surveys.org_id AND oa.owner_id = auth.uid()));

CREATE POLICY "Members view active surveys" ON public.org_pulse_surveys
FOR SELECT TO authenticated
USING (
  status = 'active' AND EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.org_id = org_pulse_surveys.org_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
  )
);

-- Pulse responses (anonymous; no user_id stored)
CREATE TABLE IF NOT EXISTS public.org_pulse_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.org_pulse_surveys(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  -- Hashed token (sha256(survey_id || user_id || secret)) prevents double-submission without storing identity
  submission_token TEXT NOT NULL,
  mood_score SMALLINT NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
  stress_level SMALLINT NOT NULL CHECK (stress_level BETWEEN 1 AND 5),
  workload_level SMALLINT NOT NULL CHECK (workload_level BETWEEN 1 AND 5),
  sentiment_text TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (survey_id, submission_token)
);

CREATE INDEX IF NOT EXISTS idx_pulse_responses_survey ON public.org_pulse_responses(survey_id);

ALTER TABLE public.org_pulse_responses ENABLE ROW LEVEL SECURITY;

-- Only admins can directly read raw responses (for support / abuse review).
-- Org owners CANNOT read raw responses — only aggregates via RPC.
CREATE POLICY "Admins read responses" ON public.org_pulse_responses
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Members submit responses" ON public.org_pulse_responses
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM org_pulse_surveys s
    JOIN organization_members om ON om.org_id = s.org_id
    WHERE s.id = org_pulse_responses.survey_id
      AND s.status = 'active'
      AND om.user_id = auth.uid()
      AND om.status = 'active'
  )
);

-- Aggregate reports metadata
CREATE TABLE IF NOT EXISTS public.org_aggregate_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organization_accounts(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('quarterly','diagnostic','program','annual','pulse')),
  title TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','ready','failed')),
  storage_path TEXT,
  page_count INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  requested_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_reports ON public.org_aggregate_reports(org_id, created_at DESC);

ALTER TABLE public.org_aggregate_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all reports" ON public.org_aggregate_reports
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Org owners manage own reports" ON public.org_aggregate_reports
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM organization_accounts oa WHERE oa.id = org_aggregate_reports.org_id AND oa.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organization_accounts oa WHERE oa.id = org_aggregate_reports.org_id AND oa.owner_id = auth.uid()));

-- K-anonymity aggregate function (k=5 minimum)
CREATE OR REPLACE FUNCTION public.org_pulse_aggregate(_org_id UUID, _survey_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_result JSONB;
  v_is_owner BOOLEAN;
  v_is_admin BOOLEAN;
BEGIN
  v_is_admin := has_role(auth.uid(), 'admin'::app_role);
  SELECT EXISTS (SELECT 1 FROM organization_accounts WHERE id = _org_id AND owner_id = auth.uid())
    INTO v_is_owner;

  IF NOT (v_is_admin OR v_is_owner) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM org_pulse_responses r
  WHERE r.org_id = _org_id
    AND (_survey_id IS NULL OR r.survey_id = _survey_id);

  -- K-anonymity: minimum 5 responses to return any aggregate
  IF v_count < 5 THEN
    RETURN jsonb_build_object(
      'response_count', v_count,
      'k_threshold_met', false,
      'message', 'Insufficient responses for anonymized reporting (minimum 5 required).'
    );
  END IF;

  SELECT jsonb_build_object(
    'response_count', v_count,
    'k_threshold_met', true,
    'avg_mood', ROUND(AVG(mood_score)::numeric, 2),
    'avg_stress', ROUND(AVG(stress_level)::numeric, 2),
    'avg_workload', ROUND(AVG(workload_level)::numeric, 2),
    'wellbeing_index', ROUND(((AVG(mood_score) * 20) + (100 - AVG(stress_level) * 20)) / 2, 1),
    'mood_distribution', (
      SELECT jsonb_object_agg(mood_score::text, cnt)
      FROM (SELECT mood_score, COUNT(*) cnt FROM org_pulse_responses
            WHERE org_id = _org_id AND (_survey_id IS NULL OR survey_id = _survey_id)
            GROUP BY mood_score) m
    )
  ) INTO v_result
  FROM org_pulse_responses r
  WHERE r.org_id = _org_id
    AND (_survey_id IS NULL OR r.survey_id = _survey_id);

  RETURN v_result;
END;
$$;

-- Auto-generate invoice number trigger for organization_invoices
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    v_year := to_char(now(), 'YYYY');
    SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM 'UPSY-' || v_year || '-(\d+)')::INTEGER), 0) + 1
      INTO v_seq
    FROM organization_invoices
    WHERE invoice_number LIKE 'UPSY-' || v_year || '-%';
    NEW.invoice_number := 'UPSY-' || v_year || '-' || LPAD(v_seq::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_invoice_number ON public.organization_invoices;
CREATE TRIGGER trg_generate_invoice_number
  BEFORE INSERT ON public.organization_invoices
  FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();