import express from 'express';
import { 
  generatePath, mentorChat, generateQuiz, generatePractice, 
  generateFlashcards, interviewChat, interviewEvaluate, 
  plannerRoadmap, studyAssist, careerCoach, detectWeakness 
} from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/generate', protect, generatePath);
router.post('/mentor', protect, mentorChat);
router.post('/quiz/generate', protect, generateQuiz);
router.post('/practice/generate', protect, generatePractice);
router.post('/flashcards/generate', protect, generateFlashcards);
router.post('/interview/chat', protect, interviewChat);
router.post('/interview/evaluate', protect, interviewEvaluate);
router.post('/planner/roadmap', protect, plannerRoadmap);
router.post('/study/assist', protect, studyAssist);
router.post('/career/coach', protect, careerCoach);
router.post('/detect-weakness', protect, detectWeakness);

export default router;
