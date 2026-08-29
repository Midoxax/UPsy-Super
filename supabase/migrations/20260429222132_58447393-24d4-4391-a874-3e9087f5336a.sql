-- ============================================================
-- PART A: Specialist plans
-- ============================================================

-- 1. Widen the plan_type CHECK on subscriptions
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_type_check
  CHECK (plan_type = ANY (ARRAY['free','pro','elite','basic','premium']));
-- We keep basic/premium as accepted legacy values to avoid breaking old rows.

-- 2. Plan reference table
CREATE TABLE IF NOT EXISTS public.specialist_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  tagline text,
  monthly_price_mad numeric NOT NULL DEFAULT 0,
  commission_rate numeric NOT NULL DEFAULT 0.20,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.specialist_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans" ON public.specialist_plans
  FOR SELECT TO public
  USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage plans" ON public.specialist_plans
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_specialist_plans_updated_at
  BEFORE UPDATE ON public.specialist_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Seed the three plans
INSERT INTO public.specialist_plans (id, name, tagline, monthly_price_mad, commission_rate, sort_order, features) VALUES
('free',  'Free',  'Get listed and start receiving clients', 0,   0.20, 1,
  jsonb_build_object(
    'search_boost', 0,
    'gallery', false,
    'video_intro', false,
    'custom_slug', false,
    'branded_invoice', false,
    'analytics_basic', true,
    'analytics_advanced', false,
    'ai_session_summary', false,
    'ai_clinical_assistant', false,
    'smart_scheduling', false,
    'priority_support', false,
    'featured_rail', false
  )),
('pro',   'Pro',   'For serious practitioners building a steady caseload', 199, 0.12, 2,
  jsonb_build_object(
    'search_boost', 1,
    'gallery', true,
    'video_intro', true,
    'custom_slug', true,
    'branded_invoice', true,
    'analytics_basic', true,
    'analytics_advanced', true,
    'ai_session_summary', true,
    'ai_clinical_assistant', false,
    'smart_scheduling', false,
    'priority_support', true,
    'featured_rail', false
  )),
('elite', 'Elite', 'Top placement, full analytics, full AI suite', 499, 0.08, 3,
  jsonb_build_object(
    'search_boost', 2,
    'gallery', true,
    'video_intro', true,
    'custom_slug', true,
    'branded_invoice', true,
    'analytics_basic', true,
    'analytics_advanced', true,
    'ai_session_summary', true,
    'ai_clinical_assistant', true,
    'smart_scheduling', true,
    'priority_support', true,
    'featured_rail', true
  ))
ON CONFLICT (id) DO NOTHING;

-- 4. Subscription invoices
CREATE TABLE IF NOT EXISTS public.subscription_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  psychologist_id uuid NOT NULL,
  plan_type text NOT NULL,
  amount_mad numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','failed','comp','refunded')),
  paid_at timestamptz,
  period_start date NOT NULL,
  period_end date NOT NULL,
  invoice_number text UNIQUE,
  payment_method text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sub_invoices_psy ON public.subscription_invoices(psychologist_id, created_at DESC);

ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Specialists view own subscription invoices" ON public.subscription_invoices
  FOR SELECT TO authenticated
  USING (auth.uid() = psychologist_id);

CREATE POLICY "Admins manage subscription invoices" ON public.subscription_invoices
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.generate_subscription_invoice_number()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_year text; v_seq int;
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    v_year := to_char(now(), 'YYYY');
    SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM 'UPSY-SUB-' || v_year || '-(\d+)')::int), 0) + 1
      INTO v_seq
    FROM public.subscription_invoices
    WHERE invoice_number LIKE 'UPSY-SUB-' || v_year || '-%';
    NEW.invoice_number := 'UPSY-SUB-' || v_year || '-' || LPAD(v_seq::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sub_invoice_number
  BEFORE INSERT ON public.subscription_invoices
  FOR EACH ROW EXECUTE FUNCTION public.generate_subscription_invoice_number();

CREATE TRIGGER trg_sub_invoice_updated_at
  BEFORE UPDATE ON public.subscription_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Helper: feature check
CREATE OR REPLACE FUNCTION public.has_plan_feature(_user_id uuid, _feature text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT (sp.features ->> _feature)::boolean
     FROM public.subscriptions s
     JOIN public.specialist_plans sp
       ON sp.id = CASE
         WHEN s.plan_type IN ('free','pro','elite') THEN s.plan_type
         WHEN s.plan_type = 'basic' THEN 'pro'
         WHEN s.plan_type = 'premium' THEN 'elite'
         ELSE 'free' END
     WHERE s.psychologist_id = _user_id
       AND s.status = 'active'
     LIMIT 1),
    false
  );
$$;

