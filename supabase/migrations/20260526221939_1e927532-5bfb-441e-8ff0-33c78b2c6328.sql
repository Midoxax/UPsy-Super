
-- Seed 4 additional skill trees and 8 starter quests for the Training Center progression system.

INSERT INTO public.skill_trees (slug, name, domain, description, tree, is_active) VALUES
('resilience', 'Resilience Path', 'resilience', 'Build psychological flexibility, recovery skills, and adversity tolerance.',
$$
{
  "nodes": [
    { "id": "root",        "label": "Self-Awareness",        "xp": 0,    "requires": [] },
    { "id": "reframe",     "label": "Cognitive Reframing",   "xp": 75,   "requires": ["root"] },
    { "id": "regulation",  "label": "Emotion Regulation",    "xp": 75,   "requires": ["root"] },
    { "id": "tolerance",   "label": "Distress Tolerance",    "xp": 200,  "requires": ["reframe","regulation"] },
    { "id": "recovery",    "label": "Recovery Protocols",    "xp": 350,  "requires": ["tolerance"] },
    { "id": "antifragile", "label": "Antifragile Mindset",   "xp": 700,  "requires": ["recovery"] }
  ]
}
$$::jsonb, true),

('combat-psychology', 'Combat Psychology', 'combat', 'Mental skills for combat athletes — fear, aggression control, ring intelligence.',
$$
{
  "nodes": [
    { "id": "root",      "label": "Fight Mindset",        "xp": 0,    "requires": [] },
    { "id": "arousal",   "label": "Arousal Control",      "xp": 100,  "requires": ["root"] },
    { "id": "focus",     "label": "Tunnel Focus",         "xp": 100,  "requires": ["root"] },
    { "id": "ringiq",    "label": "Ring IQ",              "xp": 250,  "requires": ["arousal","focus"] },
    { "id": "loss",      "label": "Loss Recovery",        "xp": 400,  "requires": ["ringiq"] },
    { "id": "killer",    "label": "Killer Instinct",      "xp": 800,  "requires": ["loss"] }
  ]
}
$$::jsonb, true),

('clinical-foundations', 'Clinical Foundations', 'clinical', 'Core competencies for emerging practitioners — ethics, assessment, formulation.',
$$
{
  "nodes": [
    { "id": "root",        "label": "Therapeutic Alliance", "xp": 0,    "requires": [] },
    { "id": "ethics",      "label": "Ethics & Boundaries",  "xp": 100,  "requires": ["root"] },
    { "id": "assessment",  "label": "Clinical Assessment",  "xp": 150,  "requires": ["ethics"] },
    { "id": "formulation", "label": "Case Formulation",     "xp": 300,  "requires": ["assessment"] },
    { "id": "cbt",         "label": "CBT Core",             "xp": 500,  "requires": ["formulation"] },
    { "id": "supervision", "label": "Supervision-Ready",    "xp": 900,  "requires": ["cbt"] }
  ]
}
$$::jsonb, true),

('performance', 'Performance Optimization', 'performance', 'Pre-competition rituals, visualization, energy management.',
$$
{
  "nodes": [
    { "id": "root",          "label": "Baseline Awareness",   "xp": 0,    "requires": [] },
    { "id": "visualization", "label": "Visualization",        "xp": 100,  "requires": ["root"] },
    { "id": "ritual",        "label": "Pre-Comp Ritual",      "xp": 150,  "requires": ["root"] },
    { "id": "flow",          "label": "Flow Triggers",        "xp": 300,  "requires": ["visualization","ritual"] },
    { "id": "energy",        "label": "Energy Management",    "xp": 500,  "requires": ["flow"] },
    { "id": "peak",          "label": "Peak Performance",     "xp": 900,  "requires": ["energy"] }
  ]
}
$$::jsonb, true)
ON CONFLICT (slug) DO NOTHING;


