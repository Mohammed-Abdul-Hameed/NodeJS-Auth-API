const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: { error: 'Too many requests, please try again later.' },
	standardHeaders: true,
	legacyHeaders: false,
});

// Strict limiter for authentication endpoints (login, signup)
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 attempts per windowMs
	message: { error: 'Too many authentication attempts, please try again later.' },
	standardHeaders: true,
	legacyHeaders: false,
});

// Stricter limiter for refresh token endpoint
const refreshLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 30, // Limit each IP to 30 requests per minute
	message: { error: 'Too many refresh requests, please try again later.' },
	standardHeaders: true,
	legacyHeaders: false,
});

module.exports = {
	apiLimiter,
	authLimiter,
	refreshLimiter,
};
