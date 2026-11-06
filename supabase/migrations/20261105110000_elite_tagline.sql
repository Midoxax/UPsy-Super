-- "Top 1%" was a claim nothing backs up. Match the French and Arabic copy.
UPDATE public.membership_plans
SET tagline = 'The most complete level'
WHERE tier::text = 'elite' AND tagline = 'Top 1%';
