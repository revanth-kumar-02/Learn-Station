const express = require('express');
const router = express.Router();
const { getAllProgress, getTrackProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAllProgress);
router.get('/:trackSlug', protect, getTrackProgress);

module.exports = router;
