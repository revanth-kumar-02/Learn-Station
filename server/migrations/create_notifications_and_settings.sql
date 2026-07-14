-- Migrations for Notification Center & Settings Center

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Learning', 'Achievement', 'XP', 'Level Up', 'Badge', 'Certificate', 'AI', 'Announcement', 'Admin', 'Leaderboard', 'Streak'
  icon TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Create User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Appearance
  theme TEXT NOT NULL DEFAULT 'light',
  code_editor_theme TEXT NOT NULL DEFAULT 'vs-dark',
  font_size TEXT NOT NULL DEFAULT 'medium', -- 'small', 'medium', 'large'
  compact_mode BOOLEAN NOT NULL DEFAULT false,
  reduce_animations BOOLEAN NOT NULL DEFAULT false,
  -- Notifications
  lesson_notifications BOOLEAN NOT NULL DEFAULT true,
  achievement_notifications BOOLEAN NOT NULL DEFAULT true,
  ai_notifications BOOLEAN NOT NULL DEFAULT true,
  certificate_notifications BOOLEAN NOT NULL DEFAULT true,
  announcement_notifications BOOLEAN NOT NULL DEFAULT true,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT false,
  -- Privacy
  public_profile BOOLEAN NOT NULL DEFAULT true,
  show_xp BOOLEAN NOT NULL DEFAULT true,
  show_badges BOOLEAN NOT NULL DEFAULT true,
  show_certificates BOOLEAN NOT NULL DEFAULT true,
  show_learning_history BOOLEAN NOT NULL DEFAULT true,
  show_current_track BOOLEAN NOT NULL DEFAULT true,
  -- Learning Preferences
  daily_goal INTEGER NOT NULL DEFAULT 50,
  reminder_time TEXT NOT NULL DEFAULT '20:00',
  preferred_learning_time TEXT NOT NULL DEFAULT 'evening',
  preferred_learning_track TEXT,
  weekly_goal INTEGER NOT NULL DEFAULT 250,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for user settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Notifications: Users can view/update/delete their own notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view/manage all notifications" 
  ON public.notifications 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'admin' OR profiles.role = 'owner')
    )
  );

-- User Settings: Users can manage their own settings
CREATE POLICY "Users can manage their own settings"
  ON public.user_settings
  FOR ALL
  USING (auth.uid() = user_id);

-- 4. Enable Supabase Realtime for Notifications Table
-- Add table to publication if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
