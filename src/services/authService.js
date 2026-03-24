const { getSequelize } = require('../db');
const UserModel = require('../model/User');

/**
 * Auth Service
 * -------------
 * Contains business logic for user authentication.
 * Controllers call this layer - models stay isolated from request handling.
 */

// Lazy load model to ensure sequelize is initialized
const getUserModel = () => {
	const sequelize = getSequelize();
	return UserModel(sequelize);
};

/**
 * Registers a new user.
 * - Checks if email already exists
 * - Creates user
 * - Password hashing is handled by the User model hook
 */
const registerUser = async (email, password) => {
	const User = getUserModel();

	// Prevent duplicate accounts
	const existingUser = await User.findOne({ where: { email } });
	if (existingUser) {
		throw new Error('User already exists');
	}

	// Create and save new user
	const user = await User.create({ email, password });

	return user;
};

/**
 * Logs in a user.
 * - Fetches user by email
 * - Compares hashed password
 * - Returns user if credentials are valid
 */
const loginUser = async (email, password) => {
	const User = getUserModel();

	const user = await User.findOne({ where: { email } });
	if (!user) {
		throw new Error('Invalid Credentials');
	}

	// Compare provided password with stored hash
	const isMatch = await user.comparePassword(password);
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
	const User = getUserModel();

	const user = await User.findByPk(id);
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