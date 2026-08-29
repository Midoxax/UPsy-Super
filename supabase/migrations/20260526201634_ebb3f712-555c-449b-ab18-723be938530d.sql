
-- ============================================================
-- U.Psy 2.0 Foundations
-- ============================================================

-- ---------- ENUMS ----------
DO $$ BEGIN
  CREATE TYPE public.membership_tier AS ENUM
    ('discover','student','athlete','practitioner','elite','coach','organization');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.space_type AS ENUM ('topic','cohort','region','ama','private');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.streak_kind AS ENUM ('learn','train','reflect');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- MEMBERSHIP
-- ============================================================
CREATE TABLE IF NOT EXISTS public.membership_plans (
  tier public.membership_tier PRIMARY KEY,
  name text NOT NULL,
  tagline text,
  price_monthly_mad numeric(10,2) NOT NULL DEFAULT 0,
  price_annual_mad numeric(10,2) NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  stripe_price_monthly text,
  stripe_price_annual text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.membership_plans TO anon, authenticated;
GRANT ALL ON public.membership_plans TO service_role;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans readable by everyone"
  ON public.membership_plans FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "admins manage plans"
  ON public.membership_plans FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.user_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tier public.membership_tier NOT NULL DEFAULT 'discover',
  status text NOT NULL DEFAULT 'active', -- active|past_due|canceled|trialing
  billing_cycle text NOT NULL DEFAULT 'monthly', -- monthly|annual
  current_period_start timestamptz,
  current_period_end timestamptz,
  stripe_subscription_id text,
  stripe_customer_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tier)
);
CREATE INDEX IF NOT EXISTS user_memberships_user_idx ON public.user_memberships(user_id);
CREATE INDEX IF NOT EXISTS user_memberships_active_idx ON public.user_memberships(user_id) WHERE status = 'active';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_memberships TO authenticated;
GRANT ALL ON public.user_memberships TO service_role;
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own memberships"
  ON public.user_memberships FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "admins manage memberships"
  ON public.user_memberships FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

-- Helper: does the user have at least this tier? (rank-based)
CREATE OR REPLACE FUNCTION public.has_tier(_user_id uuid, _tier public.membership_tier)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH rank AS (
    SELECT * FROM (VALUES
      ('discover'::public.membership_tier, 0),
      ('student', 1),
      ('athlete', 2),
      ('coach', 2),
      ('practitioner', 3),
      ('organization', 4),
      ('elite', 5)
    ) AS r(tier, lvl)
  ),
  required AS (SELECT lvl FROM rank WHERE tier = _tier),
  owned AS (
    SELECT MAX(r.lvl) AS lvl
    FROM public.user_memberships um
    JOIN rank r ON r.tier = um.tier
    WHERE um.user_id = _user_id
      AND um.status = 'active'
      AND (um.current_period_end IS NULL OR um.current_period_end > now())
  )
  SELECT COALESCE((SELECT lvl FROM owned), 0) >= (SELECT lvl FROM required)
      OR public.has_role(_user_id, 'admin'::app_role);
$$;

-- Trigger: auto-give every new auth user the discover (free) tier
CREATE OR REPLACE FUNCTION public.grant_default_membership()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_memberships(user_id, tier, status)
  VALUES (NEW.id, 'discover', 'active')
  ON CONFLICT (user_id, tier) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_default_membership ON auth.users;
CREATE TRIGGER on_auth_user_default_membership
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_default_membership();

CREATE TRIGGER trg_membership_plans_updated
  BEFORE UPDATE ON public.membership_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_user_memberships_updated
  BEFORE UPDATE ON public.user_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the catalog
INSERT INTO public.membership_plans (tier, name, tagline, price_monthly_mad, price_annual_mad, features, sort_order) VALUES
('discover','Discover','Start exploring',0,0,
  '{"community_read":true,"lessons_per_month":3,"ai_messages_per_day":5,"mood_log":true}'::jsonb, 1),
('student','Student','For learners',99,950,
  '{"full_library":true,"cohorts":true,"certificate_prep":"basic","ai_messages_per_day":30}'::jsonb, 2),
