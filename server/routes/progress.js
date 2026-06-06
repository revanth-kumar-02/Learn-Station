const express = require('express');
const router = express.Router();
const { getAllProgress, getTrackProgress, submitCapstoneProject, getCertificate } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAllProgress);
router.get('/:trackSlug', protect, getTrackProgress);
router.post('/capstone/submit', protect, submitCapstoneProject);
router.get('/certificate/:certId', getCertificate); // public route

module.exports = router;
