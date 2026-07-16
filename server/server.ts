import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import dotenv from 'dotenv';
// Load env vars
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import connectDB from './config/db';
import errorHandler from './middleware/errorHandler';

import authRoutes from './routes/auth';
import tracksRoutes from './routes/tracks';
import lessonsRoutes from './routes/lessons';
import progressRoutes from './routes/progress';
import usersRoutes from './routes/users';
import aiRoutes from './routes/ai';
import adminRoutes from './routes/admin';
import practiceRoutes from './routes/practice';
import notificationsRoutes from './routes/notifications';
import rewardsRoutes from './routes/rewards';
import communityRoutes from './routes/community';

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', tracksRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/community', communityRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n  🚀 Learn Station API running on port ${PORT}`);
  console.log(`  📚 Environment: ${process.env.NODE_ENV}`);
  console.log(`  🔗 http://localhost:${PORT}\n`);
});
