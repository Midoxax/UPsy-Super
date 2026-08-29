
-- 1) readiness_checkins
CREATE TABLE public.readiness_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mood smallint NOT NULL CHECK (mood BETWEEN 1 AND 10),
  sleep smallint NOT NULL CHECK (sleep BETWEEN 1 AND 10),
  stress smallint NOT NULL CHECK (stress BETWEEN 1 AND 10),
  energy smallint NOT NULL CHECK (energy BETWEEN 1 AND 10),
  cognitive_load smallint NOT NULL CHECK (cognitive_load BETWEEN 1 AND 10),
  score smallint NOT NULL CHECK (score BETWEEN 0 AND 100),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.readiness_checkins TO authenticated;
GRANT ALL ON public.readiness_checkins TO service_role;
ALTER TABLE public.readiness_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own checkins read" ON public.readiness_checkins FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own checkins insert" ON public.readiness_checkins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own checkins update" ON public.readiness_checkins FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own checkins delete" ON public.readiness_checkins FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_readiness_user_time ON public.readiness_checkins (user_id, created_at DESC);

-- 2) athlete_protocols (public library)
CREATE TABLE public.athlete_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  duration_minutes smallint NOT NULL,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  focus_areas text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.athlete_protocols TO anon, authenticated;
GRANT ALL ON public.athlete_protocols TO service_role;
ALTER TABLE public.athlete_protocols ENABLE ROW LEVEL SECURITY;
CREATE POLICY "protocols public read" ON public.athlete_protocols FOR SELECT USING (is_published = true);
CREATE POLICY "protocols admin manage" ON public.athlete_protocols FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) protocol_completions
CREATE TABLE public.protocol_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  protocol_id uuid NOT NULL REFERENCES public.athlete_protocols(id) ON DELETE CASCADE,
  duration_minutes smallint,
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  completed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.protocol_completions TO authenticated;
GRANT ALL ON public.protocol_completions TO service_role;
ALTER TABLE public.protocol_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own completions read" ON public.protocol_completions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own completions insert" ON public.protocol_completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own completions delete" ON public.protocol_completions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_completions_user_time ON public.protocol_completions (user_id, completed_at DESC);

-- 4) Seed 5 starter protocols
INSERT INTO public.athlete_protocols (slug, title, description, category, duration_minutes, focus_areas, steps) VALUES
('box-breathing', 'Box Breathing', 'A four-phase breath cycle to down-regulate the nervous system before competition or after high-stress moments.', 'regulation', 6, ARRAY['stress','focus','recovery'],
  '[{"label":"Inhale 4s"},{"label":"Hold 4s"},{"label":"Exhale 4s"},{"label":"Hold 4s"},{"label":"Repeat for 6 minutes"}]'::jsonb),
('pre-competition-activation', 'Pre-Competition Activation', 'Prime arousal and confidence in the 20 minutes before performance using activation cues, anchoring, and intention setting.', 'performance', 20, ARRAY['confidence','activation','focus'],
  '[{"label":"Body scan and posture reset"},{"label":"Three power cues"},{"label":"Visualize first action"},{"label":"State your intention aloud"}]'::jsonb),
('mental-recovery', 'Mental Recovery', 'Post-session decompression protocol to close the performance loop and protect sleep quality.', 'recovery', 12, ARRAY['recovery','sleep','reflection'],
  '[{"label":"3 minutes slow breathing"},{"label":"Write one win, one lesson"},{"label":"Body scan from feet to head"},{"label":"Set tomorrow''s single intention"}]'::jsonb),
('performance-visualization', 'Performance Visualization', 'Multisensory mental rehearsal protocol to encode successful execution before a key performance.', 'performance', 15, ARRAY['confidence','focus','skill'],
  '[{"label":"Relax with 2 minutes of breathing"},{"label":"See the environment"},{"label":"Feel the movement"},{"label":"Hear the sounds"},{"label":"Rehearse 3 successful reps"}]'::jsonb),
('focus-reset', 'Focus Reset', 'A 5-minute attention reset for mid-session lapses or context switches.', 'focus', 5, ARRAY['focus','attention'],
  '[{"label":"Stop. Three deep breaths"},{"label":"Name what just happened"},{"label":"Choose the next single action"},{"label":"Execute"}]'::jsonb);
