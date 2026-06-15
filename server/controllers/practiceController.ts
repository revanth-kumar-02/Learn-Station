import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { calculateLevel, checkAchievements, generateDailyMissions, updateDailyMissions } from '../utils/xpCalculator';

// @desc    Get completed lessons and practice stats
// @route   GET /api/practice
export const getCompletedLessons = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;

    // 1. Fetch user progress rows to see what is completed
    const { data: progressList, error: progressError } = await supabase
      .from('progress')
      .select('completed_lessons')
      .eq('user_id', userId);

    if (progressError) throw progressError;

    // Flatten all completed lesson IDs
    const completedLessonIds: string[] = [];
    if (progressList && progressList.length > 0) {
      progressList.forEach(p => {
        if (p.completed_lessons && Array.isArray(p.completed_lessons)) {
          p.completed_lessons.forEach(id => {
            if (!completedLessonIds.includes(id)) {
              completedLessonIds.push(id);
            }
          });
        }
      });
    }

    // 2. Fetch user profile for daily missions/practice stats
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const todayStr = new Date().toISOString().split('T')[0];
    let dailyMissionsObj = profile.daily_missions;
    if (!dailyMissionsObj || dailyMissionsObj.date !== todayStr) {
      dailyMissionsObj = generateDailyMissions(todayStr);
    }
    if (!dailyMissionsObj.completedLessonsToday) {
      dailyMissionsObj.completedLessonsToday = [];
    }
    if (dailyMissionsObj.dailyPracticeXp === undefined) {
      dailyMissionsObj.dailyPracticeXp = 0;
    }

    if (completedLessonIds.length === 0) {
      return res.json({
        completedLessons: [],
        dailyPracticeXp: dailyMissionsObj.dailyPracticeXp,
        completedLessonsToday: dailyMissionsObj.completedLessonsToday
      });
    }

    // 3. Fetch all completed lessons with their tracks and challenges
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select(`
        *,
        track:tracks(name, slug, color, icon),
        challenges(*)
      `)
      .in('id', completedLessonIds);

    if (lessonsError) throw lessonsError;

    res.json({
      completedLessons: lessons || [],
      dailyPracticeXp: dailyMissionsObj.dailyPracticeXp,
      completedLessonsToday: dailyMissionsObj.completedLessonsToday
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a practice activity and award practice XP capped at 100/day
// @route   POST /api/practice/complete
export const completePracticeActivity = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { lessonId, activityType } = req.body;

    if (!lessonId || !activityType) {
      return res.status(400).json({ message: 'Lesson ID and activity type are required.' });
    }

    // 1. Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    // 2. Initialize daily missions object
    const todayStr = new Date().toISOString().split('T')[0];
    let dailyMissionsObj = profile.daily_missions;
    if (!dailyMissionsObj || dailyMissionsObj.date !== todayStr) {
      dailyMissionsObj = generateDailyMissions(todayStr);
    }
    if (!dailyMissionsObj.completedLessonsToday) {
      dailyMissionsObj.completedLessonsToday = [];
    }
    if (dailyMissionsObj.dailyPracticeXp === undefined) {
      dailyMissionsObj.dailyPracticeXp = 0;
    }

    // Calculate XP reward based on requirements:
    // Quiz Practice (+5 XP), Challenge (+10 XP), AI Interview (+15 XP)
    let baseXp = 5;
    if (activityType === 'ai-interview') {
      baseXp = 15;
    } else if (activityType === 'challenge' || activityType === 'timed' || activityType === 'coding') {
      baseXp = 10;
    } else if (activityType === 'quiz') {
      baseXp = 5;
    }

    const currentPracticeXp = dailyMissionsObj.dailyPracticeXp;
    const xpToAward = Math.min(baseXp, Math.max(0, 100 - currentPracticeXp));

    let finalTotalXp = profile.xp;
    let finalLevel = profile.level;
    let dailyXpEarned = profile.daily_xp_earned || 0;
    let newAchievements: any[] = [];

    if (xpToAward > 0) {
      dailyMissionsObj.dailyPracticeXp += xpToAward;
      finalTotalXp = profile.xp + xpToAward;
      finalLevel = calculateLevel(finalTotalXp);

      // Increment daily missions stats/XP progress if applicable
      dailyMissionsObj = updateDailyMissions(dailyMissionsObj, 'xp', xpToAward);
      if (activityType === 'quiz') {
        dailyMissionsObj = updateDailyMissions(dailyMissionsObj, 'quiz', 1);
      }
      if (activityType === 'challenge' || activityType === 'timed' || activityType === 'coding') {
        dailyMissionsObj = updateDailyMissions(dailyMissionsObj, 'challenge', 1);
      }

      // Daily Activity XP update
      const { data: dailyActivity, error: activityError } = await supabase
        .from('activity')
        .select('*')
        .eq('user_id', userId)
        .eq('date', todayStr)
        .maybeSingle();

      if (activityError) throw activityError;

      if (dailyActivity) {
        dailyXpEarned = dailyActivity.xp_earned + xpToAward;
        await supabase
          .from('activity')
          .update({ xp_earned: dailyXpEarned })
          .eq('id', dailyActivity.id);
      } else {
        dailyXpEarned = xpToAward;
        await supabase
          .from('activity')
          .insert({ user_id: userId, date: todayStr, xp_earned: xpToAward });
      }

      // Check achievements
      const { data: allProgress } = await supabase
        .from('progress')
        .select('*, track:tracks(slug, is_ai_generated)')
        .eq('user_id', userId);

      const totalCompleted = (allProgress || []).reduce(
        (sum, p) => sum + (p.completed_lessons?.length || 0),
        0
      );
      const tracksStarted = allProgress?.length || 0;
      const completedTracks = (allProgress || []).filter((p) => p.progress_percent >= 100).length;
      const completedTracksList = (allProgress || []).filter((p) => p.progress_percent >= 100).map(p => p.track?.slug || '');
      const aiPathsGenerated = (allProgress || []).filter((p) => p.track?.is_ai_generated).length;

      const completedChallengesCount = (allProgress || []).reduce(
        (sum, p) => sum + (p.completed_challenges?.length || 0),
        0
      );

      const { data: submissions } = await supabase
        .from('capstone_submissions')
        .select('id')
        .eq('user_id', userId);
      const completedProjectsCount = submissions?.length || 0;

      const currentHour = new Date().getHours();
      const currentDay = new Date().getDay();
      const isNightLearning = currentHour >= 0 && currentHour < 4;
      const isEarlyLearning = currentHour >= 5 && currentHour < 8;
      const isWeekendLearning = currentDay === 0 || currentDay === 6;

      const userData = {
        xp: finalTotalXp,
        level: finalLevel,
        streak: profile.streak || 1,
        longestStreak: profile.longest_streak || 1,
        achievements: profile.achievements || [],
        completedLessonsCount: totalCompleted,
        tracksStarted,
        completedTracks,
        completedTracksList,
        aiPathsGenerated,
        perfectQuizzesCount: dailyMissionsObj.stats?.perfectQuizzes || 0,
        completedChallengesCount,
        completedProjectsCount,
        isNightLearning,
        isEarlyLearning,
        isWeekendLearning,
      };

      newAchievements = checkAchievements(userData);
      const updatedAchievements = [...(profile.achievements || [])];
      if (newAchievements.length > 0) {
        let achievementBonusXp = 0;
        newAchievements.forEach((a) => {
          achievementBonusXp += (a.xpBonus || 0);
          updatedAchievements.push(a.id);
        });
        finalTotalXp += achievementBonusXp;
        finalLevel = calculateLevel(finalTotalXp);
      }

      // Save changes back to profile
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          xp: finalTotalXp,
          level: finalLevel,
          daily_xp_earned: dailyXpEarned,
          daily_missions: dailyMissionsObj,
          achievements: updatedAchievements,
          last_active_date: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateProfileError) throw updateProfileError;
    }

    res.json({
      success: true,
      xpEarned: xpToAward,
      dailyPracticeXp: dailyMissionsObj.dailyPracticeXp,
      totalXp: finalTotalXp,
      level: finalLevel,
      newAchievements,
      message: xpToAward > 0 ? `Completed activity! Awarded +${xpToAward} XP.` : 'Daily practice XP cap (100 XP) reached. No XP awarded.'
    });
  } catch (error) {
    next(error);
  }
};
