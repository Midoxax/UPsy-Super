-- French and Arabic copy for community spaces (Training Center).
-- English stays in name/description; pages fall back to it when empty.

ALTER TABLE public.community_spaces
  ADD COLUMN IF NOT EXISTS name_fr text,
  ADD COLUMN IF NOT EXISTS name_ar text,
  ADD COLUMN IF NOT EXISTS description_fr text,
  ADD COLUMN IF NOT EXISTS description_ar text;

-- Fill only what is empty, so edits made in the admin are never overwritten.
UPDATE public.community_spaces AS s SET
  name_fr = COALESCE(s.name_fr, v.name_fr),
  description_fr = COALESCE(s.description_fr, v.description_fr),
  name_ar = COALESCE(s.name_ar, v.name_ar),
  description_ar = COALESCE(s.description_ar, v.description_ar)
FROM (VALUES
  ('casablanca', 'Pôle Casablanca', 'Rencontres et échanges en local.', 'فضاء الدار البيضاء', 'لقاءات ونقاشات محلية.'),
  ('combat-psychology', 'Psychologie des sports de combat', 'État d''esprit, rituels d''avant-combat, récupération après une défaite.', 'علم نفس رياضات القتال', 'العقلية، طقوس ما قبل النزال، والتعافي بعد الهزيمة.'),
  ('elite-mastermind', 'Mastermind Élite', 'Mastermind privé pour les membres Élite.', 'مجموعة النخبة', 'مجموعة خاصة لأعضاء باقة النخبة.'),
  ('intro-cohort-q1', 'Cohorte Fondamentaux — T1', 'Cohorte d''intégration de 8 semaines à la psychologie de la performance.', 'مجموعة الأسس — الفصل الأول', 'مجموعة إدماج من 8 أسابيع في علم نفس الأداء.'),
  ('mindfulness', 'Laboratoire de pleine conscience', 'Pratique quotidienne, respiration, entraînement de l''attention.', 'مختبر اليقظة الذهنية', 'ممارسة يومية، تمارين التنفس، وتدريب الانتباه.'),
  ('practitioners-circle', 'Cercle des praticiens', 'Intervision, discussions de cas, formation continue.', 'دائرة الممارسين', 'إشراف بين الأقران، مناقشة الحالات، والتكوين المستمر.')
) AS v(slug, name_fr, description_fr, name_ar, description_ar)
WHERE s.slug = v.slug;
