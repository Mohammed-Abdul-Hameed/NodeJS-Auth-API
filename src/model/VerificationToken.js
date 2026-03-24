const { DataTypes } = require('sequelize');
const crypto = require('crypto');
const { getSequelize } = require('../db');

/**
 * Email Verification Token Model
 * --------------------------------
 * Stores one-time verification tokens for email confirmation.
 */
function VerificationToken(sequelize) {
	if (!sequelize) {
		sequelize = getSequelize();
	}

	const VerificationToken = sequelize.define('VerificationToken', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			field: 'user_id',
			references: {
				model: 'users',
				key: 'id',
			},
		},
		token: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		expires: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	}, {
		tableName: 'verification_tokens',
		timestamps: true,
		updatedAt: false,
	});

	// Static method to create a verification token for a user
	VerificationToken.createToken = async function (userId) {
		// Delete any existing verification tokens for this user
		await this.destroy({ where: { userId } });

		// Generate cryptographically secure token
		const token = crypto.randomBytes(32).toString('hex');

		// Set expiry to 24 hours
		const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

		const verificationToken = await this.create({
			userId,
			token,
			expires,
		});

		return verificationToken;
	};

	// Static method to find and validate a token
	VerificationToken.findValidToken = async function (token) {
		const verificationToken = await this.findOne({ where: { token } });

		if (!verificationToken) {
			throw new Error('Invalid verification token');
		}

		if (verificationToken.expires < new Date()) {
			throw new Error('Verification token has expired');
		}

		return verificationToken;
	};

	return VerificationToken;
}

module.exports = VerificationToken;