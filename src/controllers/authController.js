const authService = require('../services/authService');
const tokenService = require('../services/tokenService');
const Joi = require('joi');

const register = async (req, res) => {
	const schema = Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().min(6).required(),
	});

	const { error } = schema.validate(req.body);
	if (error) {
		return res.status(400).json({ msg: error.details[0].message });
	}

	const { email, password } = req.body;

	try {
		const user = await authService.registerUser(email, password);
		const accessToken = tokenService.generateAccessToken({ user: { id: user.id } });
		const refreshToken = await tokenService.generateRefreshToken(user);
		setTokenCookie(res, refreshToken.token);

		res.status(201).json({
			accessToken,
			refreshToken: refreshToken.token,
			user: {
				id: user.id,
				email: user.email,
				username: user.username, // Assuming username exists if added to model, otherwise just email
			},
		});
	} catch (err) {
		console.error(err.message);
		if (err.message === 'User already exists') {
			return res.status(400).json({ msg: err.message });
		}
		res.status(500).send('Server Error');
	}
};

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
		const user = await authService.loginUser(email, password);
		const accessToken = tokenService.generateAccessToken({ user: { id: user.id } });
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

const refreshToken = async (req, res) => {
	const token = req.cookies.refreshToken || req.body.refreshToken;
	if (!token) {
		return res.status(400).json({ msg: 'Token is required' });
	}

	try {
		const refreshTokenDoc = await tokenService.getRefreshToken(token);
		const { user } = refreshTokenDoc;

		// Rotate token
		const newRefreshToken = await tokenService.generateRefreshToken(user);
		refreshTokenDoc.revoked = Date.now();
		refreshTokenDoc.replacedByToken = newRefreshToken.token;
		await refreshTokenDoc.save();

		const accessToken = tokenService.generateAccessToken({ user: { id: user.id } });
		setTokenCookie(res, newRefreshToken.token);

		res.json({ accessToken, refreshToken: newRefreshToken.token });
	} catch (err) {
		console.error(err.message);
		res.status(400).json({ msg: 'Invalid Refresh Token' });
	}
};

const revokeToken = async (req, res) => {
	const token = req.cookies.refreshToken || req.body.refreshToken;
	if (!token) {
		return res.status(400).json({ msg: 'Token is required' });
	}

	await tokenService.revokeToken(token);
	res.status(200).json({ msg: 'Token revoked' });
};

const getMe = async (req, res) => {
	try {
		const user = await authService.getUserById(req.user.id);
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

function setTokenCookie(res, token) {
	const cookieOptions = {
		httpOnly: true,
		expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		// secure: process.env.NODE_ENV === 'production', // true in prod
	};
	res.cookie('refreshToken', token, cookieOptions);
}

module.exports = { register, login, refreshToken, revokeToken, getMe };
