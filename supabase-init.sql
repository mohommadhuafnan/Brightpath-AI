-- Supabase Database Initialization Script
-- Run this in Supabase SQL Editor (Database → SQL Editor)
-- This script creates all necessary tables and Row Level Security policies

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  target_role TEXT,
  years_experience INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- USER_PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- LEARNING_PATHS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  duration_weeks INTEGER DEFAULT 12,
  current_week INTEGER DEFAULT 1,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learning paths" ON public.learning_paths
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning paths" ON public.learning_paths
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning paths" ON public.learning_paths
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- INTERVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  overall_score INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interviews" ON public.interviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interviews" ON public.interviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interviews" ON public.interviews
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_emoji TEXT,
  requirement_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON public.badges
  FOR SELECT USING (true);

-- ============================================
-- USER_BADGES TABLE (Junction Table)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INSERT DEFAULT BADGES
-- ============================================
INSERT INTO public.badges (name, description, icon_emoji, requirement_text) VALUES
  ('First Step', 'Upload your first CV', '📄', 'Upload a CV'),
  ('Skill Master', 'Add 5 skills to your profile', '🎯', 'Add 5 skills'),
  ('Chat Expert', 'Have 10 mentor conversations', '💬', 'Chat 10 times'),
  ('Interview Pro', 'Complete 5 mock interviews', '🎤', 'Complete 5 interviews'),
  ('Level Up', 'Reach level 5', '⭐', 'Reach level 5'),
  ('XP Collector', 'Earn 1000 XP', '💎', 'Earn 1000 XP')
ON CONFLICT DO NOTHING;

-- ============================================
-- TRIGGER: Auto-initialize user_progress on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.initialize_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_progress (user_id, xp_points, level, streak_days)
  VALUES (new.id, 0, 1, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_user_progress_created ON auth.users;

CREATE TRIGGER on_user_progress_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_progress();

-- ============================================
-- INDEXES (For performance)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON public.learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON public.interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);

-- ============================================
-- Verification Queries
-- ============================================
-- Run these after setup to verify everything is correct

-- Check tables exist
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies exist
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Check indexes
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
