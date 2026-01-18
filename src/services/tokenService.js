const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../model/RefreshToken');

/**
 * Token Service
 * --------------
 * Handles creation and validation of access and refresh tokens.
 * Access tokens = short-lived JWTs.
 * Refresh tokens = long-lived random strings stored in database.
 */

/**
 * Generates a short-lived JWT access token.
 * This token is sent with every protected request.
 */
const generateAccessToken = (payload) => {
	return jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: '15m', // short lifetime limits damage if stolen
	});
};

/**
 * Generates a refresh token and stores it in the database.
 * Random bytes are used instead of JWTs so tokens can't be decoded or forged.
 */
const generateRefreshToken = async (user) => {
	// Create cryptographically strong random token
	const token = crypto.randomBytes(40).toString('hex');

	// Set refresh token expiry (7 days)
	const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

	// Store refresh token in DB linked to user
	const refreshToken = new RefreshToken({
		user: user.id,
		token,
		expires,
	});

	await refreshToken.save();
	return refreshToken;
};

/**
 * Verifies access token validity.
 * Used by auth middleware to protect routes.
 */
const verifyAccessToken = (token) => {
	return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Retrieves refresh token from DB and checks validity.
 * Rejects expired or revoked tokens.
 */
const getRefreshToken = async (token) => {
	const refreshToken = await RefreshToken.findOne({ token }).populate('user');

	// Virtual fields: isExpired and isActive come from model
	if (!refreshToken || !refreshToken.isActive) {
		throw new Error('Invalid refresh token');
	}

	return refreshToken;
};

/**
 * Revokes a refresh token.
 * Called during logout or token reuse detection.
 */
const revokeToken = async (token) => {
	const refreshToken = await RefreshToken.findOne({ token });

	if (refreshToken) {
		refreshToken.revoked = Date.now();
		await refreshToken.save();
	}
};

module.exports = {
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
	getRefreshToken,
	revokeToken,
};
