const mongoose = require('mongoose');

// Maximum number of reconnection attempts before giving up
const DEFAULT_RETRIES = 5;

// Base delay between retries (will increase with each failed attempt)
const RETRY_DELAY_MS = 2000;

/**
 * Establishes a MongoDB connection with retry logic.
 * If MongoDB is temporarily unavailable, the function retries
 * instead of crashing the app immediately.
 */
async function connect(retries = DEFAULT_RETRIES) {
	// Read MongoDB connection string from environment variables
	const uri = process.env.MONGO_URI;

	// Connection options to avoid hanging forever on bad networks
	const opts = {
		serverSelectionTimeoutMS: 5000, // Fail fast if server not reachable
		socketTimeoutMS: 45000, // Close inactive sockets after 45s
	};

	try {
		// Attempt connection
		await mongoose.connect(uri, opts);
		console.info('MongoDB connected');
		return mongoose.connection;
	} catch (err) {
		// Log the actual error message for debugging
		console.error(`MongoDB connection error: ${err.message}`);

		// If retries are still available, wait and try again
		if (retries > 0) {
			// Increase delay with each retry (simple linear backoff)
			const delay = RETRY_DELAY_MS * (DEFAULT_RETRIES - retries + 1);

			console.info(
				`Retrying MongoDB connection in ${delay}ms... (${retries - 1} retries left)`,
			);

			// Pause execution before retrying
			await new Promise((res) => setTimeout(res, delay));

			// Recursive retry call with reduced retry count
			return connect(retries - 1);
		}

		// No retries left — fail hard so server startup can be aborted
		console.error('MongoDB connection failed after retries. Exiting.');
		throw err;
	}
}

/**
 * Gracefully closes the MongoDB connection.
 * Useful during server shutdowns or testing teardown.
 */
async function disconnect() {
	await mongoose.disconnect();
	console.info('MongoDB disconnected');
}

module.exports = { connect, disconnect, mongoose };
