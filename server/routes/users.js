const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAchievements, getActivity, getPublicProfile, getLeaderboard } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.get('/me/achievements', protect, getAchievements);
router.get('/me/activity', protect, getActivity);
router.get('/leaderboard', getLeaderboard); // public route
router.get('/public/:username', getPublicProfile); // public route

module.exports = router;
