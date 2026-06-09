const { supabase } = require('../config/db');
const { getAllAchievements, xpProgressInLevel, generateDailyMissions } = require('../utils/xpCalculator');

// @desc    Get current user profile
// @route   GET /api/users/me
const getProfile = async (req, res, next) => {
  try {
    // 1. Fetch user profile from DB
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let dailyMissionsObj = profile.daily_missions;

    // Check if new day, reset daily missions and daily XP earned
    let dailyXpEarned = profile.daily_xp_earned || 0;
    let dbUpdatesNeeded = false;
    const updates = {};

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
        .eq('id', req.user.id);
    }

    // 2. Fetch progress with track details
    const { data: allProgress, error: progressError } = await supabase
      .from('progress')
      .select('*, track:tracks(id, slug, name, color, icon, is_ai_generated)')
      .eq('user_id', req.user.id);

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
      .eq('user_id', req.user.id);
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
        email: req.user.email,
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
const updateProfile = async (req, res, next) => {
  try {
    const { name, dailyXpGoal, username, bio } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (dailyXpGoal) updates.daily_xp_goal = dailyXpGoal;
    if (bio !== undefined) updates.bio = bio;

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
        .neq('id', req.user.id)
        .maybeSingle();

      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      updates.username = cleanUsername;
    }

    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      user: {
        id: updated.id,
        name: updated.name,
        username: updated.username,
        bio: updated.bio,
        email: req.user.email,
        dailyXpGoal: updated.daily_xp_goal,
        xp: updated.xp,
        level: updated.level,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get achievements
// @route   GET /api/users/me/achievements
const getAchievements = async (req, res, next) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('achievements')
      .eq('id', req.user.id)
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
const getActivity = async (req, res, next) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364); // Return 365 days for contribution heatmap
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data: rows, error: activityError } = await supabase
      .from('activity')
      .select('*')
      .eq('user_id', req.user.id)
      .gte('date', startDateStr);

    if (activityError) throw activityError;

    const activityMap = {};
    (rows || []).forEach((r) => {
      activityMap[r.date] = r.xp_earned;
    });

    const last365Days = [];
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
const getPublicProfile = async (req, res, next) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, username, bio, xp, level, streak, longest_streak, achievements, created_at')
      .eq('username', req.params.username)
      .maybeSingle();

    if (profileError || !profile) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // Fetch tracks completed
    const { data: allProgress } = await supabase
      .from('progress')
      .select('*, track:tracks(id, name, slug, color, icon)')
      .eq('user_id', profile.id);

    const completedTracks = (allProgress || [])
      .filter((p) => p.progress_percent >= 100)
      .map((p) => p.track);

    // Fetch capstone submissions
    const { data: submissions } = await supabase
      .from('capstone_submissions')
      .select('*, track:tracks(name, slug)')
      .eq('user_id', profile.id);

    // Fetch certificates
    const { data: certificates } = await supabase
      .from('certificates')
      .select('*, track:tracks(name, slug)')
      .eq('user_id', profile.id);

    res.json({
      profile: {
        id: profile.id,
        name: profile.name,
        username: profile.username,
        bio: profile.bio || '',
        xp: profile.xp,
        level: profile.level,
        streak: profile.streak,
        longestStreak: profile.longest_streak,
        achievements: profile.achievements || [],
        createdAt: profile.created_at,
      },
      completedTracks,
      projects: submissions || [],
      certificates: certificates || [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get rankings for Leaderboards
// @route   GET /api/users/leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    // 1. Global XP rankings
    const { data: globalXP } = await supabase
      .from('profiles')
      .select('name, username, xp, level, streak')
      .order('xp', { ascending: false })
      .limit(10);

    // 2. Streaks rankings
    const { data: streaks } = await supabase
      .from('profiles')
      .select('name, username, longest_streak, level')
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

    const { data: allUsers } = await supabase
      .from('profiles')
      .select('id, name, username, level');

    const userMap = {};
    (allUsers || []).forEach(u => {
      userMap[u.id] = { name: u.name, username: u.username || `user_${u.id.substring(0, 8)}`, level: u.level };
    });

    // Aggregate Weekly
    const weeklyMap = {};
    (weeklyActivity || []).forEach(act => {
      weeklyMap[act.user_id] = (weeklyMap[act.user_id] || 0) + act.xp_earned;
    });
    const weeklyXP = Object.entries(weeklyMap)
      .map(([userId, xp]) => ({
        ...userMap[userId],
        xp,
      }))
      .filter(u => u.username)
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10);

    // Aggregate Monthly
    const monthlyMap = {};
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

    const completedMap = {};
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

module.exports = {
  getProfile,
  updateProfile,
  getAchievements,
  getActivity,
  getPublicProfile,
  getLeaderboard
};
