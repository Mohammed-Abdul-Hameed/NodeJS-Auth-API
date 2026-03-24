// Load environment variables before anything else
require('dotenv').config();

const app = require('./app');
const db = require('./db');

let server;

/**
 * Application Entry Point
 * ------------------------
 * 1. Connect to database
 * 2. Start HTTP server
 * 3. Handle graceful shutdown
 */
async function start() {
	try {
		// Ensure database is connected before accepting requests
		await db.connect();
	} catch (err) {
		console.error('Failed to connect to DB. Exiting.');
		process.exit(1); // Do not start server without database
	}

	const port = process.env.PORT || 3000;
	const nodeEnv = process.env.NODE_ENV || 'development';

	// Start Express server
	server = app.listen(port, () => {
		console.log(`Server running in ${nodeEnv} mode on port ${port}`);
	});
}

start();

/**
 * Graceful shutdown handler.
 * Closes HTTP server and database connection properly.
 * Prevents dropped connections or corrupted states.
 */
const shutdown = async (signal) => {
	console.info(`${signal} received - shutting down`);

	try {
		// Stop accepting new connections
		if (server) {
			server.close(() => console.info('HTTP server closed'));
		}

		// Close database connection
		await db.disconnect();

		process.exit(0);
	} catch (err) {
		console.error('Error during shutdown', err);
		process.exit(1);
	}
};

// Handle termination signals from OS / container
process.on('SIGINT', () => shutdown('SIGINT')); // Ctrl+C
process.on('SIGTERM', () => shutdown('SIGTERM')); // Docker / cloud stop