('athlete','Athlete','For performers',199,1900,
  '{"athlete_hub":true,"protocols":"all","ai_coach":true,"readiness_analytics":true,"ai_messages_per_day":100}'::jsonb, 3),
('coach','Coach','For trainers',299,2870,
  '{"team_dashboard":10,"session_feedback":true,"athlete_hub":true,"ai_messages_per_day":100}'::jsonb, 4),
('practitioner','Practitioner','For specialists',499,4790,
  '{"pro_community":true,"ce_credits":true,"supervision_groups":true,"ai_messages_per_day":200}'::jsonb, 5),
('organization','Organization','For gyms and teams',0,0,
  '{"custom_pricing":true,"multi_seat":true,"branded_portal":true,"pulse":true,"sso":true}'::jsonb, 6),
('elite','Elite','Top 1%',1499,14390,
  '{"mentor_matching":true,"mastermind":true,"white_glove_ai":true,"all_features":true,"scholarship":1}'::jsonb, 7)
ON CONFLICT (tier) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  price_monthly_mad = EXCLUDED.price_monthly_mad,
  price_annual_mad = EXCLUDED.price_annual_mad,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order;

-- ============================================================
-- COMMUNITY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  type public.space_type NOT NULL DEFAULT 'topic',
  tier_required public.membership_tier NOT NULL DEFAULT 'discover',
  cover_url text,
  icon text,
  is_published boolean NOT NULL DEFAULT true,
  member_count int NOT NULL DEFAULT 0,
  post_count int NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS community_spaces_type_idx ON public.community_spaces(type);
CREATE INDEX IF NOT EXISTS community_spaces_tier_idx ON public.community_spaces(tier_required);

GRANT SELECT ON public.community_spaces TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.community_spaces TO authenticated;
GRANT ALL ON public.community_spaces TO service_role;
ALTER TABLE public.community_spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spaces visible if tier satisfied"
  ON public.community_spaces FOR SELECT
  USING (
    is_published = true
    AND (
      tier_required = 'discover'
      OR (auth.uid() IS NOT NULL AND public.has_tier(auth.uid(), tier_required))
    )
  );

CREATE POLICY "admins manage spaces"
  ON public.community_spaces FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.space_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES public.community_spaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member', -- member|moderator|host
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (space_id, user_id)
);
CREATE INDEX IF NOT EXISTS space_members_user_idx ON public.space_members(user_id);
CREATE INDEX IF NOT EXISTS space_members_space_idx ON public.space_members(space_id);

GRANT SELECT, INSERT, DELETE ON public.space_members TO authenticated;
GRANT ALL ON public.space_members TO service_role;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members see own + admins all"
  ON public.space_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "users join spaces they can access"
  ON public.space_members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.community_spaces s
      WHERE s.id = space_id
        AND s.is_published = true
        AND (s.tier_required = 'discover' OR public.has_tier(auth.uid(), s.tier_required))
    )
  );

CREATE POLICY "users leave own"
  ON public.space_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES public.community_spaces(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  title text,
  body text NOT NULL,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_moderation_score numeric(3,2), -- 0..1, higher = more risky
  is_hidden boolean NOT NULL DEFAULT false,
  hidden_reason text,
  reaction_count int NOT NULL DEFAULT 0,
  comment_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS community_posts_space_idx ON public.community_posts(space_id, created_at DESC);
CREATE INDEX IF NOT EXISTS community_posts_author_idx ON public.community_posts(author_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT ALL ON public.community_posts TO service_role;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts visible inside accessible spaces"
  ON public.community_posts FOR SELECT TO authenticated
  USING (
    is_hidden = false
    AND EXISTS (
      SELECT 1 FROM public.community_spaces s
      WHERE s.id = space_id
        AND s.is_published = true
        AND (s.tier_required = 'discover' OR public.has_tier(auth.uid(), s.tier_required))
    )
  );

CREATE POLICY "members create posts"
  ON public.community_posts FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.space_members m
      WHERE m.space_id = community_posts.space_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "authors edit own / admins all"
  ON public.community_posts FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (author_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "authors delete own / admins all"
  ON public.community_posts FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'heart', -- heart|insight|fire|grateful
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, kind)
);
CREATE INDEX IF NOT EXISTS post_reactions_post_idx ON public.post_reactions(post_id);

GRANT SELECT, INSERT, DELETE ON public.post_reactions TO authenticated;
GRANT ALL ON public.post_reactions TO service_role;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own reactions"
  ON public.post_reactions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "users react on visible posts"
  ON public.post_reactions FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.community_posts p WHERE p.id = post_id AND p.is_hidden = false)
  );

