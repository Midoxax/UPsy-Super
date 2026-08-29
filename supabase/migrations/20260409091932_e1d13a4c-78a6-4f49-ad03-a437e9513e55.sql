
-- =============================================
-- 1. BOOKINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id uuid NOT NULL REFERENCES public.psychologist_profiles(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 50,
  session_type text NOT NULL DEFAULT 'video' CHECK (session_type IN ('video','in_person','phone')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled','no_show')),
  amount_mad numeric,
  payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','refunded')),
  patient_notes text,
  video_room_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_bookings_psychologist ON public.bookings(psychologist_id, scheduled_at);
CREATE INDEX idx_bookings_patient ON public.bookings(patient_id, scheduled_at);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can create bookings" ON public.bookings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can view own bookings" ON public.bookings
  FOR SELECT TO authenticated USING (auth.uid() = patient_id);

CREATE POLICY "Patients can update own bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (auth.uid() = patient_id);

CREATE POLICY "Psychologists can view own bookings" ON public.bookings
  FOR SELECT TO authenticated USING (auth.uid() = psychologist_id);

CREATE POLICY "Psychologists can update own bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (auth.uid() = psychologist_id);

CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- =============================================
-- 2. AVAILABILITY SLOTS UPDATES
-- =============================================
ALTER TABLE public.availability_slots
  ADD COLUMN IF NOT EXISTS session_duration_minutes integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- =============================================
-- 3. GET AVAILABLE SLOTS FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_psychologist_id uuid,
  p_date date
)
RETURNS TABLE(slot_start timestamptz, is_available boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dow smallint;
  v_slot RECORD;
  v_time time;
  v_slot_ts timestamptz;
  v_dur interval;
BEGIN
  v_dow := EXTRACT(DOW FROM p_date)::smallint;

  FOR v_slot IN
    SELECT start_time, end_time, session_duration_minutes
    FROM public.availability_slots
    WHERE psychologist_id = p_psychologist_id
      AND day_of_week = v_dow
      AND is_available = true
      AND (is_active IS NULL OR is_active = true)
  LOOP
    v_dur := (COALESCE(v_slot.session_duration_minutes, 50)::text || ' minutes')::interval;
    v_time := v_slot.start_time;

    WHILE v_time + v_dur <= v_slot.end_time LOOP
      v_slot_ts := (p_date::text || 'T' || v_time::text)::timestamptz;

      IF v_slot_ts > now() THEN
        slot_start := v_slot_ts;
        is_available := NOT EXISTS (
          SELECT 1 FROM public.bookings b
          WHERE b.psychologist_id = p_psychologist_id
            AND b.scheduled_at = v_slot_ts
            AND b.status NOT IN ('cancelled')
        );
        RETURN NEXT;
      END IF;

      v_time := v_time + v_dur;
    END LOOP;
  END LOOP;
END;
$$;

-- =============================================
-- 4. ADMIN PLATFORM STATS VIEW
-- =============================================
CREATE OR REPLACE VIEW public.admin_platform_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles)::bigint AS total_users,
  (SELECT COUNT(*) FROM public.psychologist_profiles WHERE is_published = true)::bigint AS active_psychologists,
  (SELECT COUNT(*) FROM public.psychologist_profiles WHERE is_accredited = true)::bigint AS accredited_psychologists,
  (SELECT COUNT(*) FROM public.bookings)::bigint AS total_bookings,
  (SELECT COUNT(*) FROM public.bookings WHERE status = 'completed')::bigint AS completed_sessions,
  (SELECT COUNT(*) FROM public.bookings WHERE status = 'pending')::bigint AS pending_bookings,
  (SELECT COUNT(*) FROM public.bookings WHERE status IN ('pending','confirmed') AND scheduled_at > now())::bigint AS upcoming_sessions,
  COALESCE((SELECT SUM(amount_mad) FROM public.bookings WHERE status = 'completed'), 0)::numeric AS total_gross_revenue_mad,
  COALESCE((SELECT SUM(amount_mad) * 0.15 FROM public.bookings WHERE status = 'completed'), 0)::numeric AS total_platform_revenue_mad,
  (SELECT COUNT(*) FROM public.bookings WHERE created_at >= now() - interval '30 days')::bigint AS bookings_last_30d,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at >= now() - interval '30 days')::bigint AS new_users_last_30d;

-- =============================================
-- 5. BOOKINGS WITH DETAILS VIEW
-- =============================================
CREATE OR REPLACE VIEW public.bookings_with_details AS
SELECT
  b.*,
  p.full_name AS patient_name,
  pp.full_name AS psychologist_name
