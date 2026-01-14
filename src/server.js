const app = require('./app');
const db = require('./db');

// Handle environment variables
require('dotenv').config();

let server;

async function start() {
	try {
		await db.connect();
	} catch (err) {
		console.error('Failed to connect to DB. Exiting.');
		process.exit(1);
	}

	const port = process.env.PORT || 3000;
	const nodeEnv = process.env.NODE_ENV || 'development';

	server = app.listen(port, () => {
		console.log(`Server running in ${nodeEnv} mode on port ${port}`);
	});
}

start();

// Graceful shutdown
const shutdown = async (signal) => {
	console.info(`${signal} received — shutting down`);
	try {
		if (server) {
			server.close(() => console.info('HTTP server closed'));
		}
		await db.disconnect();
		process.exit(0);
	} catch (err) {
		console.error('Error during shutdown', err);
		process.exit(1);
	}
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
