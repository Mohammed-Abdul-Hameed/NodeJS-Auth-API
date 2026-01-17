const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.login);

// @route   POST api/auth/refresh
// @desc    Get new access token
// @access  Public
router.post('/refresh', authController.refreshToken);

// @route   POST api/auth/logout
// @desc    Logout
// @access  Public
router.post('/logout', authController.revokeToken);

module.exports = router;
