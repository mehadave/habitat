-- ============================================================
-- ROUTINES (habit grouping / habit stacking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.routines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  emoji text DEFAULT '🌅',
  time_of_day text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own routines" ON public.routines
  FOR ALL USING (auth.uid() = user_id);

-- Add routine_id to habits (nullable — habits without a routine are uncategorized)
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS routine_id uuid REFERENCES public.routines(id) ON DELETE SET NULL;
