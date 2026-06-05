const express = require('express');
const router = express.Router();
const { getLesson, completeLesson } = require('../controllers/lessonController');
const { protect } = require('../middleware/auth');

router.get('/:slug', protect, getLesson);
router.post('/:slug/complete', protect, completeLesson);

module.exports = router;
