import express from 'express';
import { getTracks, getTrack } from '../controllers/trackController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getTracks);
router.get('/:slug', protect, getTrack);

export default router;
