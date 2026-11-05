-- French and Arabic copy for courses and membership plans.
-- English stays in title/description and name/tagline; pages pick the
-- column for the visitor's language and fall back to English when empty.

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS title_fr text,
  ADD COLUMN IF NOT EXISTS title_ar text,
  ADD COLUMN IF NOT EXISTS description_fr text,
  ADD COLUMN IF NOT EXISTS description_ar text;

ALTER TABLE public.membership_plans
  ADD COLUMN IF NOT EXISTS name_fr text,
  ADD COLUMN IF NOT EXISTS name_ar text,
  ADD COLUMN IF NOT EXISTS tagline_fr text,
  ADD COLUMN IF NOT EXISTS tagline_ar text;

-- Fill only what is empty, so edits made in the admin are never overwritten.
UPDATE public.courses AS c SET
  title_fr = COALESCE(c.title_fr, v.title_fr),
  description_fr = COALESCE(c.description_fr, v.description_fr),
  title_ar = COALESCE(c.title_ar, v.title_ar),
  description_ar = COALESCE(c.description_ar, v.description_ar)
FROM (VALUES
  ('corporate-wellbeing-program-f5b30f', 'Programme de bien-être en entreprise', 'Mettre en place une stratégie de santé mentale au travail', 'برنامج الرفاه في المؤسسة', 'وضع استراتيجيات للصحة النفسية في مكان العمل'),
  ('leadership-psychology-9aac9e', 'Psychologie du leadership', 'Les principes psychologiques d''un leadership efficace', 'علم نفس القيادة', 'المبادئ النفسية للقيادة الفعالة'),
  ('mental-resilience-training-bedff3', 'Entraînement à la résilience mentale', 'Développer sa résilience psychologique par des exercices structurés', 'التدريب على الصلابة الذهنية', 'بناء المرونة النفسية عبر تمارين منظمة'),
  ('pre-competition-mental-preparation-5a2ebe', 'Préparation mentale avant la compétition', 'Visualisation, concentration et gestion de l''anxiété pour les sportifs', 'التحضير الذهني قبل المنافسة', 'التخيل والتركيز وتدبير القلق لدى الرياضيين'),
  ('sport-psychology-fundamentals-756683', 'Fondamentaux de la psychologie du sport', 'Introduction à la performance mentale en sport de compétition', 'أسس علم النفس الرياضي', 'مدخل إلى الأداء الذهني في الرياضة التنافسية'),
  ('stress-management-essentials-a0c0c6', 'L''essentiel de la gestion du stress', 'Des outils et techniques concrets pour gérer le stress au quotidien', 'أساسيات تدبير الضغط', 'أدوات وتقنيات عملية لتدبير الضغط اليومي'),
  ('understanding-anxiety-7adcee', 'Comprendre l''anxiété', 'Les troubles anxieux, leurs causes et les méthodes de prise en charge fondées sur les preuves', 'فهم القلق', 'اضطرابات القلق وأسبابها وطرق تدبيرها القائمة على الأدلة')
) AS v(slug, title_fr, description_fr, title_ar, description_ar)
WHERE c.slug = v.slug;

UPDATE public.membership_plans AS p SET
  name_fr = COALESCE(p.name_fr, v.name_fr),
  tagline_fr = COALESCE(p.tagline_fr, v.tagline_fr),
  name_ar = COALESCE(p.name_ar, v.name_ar),
  tagline_ar = COALESCE(p.tagline_ar, v.tagline_ar)
FROM (VALUES
  ('discover', 'Découverte', 'Pour commencer', 'اكتشاف', 'للبدء'),
  ('student', 'Étudiant', 'Pour celles et ceux qui apprennent', 'طالب', 'للمتعلمين'),
  ('athlete', 'Sportif', 'Pour les sportifs', 'رياضي', 'للرياضيين'),
  ('coach', 'Coach', 'Pour les entraîneurs', 'مدرب', 'للمدربين'),
  ('practitioner', 'Praticien', 'Pour les spécialistes', 'ممارس', 'للمختصين'),
  ('organization', 'Organisation', 'Pour les clubs, salles et équipes', 'مؤسسة', 'للأندية والقاعات والفرق'),
  ('elite', 'Élite', 'Le niveau le plus complet', 'نخبة', 'المستوى الأكثر تكاملاً')
) AS v(tier, name_fr, tagline_fr, name_ar, tagline_ar)
WHERE p.tier::text = v.tier;