FROM public.bookings b
LEFT JOIN public.profiles p ON p.id = b.patient_id
LEFT JOIN public.psychologist_profiles pp ON pp.id = b.psychologist_id;

-- =============================================
-- 6. GAMIFICATION TABLES
-- =============================================

-- Levels
CREATE TABLE IF NOT EXISTS public.gamification_levels (
  level integer PRIMARY KEY,
  name text NOT NULL,
  name_fr text,
  xp_required integer NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#6366f1',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gamification_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view levels" ON public.gamification_levels
  FOR SELECT USING (true);

-- Badges
CREATE TABLE IF NOT EXISTS public.gamification_badges (
  slug text PRIMARY KEY,
  name text NOT NULL,
  name_fr text,
  description text,
  description_fr text,
  icon text DEFAULT '🏅',
  rarity text NOT NULL DEFAULT 'common' CHECK (rarity IN ('common','uncommon','rare','epic','legendary')),
  xp_reward integer NOT NULL DEFAULT 10,
  criteria jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gamification_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view badges" ON public.gamification_badges
  FOR SELECT USING (true);

-- User progress
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id uuid PRIMARY KEY,
  xp_total integer NOT NULL DEFAULT 0,
  xp_this_week integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  streak_best integer NOT NULL DEFAULT 0,
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own progress" ON public.user_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- User badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_slug text NOT NULL REFERENCES public.gamification_badges(slug) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_slug)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can earn badges" ON public.user_badges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 7. AI CHAT HISTORY (for v2 edge function)
-- =============================================
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ai_chat_lookup ON public.ai_chat_history(user_id, conversation_id, created_at);

ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own chat history" ON public.ai_chat_history
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 8. B2B ORGANIZATION TABLES
-- =============================================

-- Organization accounts
CREATE TABLE IF NOT EXISTS public.organization_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  industry text,
  size_range text,
  logo_url text,
  website text,
  contact_email text NOT NULL,
  contact_phone text,
  city text,
  country text DEFAULT 'MA',
  plan_type text NOT NULL DEFAULT 'starter' CHECK (plan_type IN ('starter','growth','enterprise')),
  seats_total integer NOT NULL DEFAULT 10,
  seats_used integer NOT NULL DEFAULT 0,
  subscription_status text NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('trial','active','paused','cancelled')),
  billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','annual')),
  monthly_price_mad numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.organization_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org owners manage their account" ON public.organization_accounts
  FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Admins manage all orgs" ON public.organization_accounts
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_org_accounts_updated_at BEFORE UPDATE ON public.organization_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Organization members
CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organization_accounts(id) ON DELETE CASCADE,
  user_id uuid,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin','manager','member')),
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','active','suspended')),
  invite_token text UNIQUE DEFAULT gen_random_uuid()::text,
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  sessions_used integer DEFAULT 0,
  sessions_limit integer DEFAULT 4,
  UNIQUE(org_id, email)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org admins manage members" ON public.organization_members
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.organization_accounts oa
    WHERE oa.id = org_id AND oa.owner_id = auth.uid()
  ));
CREATE POLICY "Members see own record" ON public.organization_members
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins see all members" ON public.organization_members
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Wellness programs
CREATE TABLE IF NOT EXISTS public.wellness_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organization_accounts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  program_type text NOT NULL DEFAULT 'sessions' CHECK (program_type IN ('sessions','workshop','assessment','hybrid')),
  sessions_included integer DEFAULT 4,
  duration_weeks integer DEFAULT 4,
  is_active boolean DEFAULT true,
  psychologist_id uuid REFERENCES public.psychologist_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.wellness_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org owners manage programs" ON public.wellness_programs
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.organization_accounts oa WHERE oa.id = org_id AND oa.owner_id = auth.uid()
  ));
CREATE POLICY "Members view active programs" ON public.wellness_programs
  FOR SELECT TO authenticated
  USING (is_active = true AND EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.org_id = wellness_programs.org_id AND om.user_id = auth.uid() AND om.status = 'active'
  ));
CREATE POLICY "Admins manage all programs" ON public.wellness_programs
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Organization invoices
CREATE TABLE IF NOT EXISTS public.organization_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organization_accounts(id) ON DELETE CASCADE,
  invoice_number text NOT NULL UNIQUE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  seats_billed integer NOT NULL,
  unit_price_mad numeric NOT NULL,
  subtotal_mad numeric NOT NULL,
  tax_rate numeric DEFAULT 0.20,
  tax_mad numeric GENERATED ALWAYS AS (subtotal_mad * tax_rate) STORED,
  total_mad numeric GENERATED ALWAYS AS (subtotal_mad * (1 + tax_rate)) STORED,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  due_date date,
  paid_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.organization_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org owners see own invoices" ON public.organization_invoices
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.organization_accounts oa WHERE oa.id = org_id AND oa.owner_id = auth.uid()
  ));
