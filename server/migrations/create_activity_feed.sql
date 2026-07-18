-- Migration: Create Activity Feed Table
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  user_avatar TEXT,
  activity_type TEXT NOT NULL, -- 'lesson_completed', 'track_started', 'track_completed', 'badge_earned', 'group_joined', 'resource_uploaded'
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Select policy: Allow anyone to view activities
CREATE POLICY "Allow public read of activity_feed"
  ON public.activity_feed FOR SELECT USING (true);

-- Insert policy: Allow authenticated users to insert their own activity
CREATE POLICY "Allow authenticated insert of activity_feed"
  ON public.activity_feed FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable Realtime for the table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'activity_feed'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_feed;
  END IF;
END $$;
