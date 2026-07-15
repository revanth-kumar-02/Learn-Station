import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { calculateLevel, checkAchievements, generateDailyMissions, updateDailyMissions, updateWeeklyMissions } from '../utils/xpCalculator';
import { createNotification } from '../utils/notifications';

interface Lesson {
  id: string;
  slug: string;
  title: string;
  track_id: string;
  module_id: string;
  display_order: number;
  estimated_minutes?: number;
  xp_reward: number;
  concept_title?: string;
  concept_content?: string;
  concept_highlights?: string[];
  example_language?: string;
  example_code?: string;
  example_explanation?: string;
  practice_type?: string;
  practice_instruction?: string;
  practice_template?: string;
  practice_answer?: string;
}

const checkIsLessonUnlocked = async (userId: string, lesson: Lesson): Promise<boolean> => {
  // 1. Fetch user progress
  const { data: progress, error: progressError } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .eq('track_id', lesson.track_id)
    .maybeSingle();

  if (progressError) {
    console.error('Error fetching progress:', progressError);
    return false;
  }

  const completedSet = new Set<string>(progress ? progress.completed_lessons || [] : []);
  const completedChallengesSet = new Set<string>(progress ? progress.completed_challenges || [] : []);

  // Already completed is unlocked
  if (completedSet.has(lesson.id)) {
    return true;
  }

  // 2. Fetch modules for sorting
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('*')
    .eq('track_id', lesson.track_id)
    .order('display_order', { ascending: true });

  if (modulesError) {
    console.error('Error fetching modules:', modulesError);
    return false;
  }

  const sortedModules = [...(modules || [])].sort((a, b) => a.display_order - b.display_order);

  // 3. Determine which modules are unlocked
  const unlockedModules = new Set<string>();
  if (sortedModules.length > 0) {
    unlockedModules.add(sortedModules[0].id); // First module is unlocked
  }

  for (let i = 1; i < sortedModules.length; i++) {
    const prevModule = sortedModules[i - 1];
    
    // Fetch all lessons for prevModule to check if they are all completed
    const { data: prevModuleLessons, error: pmLessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', prevModule.id);

    if (pmLessonsError) {
      console.error('Error fetching prev module lessons:', pmLessonsError);
      return false;
    }

    const allCompleted = (prevModuleLessons || []).length > 0 
      ? prevModuleLessons.every(l => completedSet.has(l.id))
      : true; // if no lessons, treat as completed
      
    let assessmentPassed = true;
    if (allCompleted && (prevModuleLessons || []).length > 0) {
      const { data: attempts } = await supabase
        .from('assessments')
        .select('passed')
        .eq('user_id', userId)
        .eq('track_id', lesson.track_id)
        .eq('module_id', prevModule.id)
        .eq('type', 'module')
        .eq('passed', true);
      
      assessmentPassed = (attempts || []).length > 0;
    }
      
    if (allCompleted && assessmentPassed) {
      unlockedModules.add(sortedModules[i].id);
    }
  }

  // If the lesson's module is locked, then this lesson is locked
  if (!unlockedModules.has(lesson.module_id)) {
    return false;
  }

  // 4. Fetch lessons in the current module to check intra-module order
  const { data: moduleLessons, error: mLessonsError } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', lesson.module_id)
    .order('display_order', { ascending: true });

  if (mLessonsError) {
    console.error('Error fetching module lessons:', mLessonsError);
    return false;
  }

  const sortedModuleLessons = [...(moduleLessons || [])].sort((a, b) => a.display_order - b.display_order);
  const lessonIdx = sortedModuleLessons.findIndex(l => l.id === lesson.id);

  if (lessonIdx <= 0) {
    // First lesson of an unlocked module is always unlocked
    return true;
  }

  // Unlocked if previous lesson in the module is completed
  const prevLesson = sortedModuleLessons[lessonIdx - 1];
  if (!completedSet.has(prevLesson.id)) {
    return false;
  }

  // If previous lesson has challenges, all of them must be completed
  const { data: prevChallenges, error: challengesError } = await supabase
    .from('challenges')
    .select('id')
    .eq('lesson_id', prevLesson.id);

  if (challengesError) {
    console.error('Error fetching challenges:', challengesError);
    return false;
  }

  if (prevChallenges && prevChallenges.length > 0) {
    const allChallengesCompleted = prevChallenges.every(c => completedChallengesSet.has(c.id));
    if (!allChallengesCompleted) {
      return false;
    }
  }

  return true;
};

// @desc    Get lesson by slug
// @route   GET /api/lessons/:slug
export const getLesson = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;

    // 1. Fetch lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('slug', req.params.slug)
      .maybeSingle();

    if (lessonError || !lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if lesson is unlocked
    const isUnlocked = await checkIsLessonUnlocked(userId, lesson);
    if (!isUnlocked) {
      return res.status(403).json({ message: 'This lesson is locked. Complete the previous lesson to continue.' });
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
      .eq('user_id', userId)
      .eq('track_id', lesson.track_id)
      .maybeSingle();

    if (progressError) throw progressError;

    const isCompleted = progress
      ? (progress.completed_lessons || []).includes(lesson.id)
      : false;

    // 4. Fetch Track Details (modules, lessons) for Sidebar and Progress Display
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', lesson.track_id)
      .single();

    if (trackError) throw trackError;

    // Fetch modules for this track
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .eq('track_id', track.id)
      .order('display_order');

    if (modulesError) throw modulesError;

    // Fetch lessons for this track
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, slug, title, display_order, estimated_minutes, xp_reward, module_id')
      .eq('track_id', track.id)
      .order('display_order');

    if (lessonsError) throw lessonsError;

    // Fetch challenge IDs map for the track's lessons
    const lessonIds = (lessons || []).map(l => l.id);
    const challengeIdsMap: Record<string, string[]> = {};
    if (lessonIds.length > 0) {
      const { data: challengesList, error: challengesListError } = await supabase
        .from('challenges')
        .select('id, lesson_id')
        .in('lesson_id', lessonIds);

      if (!challengesListError && challengesList) {
        challengesList.forEach(c => {
          if (!challengeIdsMap[c.lesson_id]) {
            challengeIdsMap[c.lesson_id] = [];
          }
          challengeIdsMap[c.lesson_id].push(c.id);
        });
      }
    }

    // Map lessons inside modules
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
      summary: lesson.summary || '',
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
      track: formattedTrack,
      progress: progress
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
          },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a lesson
// @route   POST /api/lessons/:slug/complete
export const completeLesson = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;

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
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // 4. Fetch or create progress
    let { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('track_id', lesson.track_id)
      .maybeSingle();

    if (progressError) throw progressError;

    if (!progress) {
      const { data: newProgress, error: createError } = await supabase
        .from('progress')
        .insert({
          user_id: userId,
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

      // Trigger Track started notification
      await createNotification(
        userId,
        'Track Started 🚀',
        `You started the track "${track.name}". Happy learning!`,
        'Learning',
        '🚀',
        `/track/${track.slug}`
      );
    }

    // Check if quiz is passed (hard gate check)
    const { quizScore, quizPassed } = req.body;
    if (quizPassed !== undefined && !quizPassed) {
      return res.json({
        passed: false,
        message: 'Quiz failed. Score must be at least 4/5.',
        xpEarned: 0,
        totalXp: profile.xp,
        level: profile.level,
        streak: profile.streak || 0,
        dailyXpEarned: profile.daily_xp_earned || 0,
        newAchievements: []
      });
    }

    // Check if already completed
    const completedLessons = progress.completed_lessons || [];
    if (completedLessons.includes(lesson.id)) {
      const todayStr = new Date().toISOString().split('T')[0];
      let dailyXpEarned = profile.daily_xp_earned || 0;
      if (profile.last_active_date) {
        const lastActiveStr = new Date(profile.last_active_date).toISOString().split('T')[0];
        if (lastActiveStr !== todayStr) {
          dailyXpEarned = 0;
        }
      }

      console.log(`[Progression Engine Debug] Lesson "${lesson.title}" (${lesson.slug}) already completed. Returning current user progression stats: Streak=${profile.streak}, XP=${profile.xp}, dailyXpEarned=${dailyXpEarned}`);

      return res.json({
        passed: true,
        message: 'Lesson already completed',
        xpEarned: 0,
        bonusXp: 0,
        totalXp: profile.xp,
        level: profile.level,
        streak: profile.streak || 0,
        dailyXpEarned: dailyXpEarned,
        newAchievements: [],
      });
    }

    // Enforce daily roadmap lesson limit (maximum 4 new roadmap lessons per day)
    const todayStr = new Date().toISOString().split('T')[0];
    let dailyMissionsObj = profile.daily_missions;
    if (!dailyMissionsObj || dailyMissionsObj.date !== todayStr) {
      dailyMissionsObj = generateDailyMissions(todayStr);
    }
    if (!dailyMissionsObj.completedLessonsToday) {
      dailyMissionsObj.completedLessonsToday = [];
    }

    if (dailyMissionsObj.completedLessonsToday.length >= 4) {
      return res.status(403).json({
        message: "🎯 Daily Learning Goal Reached. You have completed today's roadmap lessons. Return tomorrow to unlock new lessons.",
        limitReached: true,
        progress: `${dailyMissionsObj.completedLessonsToday.length} / 4 Lessons Completed`
      });
    }

    // 5. Add completion & calculate XP progress
    completedLessons.push(lesson.id);
    if (!dailyMissionsObj.completedLessonsToday.includes(lesson.id)) {
      dailyMissionsObj.completedLessonsToday.push(lesson.id);
    }

    let bonusXp = 0;
    if (quizScore === 5) {
      bonusXp = 15;
    }
    const earnedXp = lesson.xp_reward + bonusXp;

    const progressXp = progress.xp_earned + earnedXp;
    const totalLessons = track.total_lessons || 3;
    const progressPercent = Math.round((completedLessons.length / totalLessons) * 100);

    // Fetch challenges for completed lesson to add to completed_challenges
    const { data: lessonChallenges, error: chalError } = await supabase
      .from('challenges')
      .select('id')
      .eq('lesson_id', lesson.id);

    if (chalError) throw chalError;

    const completedChallenges = progress.completed_challenges || [];
    if (lessonChallenges && lessonChallenges.length > 0) {
      lessonChallenges.forEach((c: any) => {
        if (!completedChallenges.includes(c.id)) {
          completedChallenges.push(c.id);
        }
      });
    }

    // Find next lesson using sequential sort: module order first, then display_order
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .eq('track_id', lesson.track_id)
      .order('display_order', { ascending: true });

    if (modulesError) throw modulesError;

    const { data: allLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('track_id', lesson.track_id);

    if (lessonsError) throw lessonsError;

    const sortedModules = [...(modules || [])].sort((a, b) => a.display_order - b.display_order);
    const moduleOrder: Record<string, number> = {};
    sortedModules.forEach((m, idx) => {
      moduleOrder[m.id] = idx;
    });

    const sortedLessons = [...(allLessons || [])].sort((a, b) => {
      const aModIdx = moduleOrder[a.module_id] ?? 999;
      const bModIdx = moduleOrder[b.module_id] ?? 999;
      if (aModIdx !== bModIdx) {
        return aModIdx - bModIdx;
      }
      return a.display_order - b.display_order;
    });

    let nextLessonId = progress.current_lesson;
    let nextModuleId = progress.current_module;
    const currentIndex = sortedLessons.findIndex((l) => l.id === lesson.id);

    if (currentIndex > -1 && currentIndex < sortedLessons.length - 1) {
      nextLessonId = sortedLessons[currentIndex + 1].id;
      nextModuleId = sortedLessons[currentIndex + 1].module_id;
    }

    // Update progress in DB
    const { error: updateProgressError } = await supabase
      .from('progress')
      .update({
        completed_lessons: completedLessons,
        completed_challenges: completedChallenges,
        xp_earned: progressXp,
        progress_percent: progressPercent,
        current_lesson: nextLessonId,
        current_module: nextModuleId,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', progress.id);

    if (updateProgressError) throw updateProgressError;

    // 6. Update user XP & Streak
    // Streak logic
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

    if (streak === 0) {
      streak = 1;
    }

    if (streak > longestStreak) {
      longestStreak = streak;
    }

    // Daily Activity XP update
    const { data: dailyActivity, error: activityError } = await supabase
      .from('activity')
      .select('*')
      .eq('user_id', userId)
      .eq('date', todayStr)
      .maybeSingle();

    if (activityError) throw activityError;

    let dailyXpEarned = earnedXp;

    if (dailyActivity) {
      dailyXpEarned = dailyActivity.xp_earned + earnedXp;
      await supabase
        .from('activity')
        .update({ xp_earned: dailyXpEarned })
        .eq('id', dailyActivity.id);
    } else {
      await supabase
        .from('activity')
        .insert({ user_id: userId, date: todayStr, xp_earned: earnedXp });
    }

    // Daily Missions Logic

    const checkMissionsCompletions = (before: any[], after: any[]) => {
      let count = 0;
      for (let i = 0; i < after.length; i++) {
        if (after[i].completed && !before[i].completed) {
          count++;
        }
      }
      return count;
    };

    const missionsBefore = JSON.parse(JSON.stringify(dailyMissionsObj.missions));

    // Update daily mission tasks
    dailyMissionsObj = updateDailyMissions(dailyMissionsObj, 'lesson', 1);
    dailyMissionsObj = updateDailyMissions(dailyMissionsObj, 'xp', earnedXp);
    dailyMissionsObj = updateDailyMissions(dailyMissionsObj, 'quiz', 1);
    dailyMissionsObj = updateDailyMissions(dailyMissionsObj, 'challenge', 5); // 5 quiz questions

    const missionsAfter = dailyMissionsObj.missions;
    const newlyCompletedMissions = checkMissionsCompletions(missionsBefore, missionsAfter);
    const dailyMissionBonusXp = newlyCompletedMissions * 100; // +100 XP per mission

    const baseTotalXp = profile.xp + earnedXp + dailyMissionBonusXp;
    let finalTotalXp = baseTotalXp;

    // Initialize/update stats in daily_missions
    if (!dailyMissionsObj.stats) {
      dailyMissionsObj.stats = {
        perfectQuizzes: 0,
        challengesSolved: 0,
        projectsSubmitted: 0,
        aiRoadmaps: 0
      };
    }
    if (quizScore === 5) {
      dailyMissionsObj.stats.perfectQuizzes = (dailyMissionsObj.stats.perfectQuizzes || 0) + 1;
    }

    // 7. Check Achievements
    const { data: allProgress, error: allProgressError } = await supabase
      .from('progress')
      .select('*, track:tracks(slug, is_ai_generated)')
      .eq('user_id', userId);

    if (allProgressError) throw allProgressError;

    const totalCompleted = (allProgress || []).reduce(
      (sum, p) => sum + (p.completed_lessons?.length || 0),
      0
    );
    const tracksStarted = allProgress?.length || 0;
    const completedTracks = (allProgress || []).filter((p) => p.progress_percent >= 100).length;
    const completedTracksList = (allProgress || []).filter((p) => p.progress_percent >= 100).map(p => p.track?.slug || '');
    const aiPathsGenerated = (allProgress || []).filter((p) => p.track?.is_ai_generated).length;

    // Calculate completed challenges across all progress tables
    const completedChallengesCount = (allProgress || []).reduce(
      (sum, p) => sum + (p.completed_challenges?.length || 0),
      0
    );

    // Get completed capstone submissions
    const { data: submissions, error: subError } = await supabase
      .from('capstone_submissions')
      .select('id')
      .eq('user_id', userId);
    const completedProjectsCount = submissions?.length || 0;

    // Time-based checks (for rare badges)
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    const isNightLearning = currentHour >= 0 && currentHour < 4;
    const isEarlyLearning = currentHour >= 5 && currentHour < 8;
    const isWeekendLearning = currentDay === 0 || currentDay === 6;

    const userData = {
      xp: baseTotalXp,
      level: calculateLevel(baseTotalXp),
      streak,
      longestStreak,
      achievements: profile.achievements || [],
      completedLessonsCount: totalCompleted,
      tracksStarted,
      completedTracks,
      completedTracksList,
      aiPathsGenerated,
      perfectQuizzesCount: dailyMissionsObj.stats.perfectQuizzes,
      completedChallengesCount,
      completedProjectsCount,
      isNightLearning,
      isEarlyLearning,
      isWeekendLearning,
    };

    const newAchievements = checkAchievements(userData);
    const updatedAchievements = [...(profile.achievements || [])];
    let achievementBonusXp = 0;
    if (newAchievements.length > 0) {
      newAchievements.forEach((a) => {
        achievementBonusXp += (a.xpBonus || 0);
        updatedAchievements.push(a.id);
      });
      finalTotalXp = baseTotalXp + achievementBonusXp;
    }
    const finalLevel = calculateLevel(finalTotalXp);

    console.log(`[Progression Engine Debug] Completing lesson "${lesson.title}". Base XP: +${lesson.xp_reward}, Quiz Bonus: +${bonusXp}, Missions Bonus: +${dailyMissionBonusXp}, Achievement Bonus: +${achievementBonusXp}. Total XP: ${finalTotalXp}. Streak: ${streak}.`);

    // Update weekly missions and learn coins
    const coinsEarned = Math.round(earnedXp / 2);
    const achievementCoins = Math.round(achievementBonusXp / 2);
    const totalCoinsEarned = coinsEarned + achievementCoins;
    const weeklyMissionsObj = updateWeeklyMissions(profile.weekly_missions, 'xp', earnedXp + dailyMissionBonusXp + achievementBonusXp);

    // Update profiles table in DB
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        xp: finalTotalXp,
        level: finalLevel,
        streak,
        longest_streak: longestStreak,
        last_active_date: new Date().toISOString(),
        daily_xp_earned: dailyXpEarned,
        achievements: updatedAchievements,
        daily_missions: dailyMissionsObj,
        weekly_missions: weeklyMissionsObj,
        learn_coins: (profile.learn_coins || 0) + totalCoinsEarned
      })
      .eq('id', userId);

    if (updateProfileError) throw updateProfileError;

    const dailyGoalMet = dailyXpEarned >= profile.daily_xp_goal;

    // Trigger Lesson completed notification
    await createNotification(
      userId,
      'Lesson Completed 📚',
      `You completed "${lesson.title}"! Keep it up.`,
      'Learning',
      '📚',
      `/track/${track.slug}`
    );

    // Trigger Quiz passed notification if quiz Passed
    if (quizPassed) {
      await createNotification(
        userId,
        'Quiz Passed 🎯',
        `You scored ${quizScore}/5 on the quiz for "${lesson.title}"!`,
        'Learning',
        '🎯',
        `/track/${track.slug}`
      );
    }

    // Trigger Level Up notification
    if (finalLevel > profile.level) {
      await createNotification(
        userId,
        'Level Up! ⭐',
        `Congratulations! You reached Level ${finalLevel}!`,
        'Level Up',
        '⭐',
        '/profile'
      );
    }

    // Trigger Badge unlocked notification
    if (newAchievements && newAchievements.length > 0) {
      for (const ach of newAchievements) {
        await createNotification(
          userId,
          'New Badge Unlocked 🏆',
          `You unlocked the badge "${ach.name}": ${ach.description}!`,
          'Badge',
          ach.icon || '🏆',
          '/profile'
        );
      }
    }

    // Trigger Daily Goal Met notification
    const wasDailyGoalMetBefore = (profile.daily_xp_earned || 0) >= profile.daily_xp_goal;
    if (dailyGoalMet && !wasDailyGoalMetBefore) {
      await createNotification(
        userId,
        'Daily Goal Met! 🎯',
        `Great job! You achieved your daily target of ${profile.daily_xp_goal} XP today!`,
        'XP',
        '🎯',
        '/'
      );
    }

    // Trigger Streak Milestone notification
    const streakMilestones = [1, 3, 7, 14, 30, 50, 75, 100, 365];
    if (streak > (profile.streak || 0) && streakMilestones.includes(streak)) {
      await createNotification(
        userId,
        'Streak Milestone! 🔥',
        `Awesome! You have kept your streak alive for ${streak} days!`,
        'Streak',
        '🔥',
        '/'
      );
    }

    res.json({
      passed: true,
      xpEarned: lesson.xp_reward,
      bonusXp: bonusXp + dailyMissionBonusXp + achievementBonusXp,
      totalXp: finalTotalXp,
      level: finalLevel,
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
