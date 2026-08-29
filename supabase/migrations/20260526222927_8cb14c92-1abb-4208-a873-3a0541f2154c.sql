ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS ai_summary text,
  ADD COLUMN IF NOT EXISTS themes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS synthesized_at timestamptz;