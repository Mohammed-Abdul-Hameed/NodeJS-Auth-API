const { mongoose } = require('../db');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},

		password: {
			type: String,
			required: true,
			select: false,
		},

		roles: {
			type: [String],
			default: ['user'],
		},

		isVerified: {
			type: Boolean,
			default: false,
		},

		failedLoginAttempts: {
			type: Number,
			default: 0,
		},

		lockUntil: {
			type: Date,
			default: null,
		},

		passwordChangedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	},
);

// UserSchema.index({ email: 1 }, { unique: true });

const SALT_ROUNDS = 10; // acceptable for dev; can raise in production

UserSchema.pre('save', async function (next) {
	// Only hash if password field is new or modified
	if (!this.isModified('password')) return next();

	try {
		const hash = await bcrypt.hash(this.password, SALT_ROUNDS);
		this.password = hash;
		this.passwordChangedAt = new Date();
		next();
	} catch (err) {
		next(err);
	}
});

module.exports = mongoose.model('User', UserSchema);
