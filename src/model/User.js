const { mongoose } = require('../db');
const bcrypt = require('bcrypt');

/**
 * User Schema
 * -----------
 * Represents application users.
 * Handles authentication-related fields and security metadata.
 */
const UserSchema = new mongoose.Schema(
	{
		// User email - unique identifier for login
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},

		// Hashed password (never returned in queries by default)
		password: {
			type: String,
			required: true,
			select: false,
		},

		// User roles for authorization (RBAC-ready)
		roles: {
			type: [String],
			default: ['user'],
		},

		// Flag for email verification status
		isVerified: {
			type: Boolean,
			default: false,
		},

		// Counts consecutive failed login attempts
		// Useful for brute-force protection
		failedLoginAttempts: {
			type: Number,
			default: 0,
		},

		// If set, user account is locked until this time
		lockUntil: {
			type: Date,
			default: null,
		},

		// Timestamp of last password change
		// Useful for invalidating old tokens
		passwordChangedAt: {
			type: Date,
			default: null,
		},
	},
	{
		// Automatically adds createdAt and updatedAt fields
		timestamps: true,
	},
);

// Index is already ensured by `unique: true`
// UserSchema.index({ email: 1 }, { unique: true });

const SALT_ROUNDS = 10;
// 10 rounds = reasonable dev default.

/**
 * Pre-save hook
 * -------------
 * Automatically hashes password before storing.
 * Runs only when password field is newly set or modified.
 */
UserSchema.pre('save', async function (next) {
	// Skip hashing if password hasn't changed
	if (!this.isModified('password')) return next();

	try {
		// Hash plain-text password
		const hash = await bcrypt.hash(this.password, SALT_ROUNDS);

		// Replace plain password with hashed version
		this.password = hash;

		// Record when password was last changed
		this.passwordChangedAt = new Date();

		next();
	} catch (err) {
		next(err);
	}
});

// Export User model
module.exports = mongoose.model('User', UserSchema);
