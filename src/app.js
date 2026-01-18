const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const healthRouter = require('./routes/health');
const errorHandler = require('./middleware/errorHandler');

const app = express();

/**
 * Global Middleware Setup
 * ------------------------
 * Applied before any routes.
 * Handles security headers, request parsing, and cookies.
 */

// Adds common security headers to protect against basic web attacks
app.use(helmet());

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
app.use('/api/auth', require('./routes/auth')); // Authentication routes
app.use('/api/user', require('./routes/user')); // User-related routes

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