CREATE POLICY "users remove own reactions"
  ON public.post_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.post_comments(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  body text NOT NULL,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS post_comments_post_idx ON public.post_comments(post_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_comments TO authenticated;
GRANT ALL ON public.post_comments TO service_role;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments follow post visibility"
  ON public.post_comments FOR SELECT TO authenticated
  USING (
    is_hidden = false
    AND EXISTS (
      SELECT 1 FROM public.community_posts p
      JOIN public.community_spaces s ON s.id = p.space_id
      WHERE p.id = post_id
        AND p.is_hidden = false
        AND s.is_published = true
        AND (s.tier_required = 'discover' OR public.has_tier(auth.uid(), s.tier_required))
    )
  );

CREATE POLICY "members comment"
  ON public.post_comments FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.community_posts p
      JOIN public.space_members m ON m.space_id = p.space_id
      WHERE p.id = post_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "authors edit own comments"
  ON public.post_comments FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (author_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "authors delete own comments"
  ON public.post_comments FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_spaces_updated BEFORE UPDATE ON public.community_spaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_posts_updated BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_comments_updated BEFORE UPDATE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Counter triggers
CREATE OR REPLACE FUNCTION public.bump_space_counts() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_spaces SET member_count = member_count + 1 WHERE id = NEW.space_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_spaces SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.space_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER trg_space_members_count
  AFTER INSERT OR DELETE ON public.space_members
  FOR EACH ROW EXECUTE FUNCTION public.bump_space_counts();

CREATE OR REPLACE FUNCTION public.bump_post_counts() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_spaces SET post_count = post_count + 1 WHERE id = NEW.space_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_spaces SET post_count = GREATEST(post_count - 1, 0) WHERE id = OLD.space_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER trg_posts_count
  AFTER INSERT OR DELETE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.bump_post_counts();

CREATE OR REPLACE FUNCTION public.bump_reaction_counts() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET reaction_count = reaction_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET reaction_count = GREATEST(reaction_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER trg_reactions_count
  AFTER INSERT OR DELETE ON public.post_reactions
  FOR EACH ROW EXECUTE FUNCTION public.bump_reaction_counts();

CREATE OR REPLACE FUNCTION public.bump_comment_counts() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER trg_comments_count
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.bump_comment_counts();

-- Seed starter spaces
INSERT INTO public.community_spaces (slug, name, description, type, tier_required, icon, is_published) VALUES
  ('mindfulness', 'Mindfulness Lab', 'Daily practice, breathwork, attention training.', 'topic', 'discover', '🧘', true),
  ('combat-psychology', 'Combat Psychology', 'Mindset, pre-fight rituals, post-loss recovery.', 'topic', 'athlete', '🥊', true),
  ('practitioners-circle', 'Practitioners Circle', 'Peer supervision, case discussions, CE.', 'topic', 'practitioner', '🎓', true),
  ('elite-mastermind', 'Elite Mastermind', 'Private mastermind for Elite members.', 'private', 'elite', '✦', true),
  ('casablanca', 'Casablanca Hub', 'Local meetups and conversations.', 'region', 'discover', '📍', true),
  ('intro-cohort-q1', 'Foundations Cohort — Q1', '8-week onboarding cohort to performance psychology.', 'cohort', 'student', '🗓️', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- GAMIFICATION
-- ============================================================
CREATE TABLE IF NOT EXISTS public.xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  xp int NOT NULL CHECK (xp >= 0 AND xp <= 1000),
  source_type text,
  source_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS xp_events_user_idx ON public.xp_events(user_id, created_at DESC);

GRANT SELECT, INSERT ON public.xp_events TO authenticated;
GRANT ALL ON public.xp_events TO service_role;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own xp"
  ON public.xp_events FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "users insert own xp"
  ON public.xp_events FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind public.streak_kind NOT NULL,
  current_days int NOT NULL DEFAULT 0,
  best_days int NOT NULL DEFAULT 0,
  freezes_available int NOT NULL DEFAULT 2,
  last_activity_date date,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind)
);
CREATE INDEX IF NOT EXISTS user_streaks_user_idx ON public.user_streaks(user_id);

GRANT SELECT, INSERT, UPDATE ON public.user_streaks TO authenticated;
GRANT ALL ON public.user_streaks TO service_role;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own streaks"
  ON public.user_streaks FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_streaks_updated BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.badges (
  slug text PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text,
  tier text NOT NULL DEFAULT 'bronze', -- bronze|silver|gold|platinum
  category text NOT NULL DEFAULT 'general',
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.badges TO anon, authenticated;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges public" ON public.badges FOR SELECT USING (is_active = true);
CREATE POLICY "admins manage badges" ON public.badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_slug text NOT NULL REFERENCES public.badges(slug) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_slug)
);
CREATE INDEX IF NOT EXISTS user_badges_user_idx ON public.user_badges(user_id);

GRANT SELECT, INSERT ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own badges + public view by id"
  ON public.user_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "users insert own badges"
  ON public.user_badges FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.quests (
  slug text PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  xp_reward int NOT NULL DEFAULT 100,
  badge_slug text REFERENCES public.badges(slug),
  tier_required public.membership_tier NOT NULL DEFAULT 'discover',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quests TO anon, authenticated;
GRANT ALL ON public.quests TO service_role;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quests visible by tier" ON public.quests FOR SELECT USING (
  is_active = true AND (tier_required = 'discover' OR (auth.uid() IS NOT NULL AND public.has_tier(auth.uid(), tier_required)))
);
CREATE POLICY "admins manage quests" ON public.quests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.user_quest_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quest_slug text NOT NULL REFERENCES public.quests(slug) ON DELETE CASCADE,
  step_idx int NOT NULL DEFAULT 0,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (user_id, quest_slug)
);
CREATE INDEX IF NOT EXISTS user_quest_progress_user_idx ON public.user_quest_progress(user_id);

GRANT SELECT, INSERT, UPDATE ON public.user_quest_progress TO authenticated;
GRANT ALL ON public.user_quest_progress TO service_role;
ALTER TABLE public.user_quest_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own quest progress" ON public.user_quest_progress FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.skill_trees (
  slug text PRIMARY KEY,
  name text NOT NULL,
  domain text NOT NULL,
  description text,
  tree jsonb NOT NULL DEFAULT '{"nodes":[]}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skill_trees TO anon, authenticated;
GRANT ALL ON public.skill_trees TO service_role;
ALTER TABLE public.skill_trees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skill trees public" ON public.skill_trees FOR SELECT USING (is_active = true);
CREATE POLICY "admins manage skill trees" ON public.skill_trees FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.user_skill_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tree_slug text NOT NULL REFERENCES public.skill_trees(slug) ON DELETE CASCADE,
  node_id text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tree_slug, node_id)
);
CREATE INDEX IF NOT EXISTS user_skill_nodes_user_idx ON public.user_skill_nodes(user_id);

