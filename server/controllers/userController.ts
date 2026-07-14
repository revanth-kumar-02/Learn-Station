import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { getAllAchievements, xpProgressInLevel, generateDailyMissions } from '../utils/xpCalculator';

// @desc    Get current user profile
// @route   GET /api/users/me
export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;

    // 1. Fetch user profile from DB
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let dailyMissionsObj = profile.daily_missions;

    // Check if new day, reset daily missions and daily XP earned
    let dailyXpEarned = profile.daily_xp_earned || 0;
    let dbUpdatesNeeded = false;
    const updates: Record<string, any> = {};

    if (profile.last_active_date) {
      const lastActiveStr = new Date(profile.last_active_date).toISOString().split('T')[0];
      if (lastActiveStr !== todayStr) {
        dailyXpEarned = 0;
        updates.daily_xp_earned = 0;
        dbUpdatesNeeded = true;
      }
    }

    if (!dailyMissionsObj || dailyMissionsObj.date !== todayStr) {
      dailyMissionsObj = generateDailyMissions(todayStr);
      updates.daily_missions = dailyMissionsObj;
      dbUpdatesNeeded = true;
    }

    if (dbUpdatesNeeded) {
      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
    }

    // 2. Fetch progress with track details
    const { data: allProgress, error: progressError } = await supabase
      .from('progress')
      .select('*, track:tracks(id, slug, name, color, icon, is_ai_generated)')
      .eq('user_id', userId);

    if (progressError) throw progressError;

    const totalLessonsCompleted = (allProgress || []).reduce(
      (sum, p) => sum + (p.completed_lessons?.length || 0),
      0
    );

    // Calculate dynamic counts for achievements checking
    const completedChallengesCount = (allProgress || []).reduce(
      (sum, p) => sum + (p.completed_challenges?.length || 0),
      0
    );

    const { data: submissions } = await supabase
      .from('capstone_submissions')
      .select('id')
      .eq('user_id', userId);
    const completedProjectsCount = submissions?.length || 0;

    const aiPathsGenerated = (allProgress || []).filter((p) => p.track?.is_ai_generated).length;
    const completedTracksList = (allProgress || []).filter((p) => p.progress_percent >= 100).map(p => p.track?.slug || '');

    // Time-based checks (for rare badges)
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    const isNightLearning = currentHour >= 0 && currentHour < 4;
    const isEarlyLearning = currentHour >= 5 && currentHour < 8;
    const isWeekendLearning = currentDay === 0 || currentDay === 6;

    const levelInfo = xpProgressInLevel(profile.xp);

    // Format progress items to match frontend expectations
    const formattedTrackProgress = (allProgress || []).map((p) => ({
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
            is_ai_generated: p.track.is_ai_generated,
          }
        : null,
    }));

    res.json({
      user: {
        id: profile.id,
        name: profile.name,
        username: profile.username || `user_${profile.id.substring(0, 8)}`,
        bio: profile.bio || '',
        email: req.user!.email,
        xp: profile.xp,
        level: profile.level,
        streak: profile.streak,
        longestStreak: profile.longest_streak,
        achievements: profile.achievements || [],
        dailyXpGoal: profile.daily_xp_goal,
        dailyXpEarned,
        dailyMissions: dailyMissionsObj,
        learningTime: profile.learning_time || 0,
        createdAt: profile.created_at,
        avatarUrl: profile.avatar_url || '',
      },
      stats: {
        totalXp: profile.xp,
        level: profile.level,
        streak: profile.streak,
        longestStreak: profile.longest_streak,
        dailyXpEarned,
        lessonsCompleted: totalLessonsCompleted,
        tracksStarted: allProgress?.length || 0,
        tracksCompleted: (allProgress || []).filter((p) => p.progress_percent >= 100).length,
        completedTracksList,
        aiPathsGenerated,
        completedChallengesCount,
        completedProjectsCount,
        perfectQuizzesCount: dailyMissionsObj?.stats?.perfectQuizzes || 0,
        isNightLearning,
        isEarlyLearning,
        isWeekendLearning,
      },
      levelInfo,
      trackProgress: formattedTrackProgress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { name, dailyXpGoal, username, bio, avatarUrl } = req.body;
    const updates: Record<string, any> = {};
    if (name) updates.name = name;
    if (dailyXpGoal) updates.daily_xp_goal = dailyXpGoal;
    if (bio !== undefined) updates.bio = bio;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    if (username) {
      // Validate unique username
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUsername.length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 alphanumeric characters' });
      }
      
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername)
        .neq('id', req.user!.id)
        .maybeSingle();

      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      updates.username = cleanUsername;
    }

    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user!.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      user: {
        id: updated.id,
        name: updated.name,
        username: updated.username,
        bio: updated.bio,
        email: req.user!.email,
        dailyXpGoal: updated.daily_xp_goal,
        xp: updated.xp,
        level: updated.level,
        avatarUrl: updated.avatar_url || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get achievements
// @route   GET /api/users/me/achievements
export const getAchievements = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('achievements')
      .eq('id', req.user!.id)
      .single();

    if (profileError) throw profileError;

    const allAchievements = getAllAchievements();
    const earned = new Set(profile?.achievements || []);

    const achievements = allAchievements.map((a) => ({
      ...a,
      earned: earned.has(a.id),
    }));

    res.json({ achievements });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity history
// @route   GET /api/users/me/activity
export const getActivity = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364); // Return 365 days for contribution heatmap
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data: rows, error: activityError } = await supabase
      .from('activity')
      .select('*')
      .eq('user_id', req.user!.id)
      .gte('date', startDateStr);

    if (activityError) throw activityError;

    const activityMap: Record<string, number> = {};
    (rows || []).forEach((r) => {
      activityMap[r.date] = r.xp_earned;
    });

    const last365Days: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const xp = activityMap[dateStr] || 0;

      last365Days.push({
        date: dateStr,
        xp,
        lessonsCompleted: xp ? Math.max(1, Math.floor(xp / 25)) : 0,
        minutesLearned: xp ? Math.max(5, Math.round(xp * 0.7)) : 0,
      });
    }

    res.json({ activity: last365Days });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public profile details by username
