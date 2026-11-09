-- Validated psychometric instruments.
--
-- `code` links an assessment to its definition in src/lib/psychometrics,
-- which holds the official item text and the manual's scoring (reverse keys,
-- subscales, cut-offs, safety flags). Rows without a code are U.Psy's own
-- indicative self-checks, scored generically and labelled as such.
ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS code text,
  ADD COLUMN IF NOT EXISTS is_validated boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS assessments_code_key
  ON public.assessments (code) WHERE code IS NOT NULL;

-- Existing PHQ-9 and GAD-7 become the validated versions.
UPDATE public.assessments SET code = 'phq9', is_validated = true, question_count = 9, estimated_minutes = 3
  WHERE code IS NULL AND title ILIKE '%PHQ-9%';
UPDATE public.assessments SET code = 'gad7', is_validated = true, question_count = 7, estimated_minutes = 2
  WHERE code IS NULL AND title ILIKE '%GAD-7%';

-- The 5-item "PCL-5 Short" is not a published form; the full PCL-5 replaces it.
UPDATE public.assessments SET is_published = false
  WHERE code IS NULL AND title = 'PTSD Screening (PCL-5 Short)';

INSERT INTO public.assessments (title, description, category, question_count, estimated_minutes, is_published, code, is_validated)
SELECT v.title, v.description, 'general', v.n, v.minutes, true, v.code, true
FROM (VALUES
  ('WHO-5 Well-Being Index', 'Well-being over the last two weeks, 0–100.', 5, 1, 'who5'),
  ('DASS-21', 'Depression, anxiety and stress over the past week.', 21, 5, 'dass21'),
  ('PTSD Checklist for DSM-5 (PCL-5)', 'Post-traumatic stress symptoms over the past month.', 20, 7, 'pcl5'),
  ('AUDIT', 'WHO alcohol use risk test.', 10, 3, 'audit'),
  ('Kessler Psychological Distress Scale (K6)', 'Psychological distress over the past month.', 6, 2, 'k6')
) AS v(title, description, n, minutes, code)
WHERE NOT EXISTS (SELECT 1 FROM public.assessments a WHERE a.code = v.code);

-- Home-made questionnaires keep working but stop borrowing the names of
-- copyrighted scales (PSQI, MBI, CSAI-2): they are indicative self-checks.
UPDATE public.assessments SET title = 'Sleep habits self-check' WHERE title = 'Sleep Quality Index';
UPDATE public.assessments SET title = 'Burnout self-check' WHERE title = 'Burnout Assessment';
UPDATE public.assessments SET title = 'Competition anxiety self-check' WHERE title = 'Competition Anxiety Inventory';
UPDATE public.assessments SET title = 'Resilience self-check' WHERE title = 'Psychological Resilience Scale';
UPDATE public.assessments SET title = 'Social anxiety self-check' WHERE title = 'Social Anxiety Scale';
UPDATE public.assessments SET title = 'Stress self-check' WHERE title = 'Stress Perception Scale';
UPDATE public.assessments SET title = 'Emotional intelligence self-check' WHERE title = 'Emotional Intelligence Assessment';
UPDATE public.assessments SET title = 'Personality self-check (Big Five)' WHERE title = 'Big Five Personality (Mini)';
