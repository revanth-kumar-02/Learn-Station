import express from 'express';
import { getRewardsStatus, purchaseRewardItem, equipCosmetic, claimChallenge } from '../controllers/rewardsController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/status', protect, getRewardsStatus);
router.post('/purchase', protect, purchaseRewardItem);
router.post('/equip', protect, equipCosmetic);
router.post('/claim-challenge', protect, claimChallenge);

export default router;
