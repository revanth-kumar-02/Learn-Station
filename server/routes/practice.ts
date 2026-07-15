import express from 'express';
import { 
  getCompletedLessons, 
  completePracticeActivity,
  generatePracticeChallenge,
  validatePracticeSolution,
  getCodingAnalytics
} from '../controllers/practiceController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getCompletedLessons);
router.post('/complete', protect, completePracticeActivity);
router.post('/generate', protect, generatePracticeChallenge);
router.post('/validate', protect, validatePracticeSolution);
router.get('/analytics', protect, getCodingAnalytics);

export default router;
