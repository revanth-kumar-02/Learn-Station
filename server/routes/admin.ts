import express from 'express';
import { protect, requireAdmin } from '../middleware/auth';
import {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getTracks,
  createTrack,
  updateTrack,
  deleteTrack,
  getModules,
  createModule,
  updateModule,
  deleteModule,
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getSettings,
  updateSettings,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  sendAdminNotification,
  previewNotification,
} from '../controllers/adminController';

const router = express.Router();

// Enforce auth & admin rights for all endpoints in this file
router.use(protect);
router.use(requireAdmin);

// Statistics
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Tracks
router.get('/tracks', getTracks);
router.post('/tracks', createTrack);
router.put('/tracks/:id', updateTrack);
router.delete('/tracks/:id', deleteTrack);

// Modules
router.get('/modules', getModules);
router.post('/modules', createModule);
router.put('/modules/:id', updateModule);
router.delete('/modules/:id', deleteModule);

// Lessons
router.get('/lessons', getLessons);
router.post('/lessons', createLesson);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);

// Challenges (Quizzes)
router.get('/challenges', getChallenges);
router.post('/challenges', createChallenge);
router.put('/challenges/:id', updateChallenge);
router.delete('/challenges/:id', deleteChallenge);

// System Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Admin Notifications
router.post('/notifications', sendAdminNotification);
router.post('/notifications/preview', previewNotification);

export default router;