// @route   GET /api/users/public/:username
export const getPublicProfile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, username, bio, xp, level, streak, longest_streak, achievements, created_at')
      .eq('username', req.params.username)
      .maybeSingle();

    if (profileError || !profile) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // Fetch user privacy settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle();

    // Check if profile is public
    if (settings && !settings.public_profile) {
      return res.status(403).json({ message: 'This profile is private.', isPrivate: true });
    }

    // Fetch tracks completed
    const { data: allProgress } = await supabase
      .from('progress')
      .select('*, track:tracks(id, name, slug, color, icon)')
      .eq('user_id', profile.id);

    let completedTracks = (allProgress || [])
      .filter((p) => p.progress_percent >= 100)
      .map((p) => p.track);

    if (settings && !settings.show_current_track) {
      completedTracks = [];
    }

    // Fetch capstone submissions
    let submissions: any[] = [];
    if (!settings || settings.show_learning_history) {
      const { data } = await supabase
        .from('capstone_submissions')
        .select('*, track:tracks(name, slug)')
        .eq('user_id', profile.id);
      submissions = data || [];
    }

    // Fetch certificates
    let certificates: any[] = [];
    if (!settings || settings.show_certificates) {
      const { data } = await supabase
        .from('certificates')
        .select('*, track:tracks(name, slug)')
        .eq('user_id', profile.id);
      certificates = data || [];
    }

    const showXp = !settings || settings.show_xp;
    const showBadges = !settings || settings.show_badges;

    res.json({
      profile: {
        id: profile.id,
        name: profile.name,
        username: profile.username,
        bio: profile.bio || '',
        xp: showXp ? profile.xp : null,
        level: showXp ? profile.level : null,
        streak: showXp ? profile.streak : null,
        longestStreak: showXp ? profile.longest_streak : null,
        achievements: showBadges ? (profile.achievements || []) : [],
        createdAt: profile.created_at,
      },
      completedTracks,
      projects: submissions,
      certificates: certificates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get rankings for Leaderboards
// @route   GET /api/users/leaderboard
export const getLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // 1. Global XP rankings (exclude owner)
    const { data: globalXP } = await supabase
      .from('profiles')
      .select('name, username, xp, level, streak')
      .neq('role', 'owner')
      .order('xp', { ascending: false })
      .limit(10);

    // 2. Streaks rankings (exclude owner)
    const { data: streaks } = await supabase
      .from('profiles')
      .select('name, username, longest_streak, level')
      .neq('role', 'owner')
      .order('longest_streak', { ascending: false })
      .limit(10);

    // 3. Weekly & Monthly XP (JS aggregation from activity records)
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: weeklyActivity } = await supabase
      .from('activity')
      .select('user_id, xp_earned')
      .gte('date', sevenDaysAgoStr);

    const { data: monthlyActivity } = await supabase
      .from('activity')
      .select('user_id, xp_earned')
      .gte('date', thirtyDaysAgoStr);

    // Exclude owners from user mappings so they won't appear in aggregations
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('id, name, username, level')
      .neq('role', 'owner');

    const userMap: Record<string, { name: string; username: string; level: number }> = {};
    (allUsers || []).forEach(u => {
      userMap[u.id] = { name: u.name, username: u.username || `user_${u.id.substring(0, 8)}`, level: u.level };
    });

    // Aggregate Weekly
    const weeklyMap: Record<string, number> = {};
    (weeklyActivity || []).forEach(act => {
      weeklyMap[act.user_id] = (weeklyMap[act.user_id] || 0) + act.xp_earned;
    });
    const weeklyXP = Object.entries(weeklyMap)
      .map(([userId, xp]) => ({
        ...userMap[userId],
        xp,
      }))
      .filter(u => u.username) // Since owner is excluded from userMap, u.username will be undefined
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10);

    // Aggregate Monthly
    const monthlyMap: Record<string, number> = {};
    (monthlyActivity || []).forEach(act => {
      monthlyMap[act.user_id] = (monthlyMap[act.user_id] || 0) + act.xp_earned;
    });
    const monthlyXP = Object.entries(monthlyMap)
      .map(([userId, xp]) => ({
        ...userMap[userId],
        xp,
      }))
      .filter(u => u.username)
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10);

    // 4. Most Tracks Completed rankings
    const { data: progress } = await supabase
      .from('progress')
      .select('user_id')
      .gte('progress_percent', 100);

    const completedMap: Record<string, number> = {};
    (progress || []).forEach(p => {
      completedMap[p.user_id] = (completedMap[p.user_id] || 0) + 1;
    });
    const tracksCompleted = Object.entries(completedMap)
      .map(([userId, count]) => ({
        ...userMap[userId],
        completedTracksCount: count,
      }))
      .filter(u => u.username)
      .sort((a, b) => b.completedTracksCount - a.completedTracksCount)
      .slice(0, 10);

    res.json({
      globalXP: globalXP || [],
      weeklyXP,
      monthlyXP,
      streaks: streaks || [],
      tracksCompleted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user settings
// @route   GET /api/users/me/settings
export const getSettings = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !settings) {
      // Create settings if they don't exist
      const { data: newSettings } = await supabase
        .from('user_settings')
        .insert({ user_id: userId })
        .select()
        .single();
      return res.json({ settings: newSettings });
    }

    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user settings
// @route   PUT /api/users/me/settings
export const updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { data: settings, error } = await supabase
      .from('user_settings')
      .update(req.body)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete current user account
// @route   DELETE /api/users/me
export const deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    
    // 1. Delete all user data in database
    await supabase.from('progress').delete().eq('user_id', userId);
    await supabase.from('activity').delete().eq('user_id', userId);
    await supabase.from('certificates').delete().eq('user_id', userId);
    await supabase.from('capstone_submissions').delete().eq('user_id', userId);
    await supabase.from('notifications').delete().eq('user_id', userId);
    await supabase.from('user_settings').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);
    
    // Note: If the user is in admin_users, delete them as well
    await supabase.from('admin_users').delete().eq('id', userId);

    // 2. Delete user from Supabase auth (requires admin access via Service Role client)
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error('[Account Deletion] Error deleting Auth user:', deleteAuthError);
    }

    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
