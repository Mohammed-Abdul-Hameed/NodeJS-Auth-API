const User = require('../model/User');
const bcrypt = require('bcrypt');

/**
 * Auth Service
 * -------------
 * Contains business logic for user authentication.
 * Controllers call this layer - models stay isolated from request handling.
 */

/**
 * Registers a new user.
 * - Checks if email already exists
 * - Creates user
 * - Password hashing is handled by the User model pre-save hook
 */
const registerUser = async (email, password) => {
	// Prevent duplicate accounts
	const existingUser = await User.findOne({ email });
	if (existingUser) {
		throw new Error('User already exists');
	}

	// Create and save new user
	const user = new User({ email, password });
	await user.save();

	return user;
};

/**
 * Logs in a user.
 * - Fetches user by email
 * - Compares hashed password
 * - Returns user if credentials are valid
 */
const loginUser = async (email, password) => {
	// Explicitly select password since it's excluded by default
	const user = await User.findOne({ email }).select('+password');
	if (!user) {
		throw new Error('Invalid Credentials');
	}

	// Compare provided password with stored hash
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error('Invalid Credentials');
	}

	return user;
};

/**
 * Fetch user by ID.
 * Used by protected routes once token is verified.
 */
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