GRANT SELECT, INSERT ON public.user_skill_nodes TO authenticated;
GRANT ALL ON public.user_skill_nodes TO service_role;
ALTER TABLE public.user_skill_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own skill nodes" ON public.user_skill_nodes FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

-- Seed starter badges
INSERT INTO public.badges (slug, name, description, icon, tier, category) VALUES
  ('first-step', 'First Step', 'Joined U.Psy and completed onboarding.', '🌱', 'bronze', 'milestone'),
  ('first-protocol', 'First Protocol', 'Completed your first guided protocol.', '🎯', 'bronze', 'protocols'),
  ('mindful-week', 'Mindful Week', '7-day mindfulness streak.', '🧘', 'silver', 'streak'),
  ('athlete-30', 'Athlete 30', '30 days of readiness tracking.', '🏔️', 'gold', 'streak'),
  ('reflective', 'Reflective', '10 journal entries.', '📓', 'silver', 'journal'),
  ('community-voice', 'Community Voice', 'First post in a community space.', '💬', 'bronze', 'community'),
  ('mentor', 'Mentor', 'Helped 5 community members.', '✨', 'gold', 'community'),
  ('cohort-grad', 'Cohort Graduate', 'Completed a cohort.', '🎓', 'gold', 'learning'),
  ('elite-circle', 'Elite Circle', 'Reached Elite tier.', '✦', 'platinum', 'membership')
