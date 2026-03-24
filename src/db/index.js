const { Sequelize } = require('sequelize');

const DEFAULT_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

let sequelize;

/**
 * Validates required environment variables at startup.
 * Fails fast if critical configuration is missing.
 */
function validateEnvironment() {
	const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
	const missing = required.filter((key) => !process.env[key]);

	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
	}

	// Warn about weak secrets in production
	if (process.env.NODE_ENV === 'production') {
		if (process.env.JWT_SECRET.length < 32) {
			throw new Error('JWT_SECRET must be at least 32 characters in production');
		}
		if (process.env.REFRESH_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET.length < 32) {
			throw new Error('REFRESH_TOKEN_SECRET must be at least 32 characters in production');
		}
	}
}

/**
 * Establishes a PostgreSQL connection with Sequelize.
 */
async function connect(retries = DEFAULT_RETRIES) {
	validateEnvironment();

	const {
		DB_HOST,
		DB_PORT,
		DB_NAME,
		DB_USER,
		DB_PASSWORD,
	} = process.env;

	sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
		host: DB_HOST,
		port: DB_PORT || 5432,
		dialect: 'postgres',
		logging: process.env.NODE_ENV === 'development' ? console.log : false,
		pool: {
			max: 5,
			min: 0,
			acquire: 30000,
			idle: 10000,
		},
	});

	try {
		await sequelize.authenticate();
		console.info('PostgreSQL connected');

		// Sync models (use { force: true } only in dev to drop tables)
		const syncOptions = process.env.NODE_ENV === 'development'
			? { alter: true }
			: {};

		await sequelize.sync(syncOptions);
		console.info('Database synchronized');

		return sequelize;
	} catch (err) {
		console.error(`PostgreSQL connection error: ${err.message}`);

		if (retries > 0) {
			const delay = RETRY_DELAY_MS * (DEFAULT_RETRIES - retries + 1);
			console.info(`Retrying PostgreSQL connection in ${delay}ms... (${retries - 1} retries left)`);
			await new Promise((res) => setTimeout(res, delay));
			return connect(retries - 1);
		}

		console.error('PostgreSQL connection failed after retries. Exiting.');
		throw err;
	}
}

/**
 * Gracefully closes the database connection.
 */
async function disconnect() {
	if (sequelize) {
		await sequelize.close();
		console.info('PostgreSQL disconnected');
	}
}

/**
 * Get Sequelize instance for model definitions.
 */
function getSequelize() {
	return sequelize;
}

module.exports = { connect, disconnect, getSequelize };