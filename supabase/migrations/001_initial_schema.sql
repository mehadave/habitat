-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  phone text,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  dark_mode boolean DEFAULT true,
  level integer DEFAULT 1,
  total_xp integer DEFAULT 0
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- HABITS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.habits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  emoji text DEFAULT '⭐',
  description text,
  color text DEFAULT '#2563EB',
  is_private boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  sort_order integer DEFAULT 0,
  star_rating integer DEFAULT 0 CHECK (star_rating BETWEEN 0 AND 5)
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own habits" ON public.habits
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- HABIT COMPLETIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id uuid NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  completed_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, completed_date)
);

ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own completions" ON public.habit_completions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- STREAKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.streaks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id uuid NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_completed_date date,
  streak_start_date date,
  UNIQUE(habit_id, user_id)
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own streaks" ON public.streaks
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- JOURNAL ENTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  mood_score integer CHECK (mood_score BETWEEN 1 AND 10),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own journal entries" ON public.journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- XP EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.xp_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  habit_id uuid REFERENCES public.habits(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  xp_gained integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own XP events" ON public.xp_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own XP events" ON public.xp_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- UPDATE STREAK HELPER
-- ============================================================
CREATE OR REPLACE FUNCTION public.upsert_streak(
  p_habit_id uuid,
  p_user_id uuid,
  p_date date
)
RETURNS void AS $$
DECLARE
  v_streak record;
  v_new_current integer;
  v_new_longest integer;
BEGIN
  SELECT * INTO v_streak FROM public.streaks
  WHERE habit_id = p_habit_id AND user_id = p_user_id;

  IF v_streak IS NULL THEN
    INSERT INTO public.streaks (habit_id, user_id, current_streak, longest_streak, last_completed_date, streak_start_date)
    VALUES (p_habit_id, p_user_id, 1, 1, p_date, p_date);
  ELSE
    IF v_streak.last_completed_date = p_date - 1 THEN
      v_new_current := v_streak.current_streak + 1;
    ELSIF v_streak.last_completed_date = p_date THEN
      v_new_current := v_streak.current_streak;
    ELSE
      v_new_current := 1;
    END IF;
    v_new_longest := GREATEST(v_streak.longest_streak, v_new_current);
    UPDATE public.streaks
    SET current_streak = v_new_current,
        longest_streak = v_new_longest,
        last_completed_date = p_date,
        streak_start_date = CASE WHEN v_new_current = 1 THEN p_date ELSE v_streak.streak_start_date END
    WHERE habit_id = p_habit_id AND user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
