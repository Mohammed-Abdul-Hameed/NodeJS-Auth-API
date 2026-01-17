const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   GET api/user/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, authController.getMe);

module.exports = router;
