-- Reviewer role for the League of Specialists in Psychological and Mental
-- Health (LSSPM). Its own migration: a new enum value cannot be used in the
-- transaction that adds it, and the next migration's policies use it.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'league';
