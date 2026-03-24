const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getSequelize } = require('../db');
const RefreshTokenModel = require('../model/RefreshToken');

/**
 * Token Service
 * --------------
 * Handles creation and validation of access and refresh tokens.
 * Access tokens = short-lived JWTs.
 * Refresh tokens = long-lived random strings stored in database.
 */

// Lazy load model to ensure sequelize is initialized
const getRefreshTokenModel = () => {
	const sequelize = getSequelize();
	return RefreshTokenModel(sequelize);
};

/**
 * Generates a short-lived JWT access token.
 * This token is sent with every protected request.
 */
const generateAccessToken = (user) => {
	// Include user id and roles in the token
	return jwt.sign(
		{
			user: {
				id: user.id,
				roles: user.roles || ['user'],
			},
		},
		process.env.JWT_SECRET,
		{
			expiresIn: '15m', // short lifetime limits damage if stolen
		}
	);
};

/**
 * Generates a refresh token and stores it in the database.
 * Random bytes are used instead of JWTs so tokens can't be decoded or forged.
 */
const generateRefreshToken = async (user) => {
	const RefreshToken = getRefreshTokenModel();

	// Create cryptographically strong random token
	const token = crypto.randomBytes(40).toString('hex');

	// Set refresh token expiry (7 days)
	const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

	// Store refresh token in DB linked to user
	const refreshToken = await RefreshToken.create({
		userId: user.id,
		token,
		expires,
	});

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
	const RefreshToken = getRefreshTokenModel();

	const refreshToken = await RefreshToken.findOne({
		where: { token },
		include: ['user'],
	});

	// Virtual fields: isExpired and isActive come from model
	if (!refreshToken || !refreshToken.isActive()) {
		throw new Error('Invalid refresh token');
	}

	return refreshToken;
};

/**
 * Revokes a refresh token.
 * Called during logout or token reuse detection.
 */
const revokeToken = async (token) => {
	const RefreshToken = getRefreshTokenModel();

	const refreshToken = await RefreshToken.findOne({ where: { token } });

	if (refreshToken) {
		refreshToken.revoked = new Date();
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