CREATE POLICY "Admins manage all invoices" ON public.organization_invoices
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Org usage summary view
CREATE OR REPLACE VIEW public.org_usage_summary AS
SELECT
  om.org_id,
  COUNT(DISTINCT om.id) FILTER (WHERE om.status = 'active') AS active_members,
  COUNT(DISTINCT om.id) FILTER (WHERE om.status = 'invited') AS pending_invites,
  COUNT(DISTINCT b.id) AS total_sessions_booked,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed') AS sessions_completed,
  COUNT(DISTINCT b.id) FILTER (WHERE b.scheduled_at >= date_trunc('month', now())) AS sessions_this_month,
  ROUND(AVG(om.sessions_used)::numeric, 1) AS avg_sessions_per_member
FROM public.organization_members om
LEFT JOIN public.bookings b ON b.patient_id = om.user_id
  AND b.created_at >= (now() - interval '90 days')
GROUP BY om.org_id;

-- Invite member function
CREATE OR REPLACE FUNCTION public.invite_org_member(
  p_org_id uuid,
  p_email text,
  p_name text DEFAULT NULL,
  p_role text DEFAULT 'member',
  p_sessions_limit integer DEFAULT 4
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_id uuid;
BEGIN
  INSERT INTO public.organization_members (org_id, email, full_name, role, sessions_limit)
  VALUES (p_org_id, lower(trim(p_email)), p_name, p_role, p_sessions_limit)
  ON CONFLICT (org_id, email) DO UPDATE SET
    full_name = COALESCE(p_name, organization_members.full_name),
    role = p_role,
    status = CASE WHEN organization_members.status = 'suspended' THEN 'invited' ELSE organization_members.status END
  RETURNING id INTO v_member_id;

  UPDATE public.organization_accounts
  SET seats_used = (SELECT COUNT(*) FROM public.organization_members WHERE org_id = p_org_id AND status != 'suspended')
  WHERE id = p_org_id;

  RETURN v_member_id;
END;
$$;

-- =============================================
-- 9. SEED GAMIFICATION DATA
-- =============================================

-- Seed levels
INSERT INTO public.gamification_levels (level, name, name_fr, xp_required, color) VALUES
  (1, 'Beginner', 'Débutant', 0, '#94a3b8'),
  (2, 'Explorer', 'Explorateur', 100, '#60a5fa'),
  (3, 'Seeker', 'Chercheur', 300, '#a78bfa'),
  (4, 'Guide', 'Guide', 600, '#f59e0b'),
  (5, 'Sage', 'Sage', 1000, '#10b981'),
  (6, 'Master', 'Maître', 1500, '#ec4899'),
  (7, 'Luminary', 'Luminaire', 2500, '#f97316')
ON CONFLICT DO NOTHING;

-- Seed badges
INSERT INTO public.gamification_badges (slug, name, name_fr, description, description_fr, icon, rarity, xp_reward) VALUES
  ('first-journal', 'First Entry', 'Première entrée', 'Write your first journal entry', 'Écrivez votre première entrée de journal', '📝', 'common', 10),
  ('first-mood', 'Mood Tracker', 'Suivi d''humeur', 'Log your first mood check-in', 'Enregistrez votre premier suivi d''humeur', '🌡️', 'common', 10),
  ('first-session', 'First Session', 'Première séance', 'Complete your first session', 'Complétez votre première séance', '🎯', 'uncommon', 25),
  ('streak-7', 'Week Warrior', 'Guerrier de la semaine', '7-day activity streak', 'Série de 7 jours d''activité', '🔥', 'uncommon', 30),
  ('streak-30', 'Monthly Master', 'Maître mensuel', '30-day activity streak', 'Série de 30 jours d''activité', '⚡', 'rare', 100),
  ('assessment-complete', 'Self-Aware', 'Conscient de soi', 'Complete a self-assessment', 'Complétez une auto-évaluation', '🧠', 'common', 15),
  ('journal-10', 'Reflector', 'Réflecteur', 'Write 10 journal entries', 'Écrivez 10 entrées de journal', '✨', 'uncommon', 25),
  ('course-complete', 'Scholar', 'Érudit', 'Complete a learning course', 'Complétez un cours', '🎓', 'rare', 50),
  ('sessions-10', 'Committed', 'Engagé', 'Complete 10 sessions', 'Complétez 10 séances', '💪', 'epic', 100),
  ('community-member', 'Community', 'Communauté', 'Join the Skool community', 'Rejoignez la communauté Skool', '🤝', 'common', 10)
ON CONFLICT DO NOTHING;
