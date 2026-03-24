const Joi = require('joi');

/**
 * Middleware factory for validating request data using Joi schemas.
 * Supports validation of body, params, query, and headers.
 */
const validate = (schema, property = 'body') => {
	return (req, res, next) => {
		const { error, value } = schema.validate(req[property], {
			abortEarly: false,
			stripUnknown: true,
		});

		if (error) {
			const errors = error.details.map((detail) => ({
				field: detail.path.join('.'),
				message: detail.message,
			}));

			return res.status(400).json({
				error: 'Validation failed',
				details: errors,
			});
		}

		req[property] = value;
		next();
	};
};

// Common validation schemas
const schemas = {
	register: Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string()
			.min(8)
			.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
			.required()
			.messages({
				'string.pattern.base':
					'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
			}),
	}),

	login: Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().required(),
	}),

	refresh: Joi.object({
		refreshToken: Joi.string(),
	}),

	logout: Joi.object({
		refreshToken: Joi.string(),
	}),

	verifyEmail: Joi.object({
		token: Joi.string().required(),
	}),

	resendVerification: Joi.object({
		email: Joi.string().email().required(),
	}),
};

module.exports = {
	validate,
	schemas,
};
