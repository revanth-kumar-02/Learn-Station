const express = require('express');
const router = express.Router();
const { generatePath, mentorChat } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generatePath);
router.post('/mentor', protect, mentorChat);

module.exports = router;
