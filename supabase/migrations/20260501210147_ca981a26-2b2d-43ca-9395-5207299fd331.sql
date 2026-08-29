
-- Enums
CREATE TYPE public.treatment_plan_status AS ENUM ('draft', 'active', 'revised', 'completed');
CREATE TYPE public.homework_category AS ENUM ('worksheet', 'exercise', 'reading', 'reflection', 'other');
CREATE TYPE public.discharge_reason AS ENUM ('goals_met', 'client_request', 'referral', 'dropout', 'other');

-- ═══════════════════════════════════════════════════════════════
-- TREATMENT PLANS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE public.treatment_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  psychologist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  presenting_problems JSONB NOT NULL DEFAULT '[]'::jsonb,
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  interventions TEXT[] NOT NULL DEFAULT '{}',
  estimated_sessions INTEGER,
  status treatment_plan_status NOT NULL DEFAULT 'draft',
  review_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Psychologist manages own treatment plans"
  ON public.treatment_plans FOR ALL
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

CREATE POLICY "Clients can view their own treatment plans"
  ON public.treatment_plans FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Admins can view all treatment plans"
  ON public.treatment_plans FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_treatment_plans_updated_at
  BEFORE UPDATE ON public.treatment_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER audit_treatment_plans
  AFTER INSERT OR UPDATE OR DELETE ON public.treatment_plans
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_change();

-- ═══════════════════════════════════════════════════════════════
-- HOMEWORK ASSIGNMENTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE public.homework_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  psychologist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category homework_category NOT NULL DEFAULT 'other',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  client_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Psychologist manages own homework"
  ON public.homework_assignments FOR ALL
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

CREATE POLICY "Clients can view their own homework"
  ON public.homework_assignments FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can update completion on their homework"
  ON public.homework_assignments FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins can view all homework"
  ON public.homework_assignments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_homework_updated_at
  BEFORE UPDATE ON public.homework_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER audit_homework
  AFTER INSERT OR UPDATE OR DELETE ON public.homework_assignments
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_change();

-- ═══════════════════════════════════════════════════════════════
-- DISCHARGE SUMMARIES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE public.discharge_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  psychologist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  treatment_plan_id UUID REFERENCES public.treatment_plans(id) ON DELETE SET NULL,
  reason discharge_reason NOT NULL DEFAULT 'other',
  progress_summary TEXT,
  initial_scores JSONB DEFAULT '{}'::jsonb,
  final_scores JSONB DEFAULT '{}'::jsonb,
  aftercare_recommendations TEXT,
  referral_to UUID REFERENCES public.psychologist_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.discharge_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Psychologist manages own discharge summaries"
  ON public.discharge_summaries FOR ALL
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

CREATE POLICY "Clients can view their own discharge summaries"
  ON public.discharge_summaries FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Admins can view all discharge summaries"
  ON public.discharge_summaries FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER audit_discharge
  AFTER INSERT OR UPDATE OR DELETE ON public.discharge_summaries
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_change();
