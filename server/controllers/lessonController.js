const { supabase } = require('../config/db');
const { calculateLevel, checkAchievements } = require('../utils/xpCalculator');

// @desc    Get lesson by slug
// @route   GET /api/lessons/:slug
const getLesson = async (req, res, next) => {
  try {
    // 1. Fetch lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('slug', req.params.slug)
      .maybeSingle();

    if (lessonError || !lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // 2. Fetch challenges for the lesson
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .eq('lesson_id', lesson.id);

    if (challengesError) throw challengesError;

    // 3. Get user progress to know completion status
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('track_id', lesson.track_id)
      .maybeSingle();

    if (progressError) throw progressError;

    const isCompleted = progress
      ? (progress.completed_lessons || []).includes(lesson.id)
      : false;

    // Format response to match mongoose object properties
    const formattedLesson = {
      _id: lesson.id,
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      track: lesson.track_id,
      moduleId: lesson.module_id,
      order: lesson.display_order,
      estimatedMinutes: lesson.estimated_minutes,
      xpReward: lesson.xp_reward,
      concept: {
        title: lesson.concept_title,
        content: lesson.concept_content,
        highlights: lesson.concept_highlights || [],
      },
      example: {
        language: lesson.example_language,
        code: lesson.example_code,
        explanation: lesson.example_explanation,
      },
      practice: {
        type: lesson.practice_type,
        instruction: lesson.practice_instruction,
        template: lesson.practice_template,
        answer: lesson.practice_answer,
      },
      challenges: (challenges || []).map((c) => ({
        _id: c.id,
        id: c.id,
        lesson: c.lesson_id,
        type: c.type,
        question: c.question,
        xpReward: c.xp_reward,
        options: c.options || [],
        correctIndex: c.correct_index,
        template: c.template,
        answer: c.answer,
        pairs: c.pairs || [],
        starterCode: c.starter_code,
        expectedOutput: c.expected_output,
        language: c.language,
        explanation: c.explanation,
        hint: c.hint,
      })),
    };

    res.json({
      lesson: formattedLesson,
      isCompleted,
      completedChallenges: progress ? progress.completed_challenges || [] : [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a lesson
// @route   POST /api/lessons/:slug/complete
const completeLesson = async (req, res, next) => {
  try {
    // 1. Fetch lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('slug', req.params.slug)
      .maybeSingle();

    if (lessonError || !lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // 2. Fetch track details
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', lesson.track_id)
      .single();

    if (trackError || !track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // 3. Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // 4. Fetch or create progress
    let { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('track_id', lesson.track_id)
      .maybeSingle();

    if (progressError) throw progressError;

    if (!progress) {
      const { data: newProgress, error: createError } = await supabase
        .from('progress')
        .insert({
          user_id: req.user.id,
          track_id: lesson.track_id,
          completed_lessons: [],
          completed_challenges: [],
          current_module: lesson.module_id,
          current_lesson: lesson.id,
          xp_earned: 0,
          progress_percent: 0,
        })
        .select()
        .single();

      if (createError) throw createError;
      progress = newProgress;
    }

    // Check if already completed
    const completedLessons = progress.completed_lessons || [];
    if (completedLessons.includes(lesson.id)) {
      return res.json({
        message: 'Lesson already completed',
        xpEarned: 0,
        totalXp: profile.xp,
        level: profile.level,
        newAchievements: [],
      });
    }

    // 5. Add completion & calculate XP progress
    completedLessons.push(lesson.id);
    const progressXp = progress.xp_earned + lesson.xp_reward;
    const totalLessons = track.total_lessons || 3;
    const progressPercent = Math.round((completedLessons.length / totalLessons) * 100);

    // Find next lesson
    const { data: allLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, module_id')
      .eq('track_id', lesson.track_id)
      .order('display_order');

    if (lessonsError) throw lessonsError;

    let nextLessonId = progress.current_lesson;
    let nextModuleId = progress.current_module;
    const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);

    if (currentIndex > -1 && currentIndex < allLessons.length - 1) {
      nextLessonId = allLessons[currentIndex + 1].id;
      nextModuleId = allLessons[currentIndex + 1].module_id;
    }

    // Update progress in DB
    const { error: updateProgressError } = await supabase
      .from('progress')
      .update({
        completed_lessons: completedLessons,
        xp_earned: progressXp,
        progress_percent: progressPercent,
        current_lesson: nextLessonId,
        current_module: nextModuleId,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', progress.id);

    if (updateProgressError) throw updateProgressError;

    // 6. Update user XP & Streak
    const totalXp = profile.xp + lesson.xp_reward;
    const newLevel = calculateLevel(totalXp);

    // Streak logic
    const todayStr = new Date().toISOString().split('T')[0];
    let streak = profile.streak || 0;
    let longestStreak = profile.longest_streak || 0;

    if (profile.last_active_date) {
      const lastActiveStr = new Date(profile.last_active_date).toISOString().split('T')[0];
      if (lastActiveStr !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActiveStr === yesterdayStr) {
          streak += 1;
        } else {
          streak = 1;
        }
      }
    } else {
      streak = 1;
    }

    if (streak > longestStreak) {
      longestStreak = streak;
    }

    // Update daily activity
    const { data: dailyActivity, error: activityError } = await supabase
      .from('activity')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('date', todayStr)
      .maybeSingle();

    if (activityError) throw activityError;

    let dailyXpEarned = lesson.xp_reward;

    if (dailyActivity) {
      dailyXpEarned = dailyActivity.xp_earned + lesson.xp_reward;
      await supabase
        .from('activity')
        .update({ xp_earned: dailyXpEarned })
        .eq('id', dailyActivity.id);
    } else {
      await supabase
        .from('activity')
        .insert({ user_id: req.user.id, date: todayStr, xp_earned: lesson.xp_reward });
    }

    // 7. Check Achievements
    const { data: allProgress, error: allProgressError } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', req.user.id);

    if (allProgressError) throw allProgressError;

    const totalCompleted = (allProgress || []).reduce(
      (sum, p) => sum + (p.completed_lessons?.length || 0),
      0
    );
    const tracksStarted = allProgress?.length || 0;
    const completedTracks = (allProgress || []).filter((p) => p.progress_percent >= 100).length;

    const userData = {
      xp: totalXp,
      level: newLevel,
      streak,
      longestStreak,
      achievements: profile.achievements || [],
      completedLessonsCount: totalCompleted,
      tracksStarted,
      completedTracks,
      perfectLessons: req.body.perfectScore ? 1 : 0,
    };

    const newAchievements = checkAchievements(userData);
    const updatedAchievements = [...(profile.achievements || [])];
    if (newAchievements.length > 0) {
      updatedAchievements.push(...newAchievements.map((a) => a.id));
    }

    // Update profiles table in DB
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        xp: totalXp,
        level: newLevel,
        streak,
        longest_streak: longestStreak,
        last_active_date: new Date().toISOString(),
        daily_xp_earned: dailyXpEarned,
        achievements: updatedAchievements,
      })
      .eq('id', req.user.id);

    if (updateProfileError) throw updateProfileError;

    const dailyGoalMet = dailyXpEarned >= profile.daily_xp_goal;

    res.json({
      xpEarned: lesson.xp_reward,
      totalXp,
      level: newLevel,
      streak,
      dailyXpEarned,
      dailyGoalMet,
      newAchievements,
      progressPercent,
      nextLesson: nextLessonId,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLesson, completeLesson };
