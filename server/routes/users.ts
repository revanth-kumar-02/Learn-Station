import express from 'express';
import { getProfile, updateProfile, getAchievements, getActivity, getPublicProfile, getLeaderboard } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.get('/me/achievements', protect, getAchievements);
router.get('/me/activity', protect, getActivity);
router.get('/leaderboard', getLeaderboard); // public route
router.get('/public/:username', getPublicProfile); // public route

export default router;
