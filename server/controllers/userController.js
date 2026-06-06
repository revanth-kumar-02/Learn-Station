const { supabase } = require('../config/db');
const { getAllAchievements, xpProgressInLevel } = require('../utils/xpCalculator');

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

    // 2. Fetch progress with track details
    const { data: allProgress, error: progressError } = await supabase
      .from('progress')
      .select('*, track:tracks(id, slug, name, color, icon)')
      .eq('user_id', req.user.id);

    if (progressError) throw progressError;

    const totalLessonsCompleted = (allProgress || []).reduce(
      (sum, p) => sum + (p.completed_lessons?.length || 0),
      0
    );

    const levelInfo = xpProgressInLevel(profile.xp);

    const todayStr = new Date().toISOString().split('T')[0];
    let dailyXpEarned = profile.daily_xp_earned || 0;
    if (profile.last_active_date) {
      const lastActiveStr = new Date(profile.last_active_date).toISOString().split('T')[0];
      if (lastActiveStr !== todayStr) {
        dailyXpEarned = 0;
      }
    }

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
          }
        : null,
    }));

    res.json({
      user: {
        id: profile.id,
        name: profile.name,
        email: req.user.email,
        xp: profile.xp,
        level: profile.level,
        streak: profile.streak,
        longestStreak: profile.longest_streak,
        achievements: profile.achievements || [],
        dailyXpGoal: profile.daily_xp_goal,
        dailyXpEarned,
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
    const { name, dailyXpGoal } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (dailyXpGoal) updates.daily_xp_goal = dailyXpGoal;

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
        email: req.user.email,
        dailyXpGoal: updated.daily_xp_goal,
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
    startDate.setDate(startDate.getDate() - 13);
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

    const last14Days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      last14Days.push({
        date: dateStr,
        xp: activityMap[dateStr] || 0,
      });
    }

    res.json({ activity: last14Days });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getAchievements, getActivity };
