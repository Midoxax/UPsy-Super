
-- =============================================
-- U.Psy Full Platform Schema Expansion
-- =============================================

-- 1. Add new user role types
-- (app_role enum already has admin, psychologist, user)
-- We'll add athlete, coach, organization roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'athlete';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'coach';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'organization';

-- 2. Profiles table for all users (patients, athletes, coaches, org managers)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  phone text,
  city text,
  date_of_birth date,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Psychological Assessments catalog
CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general', -- general, athlete, organization, personality
  question_count integer NOT NULL DEFAULT 0,
  estimated_minutes integer NOT NULL DEFAULT 10,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published assessments" ON public.assessments FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage assessments" ON public.assessments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 4. Assessment questions
CREATE TABLE public.assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'likert', -- likert, multiple_choice, scale
  options jsonb DEFAULT '[]'::jsonb,
  order_index integer NOT NULL DEFAULT 0,
  dimension text, -- anxiety, stress, resilience, focus, etc.
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view questions of published assessments" ON public.assessment_questions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.assessments WHERE assessments.id = assessment_questions.assessment_id AND assessments.is_published = true));
CREATE POLICY "Admins can manage questions" ON public.assessment_questions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 5. Assessment results (user completions)
CREATE TABLE public.assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  scores jsonb DEFAULT '{}'::jsonb, -- dimension scores
  total_score numeric,
  interpretation text,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own results" ON public.assessment_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own results" ON public.assessment_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all results" ON public.assessment_results FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Psychologists can view client results" ON public.assessment_results FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.leads WHERE leads.psychologist_id = auth.uid() AND leads.client_email = (SELECT email FROM auth.users WHERE auth.users.id = assessment_results.user_id)));

-- 6. Mood entries (patient dashboard)
CREATE TABLE public.mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score smallint NOT NULL, -- 1-5
  energy_level smallint, -- 1-5
  stress_level smallint, -- 1-5
  notes text,
  tags text[] DEFAULT '{}',
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own mood entries" ON public.mood_entries FOR ALL USING (auth.uid() = user_id);

-- 7. Athlete metrics
CREATE TABLE public.athlete_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sport text,
  team text,
  position text,
  coach_id uuid REFERENCES auth.users(id),
  mental_readiness_score numeric DEFAULT 0,
  focus_score numeric DEFAULT 0,
  confidence_score numeric DEFAULT 0,
  resilience_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.athlete_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Athletes can manage own profile" ON public.athlete_profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Coaches can view assigned athletes" ON public.athlete_profiles FOR SELECT USING (auth.uid() = coach_id);
CREATE POLICY "Admins can view all" ON public.athlete_profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 8. Athlete training sessions
CREATE TABLE public.athlete_training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text NOT NULL, -- mindfulness, visualization, pre_competition, recovery
  title text NOT NULL,
  duration_minutes integer,
  completed boolean DEFAULT false,
  notes text,
  metrics jsonb DEFAULT '{}'::jsonb,
  scheduled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.athlete_training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Athletes can manage own sessions" ON public.athlete_training_sessions FOR ALL USING (auth.uid() = athlete_id);

-- 9. Organization profiles
CREATE TABLE public.organization_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text,
  employee_count integer,
  city text,
  logo_url text,
  wellbeing_score numeric DEFAULT 0,
  burnout_risk_index numeric DEFAULT 0,
  engagement_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.organization_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org admins can manage own org" ON public.organization_profiles FOR ALL USING (auth.uid() = admin_user_id);
CREATE POLICY "Admins can view all orgs" ON public.organization_profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 10. Organization diagnostics
CREATE TABLE public.organization_diagnostics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organization_profiles(id) ON DELETE CASCADE,
  diagnostic_type text NOT NULL, -- psychosocial_risk, burnout, leadership, engagement
  status text DEFAULT 'pending', -- pending, in_progress, completed
  results jsonb DEFAULT '{}'::jsonb,
  recommendations text,
  conducted_by uuid REFERENCES auth.users(id),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.organization_diagnostics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org admins can view own diagnostics" ON public.organization_diagnostics FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.organization_profiles WHERE organization_profiles.id = organization_diagnostics.organization_id AND organization_profiles.admin_user_id = auth.uid()));
CREATE POLICY "Admins can manage all diagnostics" ON public.organization_diagnostics FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 11. Courses / Academy
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general', -- sport_psychology, corporate, leadership, clinical
  difficulty_level text DEFAULT 'beginner', -- beginner, intermediate, advanced
  duration_hours numeric,
  thumbnail_url text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published courses" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 12. Course modules
CREATE TABLE public.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  video_url text,
  order_index integer NOT NULL DEFAULT 0,
  duration_minutes integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view modules of published courses" ON public.course_modules FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_modules.course_id AND courses.is_published = true));
