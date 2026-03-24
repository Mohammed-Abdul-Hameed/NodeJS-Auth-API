const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const healthRouter = require('./routes/health');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

/**
 * Global Middleware Setup
 * ------------------------
 * Applied before any routes.
 * Handles security headers, request parsing, and cookies.
 */

// Adds common security headers to protect against basic web attacks
app.use(helmet());

// CORS configuration - restrict in production
app.use(cors({
	origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
	credentials: true,
	secure: process.env.NODE_ENV === 'production', // Only enable in production with HTTPS
}));

// Parses incoming JSON request bodies
app.use(express.json());

// Parses URL-encoded form data
app.use(express.urlencoded({ extended: false }));

// Parses cookies attached to requests
app.use(cookieParser());

/**
 * Routes
 * -------
 * Each router handles a specific domain of the API.
 */

app.use('/health', healthRouter); // Simple health check endpoint
app.use('/api/v1/auth', apiLimiter, require('./routes/auth')); // Authentication routes v1
app.use('/api/v1/user', apiLimiter, require('./routes/user')); // User-related routes v1

// Welcome Route
app.use('/', (req, res) => {
	res.json({ message: 'Welcome to the API!' });
});

/**
 * Fallback for unknown routes.
 * Ensures consistent JSON response instead of default HTML.
 */
app.use((req, res) => {
	res.status(404).json({ error: 'Not Found' });
});

/**
 * Centralized error handler.
 * Catches errors thrown from controllers/services.
 */
app.use(errorHandler);

module.exports = app;
