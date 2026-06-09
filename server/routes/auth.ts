import express from 'express';
import { register, login, refresh, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);

export default router;
