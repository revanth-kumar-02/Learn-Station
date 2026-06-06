const { supabase } = require('../config/db');

// @desc    Get all tracks with user progress
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

    // Fetch all lessons and modules to calculate slugs and progression rules
    const { data: allLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, slug, track_id, display_order, module_id');

    if (lessonsError) throw lessonsError;

    const { data: allModules, error: modulesError } = await supabase
      .from('modules')
      .select('id, track_id, display_order');

    if (modulesError) throw modulesError;

    // Group modules by track
    const modulesByTrack = {};
    (allModules || []).forEach(m => {
      if (!modulesByTrack[m.track_id]) modulesByTrack[m.track_id] = [];
      modulesByTrack[m.track_id].push(m);
    });

    // Sort lessons per track using module orders and display_order
    const firstLessonSlugMap = {};
    const lessonsMap = {};
    (allLessons || []).forEach(l => {
      lessonsMap[l.id] = l;
    });

    Object.keys(modulesByTrack).forEach(trackId => {
      const trackMods = modulesByTrack[trackId].sort((a, b) => a.display_order - b.display_order);
      const modOrder = {};
      trackMods.forEach((m, idx) => {
        modOrder[m.id] = idx;
      });

      const trackLessons = (allLessons || [])
        .filter(l => l.track_id === trackId)
        .sort((a, b) => {
          const aMod = modOrder[a.module_id] ?? 0;
          const bMod = modOrder[b.module_id] ?? 0;
          if (aMod !== bMod) return aMod - bMod;
          return a.display_order - b.display_order;
        });

      if (trackLessons.length > 0) {
        firstLessonSlugMap[trackId] = trackLessons[0].slug;
      }
    });

    const progressMap = {};
    (progressList || []).forEach((p) => {
      const currentLessonSlug = p.current_lesson ? (lessonsMap[p.current_lesson]?.slug || firstLessonSlugMap[p.track_id] || '') : (firstLessonSlugMap[p.track_id] || '');
      progressMap[p.track_id] = {
        completedLessons: p.completed_lessons?.length || 0,
        xpEarned: p.xp_earned,
        progressPercent: p.progress_percent,
        currentModule: p.current_module,
        currentLesson: p.current_lesson,
        currentLessonSlug,
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
      isAiGenerated: track.is_ai_generated,
      progress: progressMap[track.id] || {
        completedLessons: 0,
        xpEarned: 0,
        progressPercent: 0,
        currentModule: null,
        currentLesson: null,
        currentLessonSlug: firstLessonSlugMap[track.id] || '',
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

    // Fetch challenges to know which ones belong to which lesson
    const lessonIds = (lessons || []).map(l => l.id);
    const challengeIdsMap = {};
    if (lessonIds.length > 0) {
      const { data: challenges, error: challengesError } = await supabase
        .from('challenges')
        .select('id, lesson_id')
        .in('lesson_id', lessonIds);

      if (!challengesError && challenges) {
        challenges.forEach(c => {
          if (!challengeIdsMap[c.lesson_id]) {
            challengeIdsMap[c.lesson_id] = [];
          }
          challengeIdsMap[c.lesson_id].push(c.id);
        });
      }
    }

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
          challengeIds: challengeIdsMap[l.id] || [],
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
      capstone_project: track.capstone_project || {},
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
