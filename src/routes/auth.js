const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.login);

// @route   POST api/auth/refresh-token
// @desc    Get new access token
// @access  Public
router.post('/refresh-token', authController.refreshToken);

// @route   POST api/auth/revoke-token
// @desc    Logout
// @access  Public
router.post('/revoke-token', authController.revokeToken);

// @route   GET api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', require('../middleware/auth'), authController.getMe);

module.exports = router;
