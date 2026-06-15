import express from 'express';
import { getCompletedLessons, completePracticeActivity } from '../controllers/practiceController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getCompletedLessons);
router.post('/complete', protect, completePracticeActivity);

export default router;
