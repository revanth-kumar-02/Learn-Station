import express from 'express';
import { getLesson, completeLesson } from '../controllers/lessonController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/:slug', protect, getLesson);
router.post('/:slug/complete', protect, completeLesson);

export default router;
