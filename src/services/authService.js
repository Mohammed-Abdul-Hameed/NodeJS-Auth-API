const User = require('../model/User');
const bcrypt = require('bcrypt');

/**
 * Register a new user
 * @param {String} email
 * @param {String} password
 * @returns {Object} Created user
 */
const registerUser = async (email, password) => {
	const existingUser = await User.findOne({ email });
	if (existingUser) {
		throw new Error('User already exists');
	}

	const user = new User({ email, password });
	await user.save();
	return user;
};

/**
 * Login user
 * @param {String} email
 * @param {String} password
 * @returns {Object} User object if successful
 */
const loginUser = async (email, password) => {
	const user = await User.findOne({ email }).select('+password');
	if (!user) {
		throw new Error('Invalid Credentials');
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error('Invalid Credentials');
	}

	return user;
};

const getUserById = async (id) => {
	const user = await User.findById(id);
	if (!user) {
		throw new Error('User not found');
	}
	return user;
};

module.exports = {
	registerUser,
	loginUser,
	getUserById,
};
