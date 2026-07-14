import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { calculateLevel, checkAchievements, generateDailyMissions, updateDailyMissions } from '../utils/xpCalculator';
import { createNotification } from '../utils/notifications';

// @desc    Get all progress for current user
// @route   GET /api/progress
export const getAllProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    // 1. Fetch progress with joined track and current lesson info
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select(`
        *,
        track:tracks(id, slug, name, color, icon),
        current_lesson:lessons(id, slug, title)
      `)
      .eq('user_id', userId);

    if (progressError) throw progressError;

    // 2. Fetch profile details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // 3. Format response to preserve interface structures
    const formattedProgress = (progress || []).map((p: any) => ({
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
export const getTrackProgress = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;

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
      .eq('user_id', userId)
      .eq('track_id', track.id)
      .maybeSingle();

    if (progressError) throw progressError;

    // 3. If progress exists, populate related items manually for Mongoose compliance
    let completedLessonsPopulated: any[] = [];
    let currentLessonPopulated: any = null;

    if (progress) {
      if (progress.completed_lessons && progress.completed_lessons.length > 0) {
        const { data: completedLessonsData } = await supabase
          .from('lessons')
          .select('id, slug, title')
          .in('id', progress.completed_lessons);
        
        completedLessonsPopulated = (completedLessonsData || []).map((l: any) => ({
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

// @desc    Submit capstone project repository and demo links
// @route   POST /api/progress/capstone/submit
export const submitCapstoneProject = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { trackId, repoUrl, demoUrl } = req.body;

    if (!trackId || !repoUrl) {
      return res.status(400).json({ message: 'Track ID and Repository URL are required.' });
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

    // 2. Fetch track details
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', trackId)
      .single();

    if (trackError || !track) {
      return res.status(404).json({ message: 'Track not found.' });
    }

    // 3. Check if submission already exists
    const { data: existingSubmit } = await supabase
      .from('capstone_submissions')
      .select('*')
      .eq('user_id', userId)
      .eq('track_id', trackId)
      .maybeSingle();

    if (existingSubmit) {
      return res.status(400).json({ message: 'Capstone project already submitted for this track.' });
    }

    // 4. Save capstone submission to DB
    const { data: submission, error: submitError } = await supabase
      .from('capstone_submissions')
      .insert({
        user_id: userId,
        track_id: trackId,
        repo_url: repoUrl,
        demo_url: demoUrl || null,
        status: 'approved',
      })
      .select()
      .single();

    if (submitError) throw submitError;

    // 5. Update progress row for this track to 100% completion
    let { data: progress } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('track_id', trackId)
      .maybeSingle();

    const xpReward = 500; // Capstone project awards +500 XP
    const progressXp = (progress ? progress.xp_earned : 0) + xpReward;

    if (progress) {
      await supabase
        .from('progress')
        .update({
          progress_percent: 100,
          xp_earned: progressXp,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('id', progress.id);
    } else {
      const { data: newProgress } = await supabase
        .from('progress')
        .insert({
          user_id: userId,
          track_id: trackId,
          completed_lessons: [],
          completed_challenges: [],
          current_module: null,
          current_lesson: null,
          xp_earned: xpReward,
          progress_percent: 100,
        })
        .select()
        .single();
      progress = newProgress;
    }

    // 6. Update user total XP and Level
    const totalXp = profile.xp + xpReward;
    const newLevel = calculateLevel(totalXp);

    // Update daily mission goals
    const todayStr = new Date().toISOString().split('T')[0];
    let dailyMissionsObj = profile.daily_missions;
    if (!dailyMissionsObj || dailyMissionsObj.date !== todayStr) {
      dailyMissionsObj = generateDailyMissions(todayStr);
    }
    dailyMissionsObj = updateDailyMissions(dailyMissionsObj, 'xp', xpReward);

    // Fetch progress completed tracks for achievements checking
    const { data: allProgress } = await supabase
      .from('progress')
      .select('*, track:tracks(slug, is_ai_generated)')
      .eq('user_id', userId);

    const totalCompleted = (allProgress || []).reduce(
      (sum, p) => sum + (p.completed_lessons?.length || 0),
      0
    );
    const tracksStarted = allProgress?.length || 0;
    
    // Explicitly add current track completion to statistics
    const completedTracksList = (allProgress || [])
      .map(p => p.track_id === trackId ? { ...p, progress_percent: 100 } : p)
      .filter((p) => p.progress_percent >= 100)
      .map((p) => p.track?.slug || '');

    const completedTracksCount = completedTracksList.length;
    const aiPathsGenerated = (allProgress || []).filter((p) => p.track?.is_ai_generated).length;

    // Calculate completed challenges across all progress tables
    const completedChallengesCount = (allProgress || []).reduce(
      (sum, p) => sum + (p.completed_challenges?.length || 0),
      0
    );

    const completedProjectsCount = completedTracksCount;

    // Time-based checks (for rare badges)
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    const isNightLearning = currentHour >= 0 && currentHour < 4;
    const isEarlyLearning = currentHour >= 5 && currentHour < 8;
    const isWeekendLearning = currentDay === 0 || currentDay === 6;

    const userData = {
      xp: totalXp,
      level: newLevel,
      streak: profile.streak || 1,
      longestStreak: profile.longest_streak || 1,
      achievements: profile.achievements || [],
      completedLessonsCount: totalCompleted,
      tracksStarted,
      completedTracks: completedTracksCount,
      completedTracksList,
      aiPathsGenerated,
      perfectQuizzesCount: dailyMissionsObj?.stats?.perfectQuizzes || 0,
      completedChallengesCount,
      completedProjectsCount,
      isNightLearning,
      isEarlyLearning,
      isWeekendLearning,
    };

    const newAchievements = checkAchievements(userData);
    const updatedAchievements = [...(profile.achievements || [])];
    let achievementBonusXp = 0;
    let finalTotalXp = totalXp;
    if (newAchievements.length > 0) {
      newAchievements.forEach((a) => {
        achievementBonusXp += (a.xpBonus || 0);
        updatedAchievements.push(a.id);
      });
      finalTotalXp = totalXp + achievementBonusXp;
    }
    const finalLevel = calculateLevel(finalTotalXp);

    // Save profile changes
    await supabase
      .from('profiles')
      .update({
        xp: finalTotalXp,
        level: finalLevel,
        achievements: updatedAchievements,
        daily_missions: dailyMissionsObj,
      })
      .eq('id', userId);

    // 7. Generate a unique Certificate ID
    const randomHash = Math.random().toString(36).substring(2, 8).toUpperCase();
    const certificateId = `CERT-${track.slug.toUpperCase()}-${randomHash}`;

    const { data: cert, error: certError } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        track_id: trackId,
        xp_earned: xpReward,
        certificate_id: certificateId,
      })
      .select()
      .single();

    if (certError) throw certError;

    // Trigger Track Completed notification
    await createNotification(
      userId,
      'Track Completed 🎉',
      `Outstanding! You completed the track "${track.name}"!`,
      'Learning',
      '🎉',
      `/track/${track.slug}`
    );

    // Trigger Certificate Earned notification
    await createNotification(
      userId,
      'Certificate Earned 🎓',
      `Congratulations! You earned a certificate for "${track.name}"!`,
      'Certificate',
      '🎓',
      `/certificate/${certificateId}`
    );

    // Trigger Level Up notification if they leveled up
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

    // Trigger Badge unlocked notifications
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

    res.json({
      success: true,
      xpEarned: xpReward,
      level: finalLevel,
      newAchievements,
      certificate: cert,
      submission,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get certificate details by ID
// @route   GET /api/progress/certificate/:certId
export const getCertificate = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { data: cert, error: certError } = await supabase
      .from('certificates')
      .select(`
        *,
        track:tracks(name, slug, color, icon),
        user:profiles(name, username, xp, level)
      `)
      .eq('certificate_id', req.params.certId)
      .maybeSingle();

    if (certError || !cert) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }

    res.json({ certificate: cert });
  } catch (error) {
    next(error);
  }
};
