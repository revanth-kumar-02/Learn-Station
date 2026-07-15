import express from 'express';
import { 
  getAllProgress, 
  getTrackProgress, 
  submitCapstoneProject, 
  getCertificate,
  submitAssessment,
  getAssessmentStatus,
  getAssessmentQuestions
} from '../controllers/progressController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getAllProgress);
router.post('/assessment/submit', protect, submitAssessment);
router.get('/assessment/status', protect, getAssessmentStatus);
router.get('/assessment/questions', protect, getAssessmentQuestions);
router.get('/:trackSlug', protect, getTrackProgress);
router.post('/capstone/submit', protect, submitCapstoneProject);
router.get('/certificate/:certId', getCertificate); // public route

export default router;