-- 6. Helper: get effective plan + commission for a specialist
CREATE OR REPLACE FUNCTION public.get_specialist_plan(_user_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT to_jsonb(sp.*) - 'created_at' - 'updated_at'
  FROM public.subscriptions s
  JOIN public.specialist_plans sp
    ON sp.id = CASE
      WHEN s.plan_type IN ('free','pro','elite') THEN s.plan_type
      WHEN s.plan_type = 'basic' THEN 'pro'
      WHEN s.plan_type = 'premium' THEN 'elite'
      ELSE 'free' END
  WHERE s.psychologist_id = _user_id
    AND s.status = 'active'
  LIMIT 1;
$$;

-- ============================================================
-- PART B: Support ticketing system
-- ============================================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text NOT NULL CHECK (length(trim(subject)) BETWEEN 1 AND 200),
  category text NOT NULL DEFAULT 'other'
    CHECK (category IN ('billing','technical','account','clinical','feature_request','other')),
  priority text NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low','normal','high','urgent')),
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','pending_user','pending_admin','resolved','closed')),
  resolution text,
  closed_at timestamptz,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_user ON public.support_tickets(user_id, last_message_at DESC);
CREATE INDEX idx_tickets_status ON public.support_tickets(status, last_message_at DESC);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own tickets" ON public.support_tickets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own tickets" ON public.support_tickets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own tickets" ON public.support_tickets
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all tickets" ON public.support_tickets
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_ticket_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  author_role text NOT NULL CHECK (author_role IN ('user','admin','system')),
  body text NOT NULL CHECK (length(trim(body)) BETWEEN 1 AND 10000),
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_msgs_ticket ON public.support_ticket_messages(ticket_id, created_at);

ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view ticket messages" ON public.support_ticket_messages
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = support_ticket_messages.ticket_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants write ticket messages" ON public.support_ticket_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (
      (author_role = 'admin' AND has_role(auth.uid(), 'admin'::app_role))
      OR (author_role = 'user' AND EXISTS (
        SELECT 1 FROM public.support_tickets t
        WHERE t.id = ticket_id AND t.user_id = auth.uid()
      ))
    )
  );

-- Bump last_message_at + flip status when someone replies
CREATE OR REPLACE FUNCTION public.bump_ticket_on_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.support_tickets
  SET last_message_at = NEW.created_at,
      status = CASE
        WHEN NEW.author_role = 'admin' THEN 'pending_user'
        WHEN NEW.author_role = 'user'  THEN 'pending_admin'
        ELSE status END,
      updated_at = now()
  WHERE id = NEW.ticket_id AND status NOT IN ('resolved','closed');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bump_ticket_on_message
  AFTER INSERT ON public.support_ticket_messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_ticket_on_message();

-- Realtime for live ticket threads
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_ticket_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;

-- ============================================================
-- PART C: Seed gamification badges
-- ============================================================
INSERT INTO public.gamification_badges (slug, name, name_fr, description, description_fr, icon, rarity, xp_reward, criteria) VALUES
('first_steps',       'First Steps',          'Premiers pas',          'Complete your first mood check-in',         'Compléter votre premier état d''humeur',        '🌱', 'common',    20,  jsonb_build_object('mood_entries', 1)),
('week_warrior',      '7-Day Streak',         'Série de 7 jours',      'Check in seven days in a row',              'Sept jours consécutifs de suivi',                '🔥', 'uncommon',  50,  jsonb_build_object('streak_days', 7)),
('month_master',      '30-Day Streak',        'Série de 30 jours',     'Thirty days of consistent self-care',       'Trente jours de soins personnels constants',    '💎', 'rare',      150, jsonb_build_object('streak_days', 30)),
('mindful_mind',      'Mindful Mind',         'Esprit conscient',      'Complete five journal entries',             'Cinq entrées de journal complétées',             '🧘', 'common',    30,  jsonb_build_object('journal_entries', 5)),
('first_session',     'First Session',        'Première séance',       'Attend your first session',                 'Assister à votre première séance',               '🎯', 'common',    40,  jsonb_build_object('sessions_completed', 1)),
('explorer',          'Explorer',             'Explorateur',           'Complete a clinical assessment',            'Compléter une évaluation clinique',              '🧭', 'common',    30,  jsonb_build_object('assessments', 1)),
('learner',           'Lifelong Learner',     'Apprenant à vie',       'Finish your first learning module',         'Terminer votre premier module',                  '📚', 'uncommon',  40,  jsonb_build_object('modules_completed', 1)),
('challenger',        'Challenge Crusher',    'Briseur de défis',      'Complete ten daily challenges',             'Compléter dix défis quotidiens',                 '⚡', 'uncommon',  60,  jsonb_build_object('challenges_completed', 10)),
('community_builder', 'Community Builder',    'Bâtisseur',             'Refer a friend who joins',                  'Parrainer un ami qui rejoint la plateforme',    '🤝', 'rare',      100, jsonb_build_object('referrals', 1)),
('night_owl',         'Night Owl',            'Couche-tard',           'Five evening check-ins',                    'Cinq suivis en soirée',                          '🦉', 'common',    25,  jsonb_build_object('evening_checkins', 5)),
('balance_seeker',    'Balance Seeker',       'En quête d''équilibre', 'Reach a Mental Performance Score of 70',    'Atteindre un score de performance mentale de 70','⚖️', 'rare',      80,  jsonb_build_object('mps_total', 70)),
('peak_performer',    'Peak Performer',       'Performance maximale',  'Reach a Mental Performance Score of 85',    'Atteindre un score de performance mentale de 85','🏆', 'legendary', 200, jsonb_build_object('mps_total', 85))
ON CONFLICT (slug) DO NOTHING;