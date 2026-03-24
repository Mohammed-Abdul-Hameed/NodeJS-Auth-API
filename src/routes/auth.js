const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter, refreshLimiter } = require('../middleware/rateLimiter');
const { validate, schemas } = require('../middleware/validation');

// @route   POST api/v1/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', authLimiter, validate(schemas.register), authController.register);

// @route   POST api/v1/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authLimiter, validate(schemas.login), authController.login);

// @route   POST api/v1/auth/refresh
// @desc    Get new access token
// @access  Public
router.post('/refresh', refreshLimiter, validate(schemas.refresh), authController.refreshToken);

// @route   POST api/v1/auth/logout
// @desc    Logout
// @access  Public
router.post('/logout', validate(schemas.logout), authController.revokeToken);

// @route   POST api/v1/auth/verify-email
// @desc    Verify user email
// @access  Public
router.post('/verify-email', validate(schemas.verifyEmail), authController.verifyEmail);

// @route   POST api/v1/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', authLimiter, validate(schemas.resendVerification), authController.resendVerification);

module.exports = router;