CREATE POLICY "Admins can manage modules" ON public.course_modules FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 13. Course enrollments
CREATE TABLE public.course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress_percent numeric DEFAULT 0,
  completed_modules uuid[] DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own enrollments" ON public.course_enrollments FOR ALL USING (auth.uid() = user_id);

-- 14. AI chat conversations
CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text DEFAULT 'New Conversation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own conversations" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);

-- 15. AI chat messages
CREATE TABLE public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL, -- user, assistant
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own messages" ON public.ai_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid()));

-- 16. Seed sample assessments
INSERT INTO public.assessments (title, description, category, question_count, estimated_minutes, is_published) VALUES
  ('Anxiety Screening (GAD-7)', 'Generalized Anxiety Disorder 7-item scale', 'general', 7, 3, true),
  ('Depression Screening (PHQ-9)', 'Patient Health Questionnaire 9-item scale', 'general', 9, 4, true),
  ('Burnout Assessment', 'Measure your burnout risk across emotional exhaustion, depersonalization, and personal accomplishment', 'general', 12, 5, true),
  ('Stress Perception Scale', 'Assess your perceived stress levels', 'general', 10, 4, true),
  ('Competition Anxiety Inventory', 'Measure pre-competition anxiety for athletes', 'athlete', 15, 6, true),
  ('Focus & Attentional Control', 'Assess focus capacity and attentional control', 'athlete', 12, 5, true),
  ('Confidence Profiling', 'Measure sport confidence levels', 'athlete', 10, 4, true),
  ('Psychological Resilience Scale', 'Assess psychological resilience and coping', 'general', 14, 6, true),
  ('Emotional Intelligence Assessment', 'Evaluate emotional intelligence dimensions', 'general', 20, 8, true),
  ('Organizational Wellbeing Survey', 'Comprehensive employee wellbeing assessment', 'organization', 25, 10, true);

-- Seed GAD-7 questions
INSERT INTO public.assessment_questions (assessment_id, question_text, question_type, dimension, order_index, options)
SELECT a.id, q.text, 'likert', 'anxiety', q.idx, '[{"value":0,"label":"Not at all"},{"value":1,"label":"Several days"},{"value":2,"label":"More than half the days"},{"value":3,"label":"Nearly every day"}]'::jsonb
FROM public.assessments a
CROSS JOIN (VALUES
  ('Feeling nervous, anxious, or on edge', 1),
  ('Not being able to stop or control worrying', 2),
  ('Worrying too much about different things', 3),
  ('Trouble relaxing', 4),
  ('Being so restless that it''s hard to sit still', 5),
  ('Becoming easily annoyed or irritable', 6),
  ('Feeling afraid as if something awful might happen', 7)
) AS q(text, idx)
WHERE a.title = 'Anxiety Screening (GAD-7)';

-- Seed PHQ-9 questions
INSERT INTO public.assessment_questions (assessment_id, question_text, question_type, dimension, order_index, options)
SELECT a.id, q.text, 'likert', 'depression', q.idx, '[{"value":0,"label":"Not at all"},{"value":1,"label":"Several days"},{"value":2,"label":"More than half the days"},{"value":3,"label":"Nearly every day"}]'::jsonb
FROM public.assessments a
CROSS JOIN (VALUES
  ('Little interest or pleasure in doing things', 1),
  ('Feeling down, depressed, or hopeless', 2),
  ('Trouble falling or staying asleep, or sleeping too much', 3),
  ('Feeling tired or having little energy', 4),
  ('Poor appetite or overeating', 5),
  ('Feeling bad about yourself — or that you are a failure', 6),
  ('Trouble concentrating on things', 7),
  ('Moving or speaking so slowly that other people could have noticed', 8),
  ('Thoughts that you would be better off dead, or hurting yourself', 9)
) AS q(text, idx)
WHERE a.title = 'Depression Screening (PHQ-9)';

-- Seed sample courses
INSERT INTO public.courses (title, description, category, difficulty_level, duration_hours, is_published) VALUES
  ('Understanding Anxiety', 'Learn about anxiety disorders, their causes, and evidence-based management techniques', 'clinical', 'beginner', 4, true),
  ('Stress Management Essentials', 'Practical tools and techniques for managing daily stress', 'clinical', 'beginner', 3, true),
  ('Mental Resilience Training', 'Build psychological resilience through structured exercises', 'clinical', 'intermediate', 6, true),
  ('Sport Psychology Fundamentals', 'Introduction to mental performance in competitive sports', 'sport_psychology', 'beginner', 8, true),
  ('Pre-Competition Mental Preparation', 'Visualization, focus, and anxiety management for athletes', 'sport_psychology', 'intermediate', 5, true),
  ('Corporate Wellbeing Program', 'Implementing mental health strategies in the workplace', 'corporate', 'intermediate', 10, true),
  ('Leadership Psychology', 'Psychological principles for effective leadership', 'leadership', 'advanced', 12, true);
