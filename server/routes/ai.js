const express = require('express');
const router = express.Router();
const { generatePath } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generatePath);

module.exports = router;
