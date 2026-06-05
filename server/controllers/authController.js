const { supabase } = require('../config/db');

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    res.json({
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  register: (req, res) => res.status(400).json({ message: 'Auth handled directly via Supabase Auth Client' }),
  login: (req, res) => res.status(400).json({ message: 'Auth handled directly via Supabase Auth Client' }),
  refresh: (req, res) => res.status(400).json({ message: 'Auth handled directly via Supabase Auth Client' }),
};
