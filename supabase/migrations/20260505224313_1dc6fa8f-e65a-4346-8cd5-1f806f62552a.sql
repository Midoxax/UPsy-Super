
-- =============================================================================
-- EVOLVE client_anamneses with new columns for Phase G
-- =============================================================================

-- New JSONB section columns
ALTER TABLE public.client_anamneses
  ADD COLUMN IF NOT EXISTS relationships JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS specialized_module JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS objectives_consent JSONB DEFAULT '{}'::jsonb;

-- Psychometric score caches
ALTER TABLE public.client_anamneses
  ADD COLUMN IF NOT EXISTS phq9_score INT,
  ADD COLUMN IF NOT EXISTS phq9_severity TEXT,
  ADD COLUMN IF NOT EXISTS gad7_score INT,
  ADD COLUMN IF NOT EXISTS gad7_severity TEXT,
  ADD COLUMN IF NOT EXISTS pss10_score INT,
  ADD COLUMN IF NOT EXISTS pss10_severity TEXT,
  ADD COLUMN IF NOT EXISTS audit_c_score INT,
  ADD COLUMN IF NOT EXISTS audit_c_at_risk BOOLEAN DEFAULT false;

-- Clinical flags
ALTER TABLE public.client_anamneses
  ADD COLUMN IF NOT EXISTS clinical_flags TEXT[] DEFAULT '{}';

-- Completion tracking
ALTER TABLE public.client_anamneses
  ADD COLUMN IF NOT EXISTS completion_pct INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_section INT DEFAULT 1;

-- Sharing control
ALTER TABLE public.client_anamneses
  ADD COLUMN IF NOT EXISTS shared_with_psy_at TIMESTAMPTZ;

-- Minor intake support
ALTER TABLE public.client_anamneses
  ADD COLUMN IF NOT EXISTS parent_intake_form_id UUID REFERENCES public.client_anamneses(id),
  ADD COLUMN IF NOT EXISTS is_minor_intake BOOLEAN DEFAULT false;

-- Index on clinical flags for fast flag queries
CREATE INDEX IF NOT EXISTS idx_anamneses_flags ON public.client_anamneses USING GIN(clinical_flags);
CREATE INDEX IF NOT EXISTS idx_anamneses_status ON public.client_anamneses(status, updated_at);

-- =============================================================================
-- INTAKE CLINICAL BRIEFS (AI-generated summary for psychologist)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.intake_clinical_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_form_id UUID REFERENCES public.client_anamneses(id) ON DELETE CASCADE NOT NULL UNIQUE,
  psychologist_id UUID NOT NULL,
  
  brief_markdown TEXT NOT NULL DEFAULT '',
  brief_pdf_path TEXT,
  
  motif_synthesis TEXT,
  key_history_points TEXT[],
  scales_summary JSONB,
  red_flags TEXT[],
  treatment_suggestions TEXT[],
  
  ai_model TEXT DEFAULT 'google/gemini-2.5-flash',
  generated_at TIMESTAMPTZ DEFAULT now(),
  generation_tokens_used INT,
  
  read_by_psy_at TIMESTAMPTZ,
  notes_by_psy TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.intake_clinical_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brief_psy_select" ON public.intake_clinical_briefs
  FOR SELECT TO authenticated
  USING (psychologist_id = auth.uid());

CREATE POLICY "brief_psy_update" ON public.intake_clinical_briefs
  FOR UPDATE TO authenticated
  USING (psychologist_id = auth.uid())
  WITH CHECK (psychologist_id = auth.uid());

CREATE POLICY "brief_admin_select" ON public.intake_clinical_briefs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_briefs_updated_at
  BEFORE UPDATE ON public.intake_clinical_briefs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- CRISIS ALERTS table
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.crisis_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  intake_form_id UUID REFERENCES public.client_anamneses(id),
  booking_id UUID REFERENCES public.bookings(id),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'moderate',
  source_section TEXT,
  source_value TEXT,
  notified_psy BOOLEAN DEFAULT false,
  notified_admin BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.crisis_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crisis_client_select" ON public.crisis_alerts
  FOR SELECT TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "crisis_psy_select" ON public.crisis_alerts
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.psychologist_id = auth.uid() AND b.patient_id = crisis_alerts.client_id
  ));

CREATE POLICY "crisis_admin_all" ON public.crisis_alerts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "crisis_insert_own" ON public.crisis_alerts
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_crisis_client ON public.crisis_alerts(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crisis_severity ON public.crisis_alerts(severity, created_at DESC);

-- Update the psy access policy on client_anamneses to respect shared_with_psy_at
DROP POLICY IF EXISTS "Psychologists access client anamneses" ON public.client_anamneses;

CREATE POLICY "Psychologists view shared anamneses" ON public.client_anamneses
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.psychologist_id = auth.uid() AND b.patient_id = client_anamneses.client_id
    )
    AND (shared_with_psy_at IS NOT NULL OR status IN ('completed', 'reviewed'))
  );
