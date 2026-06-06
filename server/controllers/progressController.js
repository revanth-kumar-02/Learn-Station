const { supabase } = require('../config/db');

// @desc    Get all progress for current user
// @route   GET /api/progress
const getAllProgress = async (req, res, next) => {
  try {
    // 1. Fetch progress with joined track and current lesson info
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select(`
        *,
        track:tracks(id, slug, name, color, icon),
        current_lesson:lessons(id, slug, title)
      `)
      .eq('user_id', req.user.id);

    if (progressError) throw progressError;

    // 2. Fetch profile details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (profileError) throw profileError;

    // 3. Format response to preserve interface structures
    const formattedProgress = (progress || []).map((p) => ({
      _id: p.id,
      id: p.id,
      completedLessons: p.completed_lessons || [],
      completedChallenges: p.completed_challenges || [],
      currentModule: p.current_module,
      xpEarned: p.xp_earned,
      progressPercent: p.progress_percent,
      track: p.track
        ? {
            _id: p.track.id,
            id: p.track.id,
            slug: p.track.slug,
            name: p.track.name,
            color: p.track.color,
            icon: p.track.icon,
          }
        : null,
      currentLesson: p.current_lesson
        ? {
            _id: p.current_lesson.id,
            id: p.current_lesson.id,
            slug: p.current_lesson.slug,
            title: p.current_lesson.title,
          }
        : null,
    }));

    const todayStr = new Date().toISOString().split('T')[0];
    let dailyXpEarned = profile.daily_xp_earned || 0;
    if (profile.last_active_date) {
      const lastActiveStr = new Date(profile.last_active_date).toISOString().split('T')[0];
      if (lastActiveStr !== todayStr) {
        dailyXpEarned = 0;
      }
    }

    res.json({
      progress: formattedProgress,
      streak: profile.streak,
      longestStreak: profile.longest_streak,
      dailyXpGoal: profile.daily_xp_goal,
      dailyXpEarned,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get progress for a specific track
// @route   GET /api/progress/:trackSlug
const getTrackProgress = async (req, res, next) => {
  try {
    // 1. Find track by slug
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('id')
      .eq('slug', req.params.trackSlug)
      .maybeSingle();

    if (trackError || !track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // 2. Find progress record
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('track_id', track.id)
      .maybeSingle();

    if (progressError) throw progressError;

    // 3. If progress exists, populate related items manually for Mongoose compliance
    let completedLessonsPopulated = [];
    let currentLessonPopulated = null;

    if (progress) {
      if (progress.completed_lessons && progress.completed_lessons.length > 0) {
        const { data: completedLessonsData } = await supabase
          .from('lessons')
          .select('id, slug, title')
          .in('id', progress.completed_lessons);
        
        completedLessonsPopulated = (completedLessonsData || []).map((l) => ({
          _id: l.id,
          id: l.id,
          slug: l.slug,
          title: l.title,
        }));
      }

      if (progress.current_lesson) {
        const { data: currentLessonData } = await supabase
          .from('lessons')
          .select('id, slug, title')
          .eq('id', progress.current_lesson)
          .maybeSingle();
        
        if (currentLessonData) {
          currentLessonPopulated = {
            _id: currentLessonData.id,
            id: currentLessonData.id,
            slug: currentLessonData.slug,
            title: currentLessonData.title,
          };
        }
      }
    }

    res.json({
      progress: progress
        ? {
            _id: progress.id,
            id: progress.id,
            completedLessons: completedLessonsPopulated,
            completedChallenges: progress.completed_challenges || [],
            xpEarned: progress.xp_earned,
            progressPercent: progress.progress_percent,
            currentModule: progress.current_module,
            currentLesson: currentLessonPopulated,
          }
        : {
            completedLessons: [],
            completedChallenges: [],
            xpEarned: 0,
            progressPercent: 0,
            currentModule: null,
            currentLesson: null,
          },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllProgress, getTrackProgress };
