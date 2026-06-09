import express from 'express';
import { getAllProgress, getTrackProgress, submitCapstoneProject, getCertificate } from '../controllers/progressController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getAllProgress);
router.get('/:trackSlug', protect, getTrackProgress);
router.post('/capstone/submit', protect, submitCapstoneProject);
router.get('/certificate/:certId', getCertificate); // public route

export default router;
