const { DataTypes } = require('sequelize');
const { getSequelize } = require('../db');

/**
 * Refresh Token Model
 * -------------------
 * Stores refresh tokens in the database so they can be:
 * - Revoked on logout
 * - Rotated on refresh
 * - Tracked for reuse detection
 *
 * This prevents stolen refresh tokens from being reused forever.
 */
function RefreshToken(sequelize) {
	if (!sequelize) {
		sequelize = getSequelize();
	}

	const RefreshToken = sequelize.define('RefreshToken', {
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
		},
		expires: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		revoked: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		replacedByToken: {
			type: DataTypes.STRING,
			allowNull: true,
			field: 'replaced_by_token',
		},
	}, {
		tableName: 'refresh_tokens',
		timestamps: true,
		createdAt: 'created',
		updatedAt: false,
	});

	// Instance methods for checking token status
	RefreshToken.prototype.isExpired = function () {
		return new Date() >= this.expires;
	};

	RefreshToken.prototype.isActive = function () {
		return !this.revoked && !this.isExpired();
	};

	return RefreshToken;
}

module.exports = RefreshToken;