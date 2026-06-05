const { supabase } = require('../config/db');

// @desc    Get all tracks with user progress
// @route   GET /api/tracks
const getTracks = async (req, res, next) => {
  try {
    // 1. Fetch tracks: either public (non-AI) tracks OR tracks created by this user
    const { data: tracks, error: tracksError } = await supabase
      .from('tracks')
      .select('*')
      .or(`is_ai_generated.eq.false,user_id.eq.${req.user.id}`)
      .order('display_order');

    if (tracksError) throw tracksError;

    // 2. Fetch progress for the current user
    const { data: progressList, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', req.user.id);

    if (progressError) throw progressError;

    const progressMap = {};
    (progressList || []).forEach((p) => {
      progressMap[p.track_id] = {
        completedLessons: p.completed_lessons?.length || 0,
        xpEarned: p.xp_earned,
        progressPercent: p.progress_percent,
        currentModule: p.current_module,
        lastAccessedAt: p.last_accessed_at,
      };
    });

    // 3. Format response to match the frontend expectations
    const tracksWithProgress = (tracks || []).map((track) => ({
      _id: track.id,
      id: track.id,
      slug: track.slug,
      name: track.name,
      description: track.description,
      icon: track.icon,
      color: track.color,
      order: track.display_order,
      totalLessons: track.total_lessons,
      progress: progressMap[track.id] || {
        completedLessons: 0,
        xpEarned: 0,
        progressPercent: 0,
        currentModule: null,
        lastAccessedAt: null,
      },
    }));

    res.json({ tracks: tracksWithProgress });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single track with full details
// @route   GET /api/tracks/:slug
const getTrack = async (req, res, next) => {
  try {
    // 1. Fetch track details
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('*')
      .eq('slug', req.params.slug)
      .or(`is_ai_generated.eq.false,user_id.eq.${req.user.id}`)
      .maybeSingle();

    if (trackError || !track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // 2. Fetch modules for this track
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .eq('track_id', track.id)
      .order('display_order');

    if (modulesError) throw modulesError;

    // 3. Fetch lessons for this track
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, slug, title, display_order, estimated_minutes, xp_reward, module_id')
      .eq('track_id', track.id)
      .order('display_order');

    if (lessonsError) throw lessonsError;

    // 4. Map lessons inside modules
    const trackModules = (modules || []).map((mod) => ({
      id: mod.id,
      name: mod.name,
      order: mod.display_order,
      lessons: (lessons || [])
        .filter((l) => l.module_id === mod.id)
        .map((l) => ({
          _id: l.id,
          id: l.id,
          slug: l.slug,
          title: l.title,
          order: l.display_order,
          estimatedMinutes: l.estimated_minutes,
          xpReward: l.xp_reward,
          moduleId: l.module_id,
        })),
    }));

    // 5. Fetch progress
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('track_id', track.id)
      .maybeSingle();

    if (progressError) throw progressError;

    const formattedTrack = {
      _id: track.id,
      id: track.id,
      slug: track.slug,
      name: track.name,
      description: track.description,
      icon: track.icon,
      color: track.color,
      totalLessons: track.total_lessons,
      modules: trackModules,
    };

    const formattedProgress = progress
      ? {
          completedLessons: progress.completed_lessons || [],
          completedChallenges: progress.completed_challenges || [],
          xpEarned: progress.xp_earned,
          progressPercent: progress.progress_percent,
          currentModule: progress.current_module,
          currentLesson: progress.current_lesson,
        }
      : {
          completedLessons: [],
          completedChallenges: [],
          xpEarned: 0,
          progressPercent: 0,
          currentModule: null,
          currentLesson: null,
        };

    res.json({
      track: formattedTrack,
      progress: formattedProgress,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTracks, getTrack };