-- Seed starter quests (multi-step missions). Steps shape:
-- [{ "id": "s1", "label": "...", "kind": "lesson|protocol|journal|checkin|booking", "target": 1 }]
INSERT INTO public.quests (slug, title, description, category, steps, xp_reward, tier_required) VALUES
('first-week', 'First Week Foundations', 'Lay the foundation — daily check-in, first lesson, first journal entry.', 'onboarding',
$$
[
  { "id": "checkin", "label": "Complete 3 daily check-ins", "kind": "checkin", "target": 3 },
  { "id": "lesson",  "label": "Finish your first lesson",   "kind": "lesson",  "target": 1 },
  { "id": "journal", "label": "Write your first journal",   "kind": "journal", "target": 1 }
]
$$::jsonb, 150, 'discover'),

('breath-mastery', 'Breath Mastery', 'Build a daily breathwork practice over 14 days.', 'mindfulness',
$$
[
  { "id": "boxbreath", "label": "Complete Box Breathing 5x", "kind": "protocol", "target": 5 },
  { "id": "478",       "label": "Complete 4-7-8 protocol 3x", "kind": "protocol", "target": 3 },
  { "id": "reflect",   "label": "Reflect in journal twice",   "kind": "journal",  "target": 2 }
]
$$::jsonb, 250, 'discover'),

('pre-fight-prep', 'Pre-Fight Prep', '14-day countdown ritual for combat athletes.', 'performance',
$$
[
  { "id": "visualization", "label": "Visualization sessions x7", "kind": "protocol", "target": 7 },
  { "id": "checkin",       "label": "Daily readiness check-ins x14", "kind": "checkin", "target": 14 },
  { "id": "coach",         "label": "1 coach session",           "kind": "booking",  "target": 1 }
]
$$::jsonb, 500, 'athlete'),

('post-loss-recovery', 'Post-Loss Recovery', 'Process a setback with structure and emerge stronger.', 'resilience',
$$
[
  { "id": "journal",   "label": "3 reflective journal entries", "kind": "journal",  "target": 3 },
  { "id": "protocol",  "label": "2 recovery protocols",         "kind": "protocol", "target": 2 },
  { "id": "checkin",   "label": "7 daily check-ins",            "kind": "checkin",  "target": 7 }
]
$$::jsonb, 400, 'athlete'),

('foundations-of-focus', 'Foundations of Focus', 'Train attention with progressive lessons and protocols.', 'mindfulness',
$$
[
  { "id": "lessons",   "label": "Complete 5 focus lessons", "kind": "lesson",   "target": 5 },
  { "id": "protocol",  "label": "Run Attention Anchor 5x",  "kind": "protocol", "target": 5 }
]
$$::jsonb, 350, 'student'),

('clinician-essentials', 'Clinician Essentials', 'Ethics, alliance, and formulation — the practitioner starter quest.', 'clinical',
$$
[
  { "id": "lessons",  "label": "Complete 8 clinical lessons", "kind": "lesson", "target": 8 },
  { "id": "journal",  "label": "3 case-reflection entries",   "kind": "journal","target": 3 }
]
$$::jsonb, 600, 'practitioner'),

('30-day-streak', '30-Day Reflective Streak', 'Show up for 30 consecutive days of journaling and check-ins.', 'consistency',
$$
[
  { "id": "checkin", "label": "30 daily check-ins", "kind": "checkin", "target": 30 },
  { "id": "journal", "label": "20 journal entries", "kind": "journal", "target": 20 }
]
$$::jsonb, 750, 'discover'),

('elite-mastermind', 'Elite Mastermind', 'Cross-domain mastery — top of every pillar.', 'mastery',
$$
[
  { "id": "lessons",  "label": "Finish 25 lessons",          "kind": "lesson",   "target": 25 },
  { "id": "protocol", "label": "Run 30 performance protocols","kind": "protocol","target": 30 },
  { "id": "journal",  "label": "40 journal entries",         "kind": "journal",  "target": 40 }
]
$$::jsonb, 2000, 'elite')

ON CONFLICT (slug) DO NOTHING;


