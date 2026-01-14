const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../model/RefreshToken');

/**
 * Generate Access Token
 * @param {Object} payload - User payload
 * @returns {String} JWT Token
 */
const generateAccessToken = (payload) => {
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' }); // Short lived
};

/**
 * Generate Refresh Token and Save to DB
 * @param {Object} user - User object
 * @returns {Object} Refresh Token Document
 */
const generateRefreshToken = async (user) => {
	const token = crypto.randomBytes(40).toString('hex');
	const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

	const refreshToken = new RefreshToken({
		user: user.id,
		token,
		expires,
	});

	await refreshToken.save();
	return refreshToken;
};

/**
 * Verify Access Token
 * @param {String} token
 * @returns {Object} decoded payload
 */
const verifyAccessToken = (token) => {
	return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Get Refresh Token from DB
 * @param {String} token
 * @returns {Object} Refresh Token Document
 */
const getRefreshToken = async (token) => {
	const refreshToken = await RefreshToken.findOne({ token }).populate('user');
	if (!refreshToken || !refreshToken.isActive) {
		throw new Error('Invalid refresh token');
	}
	return refreshToken;
};

/**
 * Revoke Token
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
