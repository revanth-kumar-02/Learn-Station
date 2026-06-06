const { supabase } = require('../config/db');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token using Supabase Auth Client
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }

    // Fetch public profile details
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error || !profile) {
      return res.status(401).json({ message: 'User profile not found' });
    }

    // Map fields to match custom Mongoose properties to preserve interface compatibility
    const todayStr = new Date().toISOString().split('T')[0];
    let dailyXpEarned = profile.daily_xp_earned || 0;
    if (profile.last_active_date) {
      const lastActiveStr = new Date(profile.last_active_date).toISOString().split('T')[0];
      if (lastActiveStr !== todayStr) {
        dailyXpEarned = 0;
      }
    }

    req.user = {
      _id: profile.id,
      id: profile.id,
      name: profile.name,
      email: authUser.email || profile.email,
      xp: profile.xp,
      level: profile.level,
      streak: profile.streak,
      longestStreak: profile.longest_streak,
      lastActiveDate: profile.last_active_date,
      dailyXpGoal: profile.daily_xp_goal,
      dailyXpEarned,
    };


    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

module.exports = { protect };
