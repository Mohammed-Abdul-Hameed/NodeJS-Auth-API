const { mongoose } = require('../db');

/**
 * Refresh Token Schema
 * --------------------
 * Stores refresh tokens in the database so they can be:
 * - Revoked on logout
 * - Rotated on refresh
 * - Tracked for reuse detection
 *
 * This prevents stolen refresh tokens from being reused forever.
 */
const RefreshTokenSchema = new mongoose.Schema({
	// Reference to the user this token belongs to
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},

	// Actual refresh token string issued to the client
	token: {
		type: String,
		required: true,
	},

	// When this token should expire automatically
	expires: {
		type: Date,
		required: true,
	},

	// Timestamp when token was created
	created: {
		type: Date,
		default: Date.now,
	},

	// If set, token has been revoked (logout or token rotation)
	revoked: {
		type: Date,
	},

	// Stores the new token that replaced this one during rotation
	replacedByToken: {
		type: String,
	},
});

/**
 * Virtual property: checks if token is expired
 * (compares current time with expiry date)
 */
RefreshTokenSchema.virtual('isExpired').get(function () {
	return Date.now() >= this.expires;
});

/**
 * Virtual property: checks if token is currently valid
 * Active = not revoked AND not expired
 */
RefreshTokenSchema.virtual('isActive').get(function () {
	return !this.revoked && !this.isExpired;
});

// Export RefreshToken model
module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);

