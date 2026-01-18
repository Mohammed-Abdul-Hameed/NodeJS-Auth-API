const authService = require('../services/authService');
const tokenService = require('../services/tokenService');
const Joi = require('joi');

/**
 * Register a new user.
 * Validates input → creates user → issues tokens → sets refresh cookie.
 */
const register = async (req, res) => {
	// Define input validation schema
	const schema = Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().min(6).required(),
	});

	// Validate request body before doing anything else
	const { error } = schema.validate(req.body);
	if (error) {
		return res.status(400).json({ msg: error.details[0].message });
	}

	const { email, password } = req.body;

	try {
		// Create user in database
		const user = await authService.registerUser(email, password);

		// Generate short-lived access token
		const accessToken = tokenService.generateAccessToken({ user: { id: user.id } });

		// Generate long-lived refresh token stored in DB
		const refreshToken = await tokenService.generateRefreshToken(user);

		// Store refresh token in HttpOnly cookie (prevents JS access)
		setTokenCookie(res, refreshToken.token);

		// Send tokens + basic user info in response
		res.status(201).json({
			accessToken,
			refreshToken: refreshToken.token,
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
			},
		});
	} catch (err) {
		console.error(err.message);

		// Handle known business-case error
		if (err.message === 'User already exists') {
			return res.status(400).json({ msg: err.message });
		}

		// Anything else is a server fault
		res.status(500).send('Server Error');
	}
};

/**
 * Login user.
 * Verifies credentials → issues fresh tokens.
 */
const login = async (req, res) => {
	const schema = Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().required(),
	});

	const { error } = schema.validate(req.body);
	if (error) {
		return res.status(400).json({ msg: error.details[0].message });
	}

	const { email, password } = req.body;

	try {
		// Verify user credentials
		const user = await authService.loginUser(email, password);

		// Generate new access token
		const accessToken = tokenService.generateAccessToken({ user: { id: user.id } });

		// Generate and store refresh token
		const refreshToken = await tokenService.generateRefreshToken(user);
		setTokenCookie(res, refreshToken.token);

		res.json({
			accessToken,
			refreshToken: refreshToken.token,
			user: {
				id: user.id,
				email: user.email,
			},
		});
	} catch (err) {
		console.error(err.message);

		if (err.message === 'Invalid Credentials') {
			return res.status(400).json({ msg: err.message });
		}

		res.status(500).send('Server Error');
	}
};

/**
 * Refresh access token using a valid refresh token.
 * Implements refresh token rotation for security.
 */
const refreshToken = async (req, res) => {
	// Accept refresh token either from cookie or request body
	const token = req.cookies.refreshToken || req.body.refreshToken;

	if (!token) {
		return res.status(400).json({ msg: 'Token is required' });
	}

	try {
		// Fetch refresh token record from database
		const refreshTokenDoc = await tokenService.getRefreshToken(token);
		const { user } = refreshTokenDoc;

		// Generate a new refresh token (rotation)
		const newRefreshToken = await tokenService.generateRefreshToken(user);

		// Mark old token as revoked and link replacement
		refreshTokenDoc.revoked = Date.now();
		refreshTokenDoc.replacedByToken = newRefreshToken.token;
		await refreshTokenDoc.save();

		// Issue new access token
		const accessToken = tokenService.generateAccessToken({ user: { id: user.id } });

		// Update cookie with new refresh token
		setTokenCookie(res, newRefreshToken.token);

		res.json({
			accessToken,
			refreshToken: newRefreshToken.token,
		});
	} catch (err) {
		console.error(err.message);
		res.status(400).json({ msg: 'Invalid Refresh Token' });
	}
};

/**
 * Logout.
 * Revokes refresh token so it can't be used again.
 */
const revokeToken = async (req, res) => {
	const token = req.cookies.refreshToken || req.body.refreshToken;

	if (!token) {
		return res.status(400).json({ msg: 'Token is required' });
	}

	// Remove or mark token as revoked in database
	await tokenService.revokeToken(token);

	res.status(200).json({ msg: 'Token revoked' });
};

/**
 * Returns current authenticated user.
 * req.user is populated by auth middleware.
 */
const getMe = async (req, res) => {
	try {
		const user = await authService.getUserById(req.user.id);
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

/**
 * Helper to attach refresh token as HttpOnly cookie.
 * HttpOnly prevents frontend JS from reading the token.
 */
function setTokenCookie(res, token) {
	const cookieOptions = {
		httpOnly: true,
		expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
		// secure: true → enable in production with HTTPS
	};

	res.cookie('refreshToken', token, cookieOptions);
}

module.exports = {
	register,
	login,
	refreshToken,
	revokeToken,
	getMe,
};