-- Helper RPC: increment a quest step counter atomically.
-- Used by client/edge actions to record progress without races.
CREATE OR REPLACE FUNCTION public.quest_increment(
  _quest_slug text,
  _step_id    text,
  _delta      integer DEFAULT 1
) RETURNS public.user_quest_progress
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_quest public.quests%ROWTYPE;
  v_row public.user_quest_progress%ROWTYPE;
  v_counts jsonb;
  v_done boolean := true;
  v_step jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO v_quest FROM public.quests WHERE slug = _quest_slug AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'quest not found';
  END IF;

  INSERT INTO public.user_quest_progress (user_id, quest_slug, step_idx, state)
  VALUES (v_uid, _quest_slug, 0, '{}'::jsonb)
  ON CONFLICT (user_id, quest_slug) DO NOTHING;

  SELECT * INTO v_row FROM public.user_quest_progress
   WHERE user_id = v_uid AND quest_slug = _quest_slug FOR UPDATE;

  v_counts := COALESCE(v_row.state->'counts', '{}'::jsonb);
  v_counts := jsonb_set(
    v_counts,
    ARRAY[_step_id],
    to_jsonb(COALESCE((v_counts->>_step_id)::int, 0) + _delta),
    true
  );

  FOR v_step IN SELECT * FROM jsonb_array_elements(v_quest.steps) LOOP
    IF COALESCE((v_counts->>(v_step->>'id'))::int, 0) < COALESCE((v_step->>'target')::int, 1) THEN
      v_done := false;
      EXIT;
    END IF;
  END LOOP;

  UPDATE public.user_quest_progress
     SET state = jsonb_set(v_row.state, '{counts}', v_counts, true),
         completed_at = CASE WHEN v_done AND completed_at IS NULL THEN now() ELSE completed_at END
   WHERE id = v_row.id
   RETURNING * INTO v_row;

  -- Award XP once on completion
  IF v_done AND v_row.completed_at IS NOT NULL THEN
    INSERT INTO public.xp_events (user_id, action, xp, source_id, source_type)
    SELECT v_uid, 'quest.complete', v_quest.xp_reward, _quest_slug, 'quest'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.xp_events
       WHERE user_id = v_uid AND source_type = 'quest' AND source_id = _quest_slug
    );
  END IF;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.quest_increment(text, text, integer) TO authenticated;


-- Helper RPC: unlock a skill node if XP requirement met and prerequisites unlocked.
CREATE OR REPLACE FUNCTION public.skill_unlock(
  _tree_slug text,
  _node_id   text
) RETURNS public.user_skill_nodes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_tree public.skill_trees%ROWTYPE;
  v_node jsonb;
  v_req text;
  v_xp_total int;
  v_required_xp int;
  v_row public.user_skill_nodes%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  SELECT * INTO v_tree FROM public.skill_trees WHERE slug = _tree_slug AND is_active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'tree not found'; END IF;

  SELECT n INTO v_node
    FROM jsonb_array_elements(v_tree.tree->'nodes') n
   WHERE n->>'id' = _node_id;
  IF v_node IS NULL THEN RAISE EXCEPTION 'node not found'; END IF;

  v_required_xp := COALESCE((v_node->>'xp')::int, 0);
  SELECT COALESCE(SUM(xp), 0) INTO v_xp_total FROM public.xp_events WHERE user_id = v_uid;
  IF v_xp_total < v_required_xp THEN
    RAISE EXCEPTION 'insufficient xp';
  END IF;

  FOR v_req IN SELECT jsonb_array_elements_text(COALESCE(v_node->'requires','[]'::jsonb)) LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.user_skill_nodes
       WHERE user_id = v_uid AND tree_slug = _tree_slug AND node_id = v_req
    ) THEN
      RAISE EXCEPTION 'prerequisite not unlocked: %', v_req;
    END IF;
  END LOOP;

  INSERT INTO public.user_skill_nodes (user_id, tree_slug, node_id)
  VALUES (v_uid, _tree_slug, _node_id)
  ON CONFLICT (user_id, tree_slug, node_id) DO NOTHING
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    SELECT * INTO v_row FROM public.user_skill_nodes
     WHERE user_id = v_uid AND tree_slug = _tree_slug AND node_id = _node_id;
  END IF;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.skill_unlock(text, text) TO authenticated;
