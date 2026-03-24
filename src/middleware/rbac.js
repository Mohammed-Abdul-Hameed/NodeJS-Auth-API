/**
 * RBAC (Role-Based Access Control) Middleware
 * --------------------------------------------
 * Provides role-based authorization for protected routes.
 *
 * Usage:
 *   // Require specific roles
 *   router.get('/admin', auth, requireRole('admin'), handler)
 *
 *   // Require any of multiple roles
 *   router.get('/editor', auth, requireRole('admin', 'editor'), handler)
 *
 *   // Require all of multiple roles
 *   router.get('/special', auth, requireAllRoles('admin', 'moderator'), handler)
 */

/**
 * Creates middleware that checks if user has at least one of the specified roles.
 * @param  {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
const requireRole = (...roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const userRoles = req.user.roles || [];
		const hasRole = roles.some((role) => userRoles.includes(role));

		if (!hasRole) {
			return res.status(403).json({
				error: 'Insufficient permissions',
				required: roles,
				current: userRoles,
			});
		}

		next();
	};
};

/**
 * Creates middleware that checks if user has ALL of the specified roles.
 * @param  {...string} roles - Required roles
 * @returns {Function} Express middleware
 */
const requireAllRoles = (...roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const userRoles = req.user.roles || [];
		const hasAllRoles = roles.every((role) => userRoles.includes(role));

		if (!hasAllRoles) {
			return res.status(403).json({
				error: 'Insufficient permissions',
				required: roles,
				current: userRoles,
			});
		}

		next();
	};
};

/**
 * Check if user has specific role (helper for use in controllers).
 * @param {Object} user - User object
 * @param {string} role - Role to check
 * @returns {boolean}
 */
const hasRole = (user, role) => {
	const roles = user.roles || [];
	return roles.includes(role);
};

module.exports = {
	requireRole,
	requireAllRoles,
	hasRole,
};
