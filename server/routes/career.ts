import express from 'express';
import { 
  getResume, saveResume, 
  getPortfolio, savePortfolio, getPublicPortfolioBySlug,
  getShowcasedProjects, saveShowcasedProject, deleteShowcasedProject, 
  connectGithub, getPlacementPrep, getLearningReports 
} from '../controllers/careerController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Resume
router.get('/resume', protect, getResume);
router.post('/resume/save', protect, saveResume);

// Portfolio
router.get('/portfolio', protect, getPortfolio);
router.post('/portfolio/save', protect, savePortfolio);
router.get('/portfolio/public/:slug', getPublicPortfolioBySlug); // Public route

// Project Showcase
router.get('/projects', protect, getShowcasedProjects);
router.post('/projects/save', protect, saveShowcasedProject);
router.post('/projects/delete', protect, deleteShowcasedProject);

// Integrations
router.post('/github/connect', protect, connectGithub);

// Placement & Reports
router.get('/placement-prep', protect, getPlacementPrep);
router.get('/learning-reports', protect, getLearningReports);

export default router;
