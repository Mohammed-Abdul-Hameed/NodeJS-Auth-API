const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { getSequelize } = require('../db');

/**
 * User Model
 * ----------
 * Represents application users.
 * Uses Sequelize ORM for PostgreSQL.
 */
function User(sequelize) {
	if (!sequelize) {
		sequelize = getSequelize();
	}

	const User = sequelize.define('User', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true,
			},
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		roles: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			defaultValue: ['user'],
		},
		isVerified: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		failedLoginAttempts: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		lockUntil: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		passwordChangedAt: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	}, {
		tableName: 'users',
		timestamps: true,
		hooks: {
			beforeSave: async (user) => {
				if (user.changed('password')) {
					const salt = await bcrypt.genSalt(10);
					user.password = await bcrypt.hash(user.password, salt);
					user.passwordChangedAt = new Date();
				}
			},
		},
	});

	// Instance method to compare passwords
	User.prototype.comparePassword = async function (candidatePassword) {
		return bcrypt.compare(candidatePassword, this.password);
	};

	return User;
}

module.exports = User;