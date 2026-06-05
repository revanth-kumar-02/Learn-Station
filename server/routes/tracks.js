const express = require('express');
const router = express.Router();
const { getTracks, getTrack } = require('../controllers/trackController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getTracks);
router.get('/:slug', protect, getTrack);

module.exports = router;
