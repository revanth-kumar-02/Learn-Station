import express from 'express';
import { generatePath, mentorChat } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/generate', protect, generatePath);
router.post('/mentor', protect, mentorChat);

export default router;
