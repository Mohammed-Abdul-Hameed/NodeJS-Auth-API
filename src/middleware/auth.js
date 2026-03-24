const jwt = require('jsonwebtoken');

/**
 * Authentication middleware.
 * Checks for a valid JWT access token before allowing access to protected routes.
 */
module.exports = function (req, res, next) {
	// Writing it directly as a function for simplicity and for execution
	// 1. Extract token from Authorization header.
	// Expected format: "Authorization: Bearer <token>"
	const token = req.header('Authorization')?.replace('Bearer ', '');

	// 2. If no token is present, block access immediately.
	if (!token) {
		return res.status(401).json({ msg: 'No token, authorization denied' });
	}

	// 3. Verify token authenticity and expiration.
	try {
		// Decode token using server secret
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Attach user payload to request for downstream handlers
		req.user = decoded.user;

		// Token is valid → continue to next middleware / controller
		next();
	} catch (err) {
		// Token is invalid or expired
		res.status(401).json({ msg: 'Token is not valid' });
	}
};
