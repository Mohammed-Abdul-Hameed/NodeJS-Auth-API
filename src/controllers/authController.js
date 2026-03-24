const authService = require('../services/authService');
const tokenService = require('../services/tokenService');
const { getSequelize } = require('../db');
const VerificationTokenModel = require('../model/VerificationToken');
const UserModel = require('../model/User');

// Lazy load models to ensure sequelize is initialized
const getVerificationTokenModel = () => {
	const sequelize = getSequelize();
	return VerificationTokenModel(sequelize);
};

const getUserModel = () => {
	const sequelize = getSequelize();
	return UserModel(sequelize);
};

/**
 * Register a new user.
 * Validates input -> creates user -> issues tokens -> sets refresh cookie.
 */
const register = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await authService.registerUser(email, password);

		// Create verification token
		const VerificationToken = getVerificationTokenModel();
		await VerificationToken.createToken(user.id);

		const accessToken = tokenService.generateAccessToken(user);
		const refreshToken = await tokenService.generateRefreshToken(user);
		setTokenCookie(res, refreshToken.token);

		res.status(201).json({
			accessToken,
			user: {
				id: user.id,
				email: user.email,
				roles: user.roles,
				isVerified: user.isVerified,
			},
			message: 'Registration successful. Please verify your email.',
		});
	} catch (err) {
		console.error(err.message);
		if (err.message === 'User already exists') {
			return res.status(400).json({ error: err.message });
		}
		res.status(500).json({ error: 'Server Error' });
	}
};

/**
 * Verify user email with token.
 */
const verifyEmail = async (req, res) => {
	const { token } = req.body;

	if (!token) {
		return res.status(400).json({ error: 'Verification token is required' });
	}

	try {
		const VerificationToken = getVerificationTokenModel();
		const verificationToken = await VerificationToken.findValidToken(token);

		// Update user as verified
		const User = getUserModel();
		const user = await User.findByPk(verificationToken.userId);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		user.isVerified = true;
		await user.save();

		// Delete the used verification token
		await verificationToken.destroy();

		res.json({ message: 'Email verified successfully' });
	} catch (err) {
		console.error(err.message);
		res.status(400).json({ error: err.message });
	}
};

/**
 * Resend verification email.
 */
const resendVerification = async (req, res) => {
	const { email } = req.body;

	if (!email) {
		return res.status(400).json({ error: 'Email is required' });
	}

	try {
		const User = getUserModel();
		const user = await User.findOne({ where: { email } });

		if (!user) {
			// Don't reveal if user exists
			return res.json({ message: 'If the email exists, a verification link has been sent' });
		}

		if (user.isVerified) {
			return res.status(400).json({ error: 'Email is already verified' });
		}

		const VerificationToken = getVerificationTokenModel();
		await VerificationToken.createToken(user.id);

		res.json({ message: 'Verification email sent' });
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ error: 'Server Error' });
	}
};

/**
 * Login user.
 * Verifies credentials -> issues fresh tokens.
 */
const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await authService.loginUser(email, password);

		// Check if email is verified
		if (!user.isVerified) {
			return res.status(401).json({
				error: 'Email not verified',
				message: 'Please verify your email before logging in',
			});
		}

		const accessToken = tokenService.generateAccessToken(user);
		const refreshToken = await tokenService.generateRefreshToken(user);
		setTokenCookie(res, refreshToken.token);

		res.json({
			accessToken,
			user: {
				id: user.id,
				email: user.email,
				roles: user.roles,
			},
		});
	} catch (err) {
		console.error(err.message);
		if (err.message === 'Invalid Credentials') {
			return res.status(400).json({ error: err.message });
		}
		res.status(500).json({ error: 'Server Error' });
	}
};

/**
 * Refresh access token using a valid refresh token.
 * Implements refresh token rotation for security.
 */
const refreshToken = async (req, res) => {
	const token = req.cookies.refreshToken || req.body.refreshToken;

	if (!token) {
		return res.status(400).json({ error: 'Token is required' });
	}

	try {
		const refreshTokenDoc = await tokenService.getRefreshToken(token);
		const { user } = refreshTokenDoc;

		const newRefreshToken = await tokenService.generateRefreshToken(user);
		refreshTokenDoc.revoked = new Date();
		refreshTokenDoc.replacedByToken = newRefreshToken.token;
		await refreshTokenDoc.save();

		const accessToken = tokenService.generateAccessToken(user);
		setTokenCookie(res, newRefreshToken.token);

		res.json({
			accessToken,
		});
	} catch (err) {
		console.error(err.message);
		res.status(400).json({ error: 'Invalid Refresh Token' });
	}
};

/**
 * Logout.
 * Revokes refresh token so it can't be used again.
 */
const revokeToken = async (req, res) => {
	const token = req.cookies.refreshToken || req.body.refreshToken;

	if (!token) {
		return res.status(400).json({ error: 'Token is required' });
	}

	await tokenService.revokeToken(token);
	res.status(200).json({ message: 'Token revoked' });
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
		res.status(500).json({ error: 'Server Error' });
	}
};

/**
 * Helper to attach refresh token as HttpOnly cookie.
 * HttpOnly prevents frontend JS from reading the token.
 */
function setTokenCookie(res, token) {
	const isProduction = process.env.NODE_ENV === 'production';
	const cookieOptions = {
		httpOnly: true,
		expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		secure: isProduction,
		sameSite: isProduction ? 'strict' : 'lax',
	};

	res.cookie('refreshToken', token, cookieOptions);
}

module.exports = {
	register,
	login,
	verifyEmail,
	resendVerification,
	refreshToken,
	revokeToken,
	getMe,
};