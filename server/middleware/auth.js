const jwt = require('jsonwebtoken');
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

    // Verify token using Supabase JWT Secret
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);

    // Fetch public profile details
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.sub)
      .single();

    if (error || !profile) {
      return res.status(401).json({ message: 'User profile not found' });
    }

    // Map fields to match custom Mongoose properties to preserve interface compatibility
    req.user = {
      _id: profile.id,
      id: profile.id,
      name: profile.name,
      email: decoded.email || profile.email,
      xp: profile.xp,
      level: profile.level,
      streak: profile.streak,
      longestStreak: profile.longest_streak,
      lastActiveDate: profile.last_active_date,
      dailyXpGoal: profile.daily_xp_goal,
      dailyXpEarned: profile.daily_xp_earned,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

module.exports = { protect };