ON CONFLICT (slug) DO NOTHING;

-- Seed starter skill tree
INSERT INTO public.skill_trees (slug, name, domain, description, tree) VALUES
  ('mindfulness', 'Mindfulness Path', 'mindfulness', 'Master attention, breath, and presence.',
   '{"nodes":[
      {"id":"root","label":"Beginner''s Breath","xp":0,"requires":[]},
      {"id":"focus-1","label":"Box Breathing","xp":50,"requires":["root"]},
      {"id":"focus-2","label":"Body Scan","xp":100,"requires":["root"]},
      {"id":"attention","label":"Attention Anchor","xp":200,"requires":["focus-1","focus-2"]},
      {"id":"presence","label":"Sustained Presence","xp":400,"requires":["attention"]},
      {"id":"master","label":"Master of Presence","xp":800,"requires":["presence"]}
   ]}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- award_xp_v2: ledger-based, idempotent, updates streaks
-- ============================================================
CREATE OR REPLACE FUNCTION public.record_xp(
  p_action text,
  p_xp int DEFAULT 10,
  p_streak public.streak_kind DEFAULT NULL,
  p_source_type text DEFAULT NULL,
  p_source_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_today date := CURRENT_DATE;
  v_streak record;
  v_xp_total int;
  v_xp_week int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF p_xp < 0 OR p_xp > 1000 THEN p_xp := 10; END IF;

  INSERT INTO public.xp_events(user_id, action, xp, source_type, source_id, metadata)
  VALUES (v_uid, p_action, p_xp, p_source_type, p_source_id, p_metadata);

  IF p_streak IS NOT NULL THEN
    INSERT INTO public.user_streaks(user_id, kind, current_days, best_days, last_activity_date)
    VALUES (v_uid, p_streak, 1, 1, v_today)
    ON CONFLICT (user_id, kind) DO UPDATE SET
      current_days = CASE
        WHEN user_streaks.last_activity_date = v_today THEN user_streaks.current_days
        WHEN user_streaks.last_activity_date = v_today - 1 THEN user_streaks.current_days + 1
        ELSE 1 END,
      best_days = GREATEST(user_streaks.best_days,
        CASE
          WHEN user_streaks.last_activity_date = v_today THEN user_streaks.current_days
          WHEN user_streaks.last_activity_date = v_today - 1 THEN user_streaks.current_days + 1
          ELSE 1 END),
      last_activity_date = v_today,
      updated_at = now()
    RETURNING * INTO v_streak;
  END IF;

  SELECT COALESCE(SUM(xp), 0) INTO v_xp_total FROM public.xp_events WHERE user_id = v_uid;
  SELECT COALESCE(SUM(xp), 0) INTO v_xp_week  FROM public.xp_events
    WHERE user_id = v_uid AND created_at >= date_trunc('week', now());

  RETURN jsonb_build_object(
    'ok', true,
    'xp_awarded', p_xp,
    'xp_total', v_xp_total,
    'xp_week', v_xp_week,
    'streak', CASE WHEN p_streak IS NOT NULL THEN to_jsonb(v_streak) ELSE NULL END
  );
END $$;
