module.exports = {
	testEnvironment: 'node',
	coverageDirectory: 'coverage',
	collectCoverageFrom: [
		'src/**/*.js',
		'!src/server.js',
		'!src/db/**/*.js',
	],
	testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
	verbose: true,
	testTimeout: 10000,
};
