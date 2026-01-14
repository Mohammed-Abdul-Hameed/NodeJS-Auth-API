const mongoose = require('mongoose');

const DEFAULT_RETRIES = 5;
const RETRY_DELAY_MS = 2000; // base, will multiply

async function connect(retries = DEFAULT_RETRIES) {
	const uri = process.env.MONGO_URI;

	const opts = {
		// keep these conservative — you can tune in prod
		serverSelectionTimeoutMS: 5000,
		socketTimeoutMS: 45000,
	};

	try {
		await mongoose.connect(uri, opts);
		console.info('MongoDB connected');
		// optional: expose mongoose connection on module.exports if needed
		return mongoose.connection;
	} catch (err) {
		console.error(`MongoDB connection error: ${err.message}`);
		if (retries > 0) {
			const delay = RETRY_DELAY_MS * (DEFAULT_RETRIES - retries + 1);
			console.info(
				`Retrying MongoDB connection in ${delay}ms... (${retries - 1} retries left)`,
			);
			await new Promise((res) => setTimeout(res, delay));
			return connect(retries - 1);
		} else {
			console.error('MongoDB connection failed after retries, exiting process.');
			throw err; // allow caller to decide (server shouldn't start)
		}
	}
}

async function disconnect() {
	await mongoose.disconnect();
	console.info('MongoDB disconnected');
}

module.exports = { connect, disconnect, mongoose };
