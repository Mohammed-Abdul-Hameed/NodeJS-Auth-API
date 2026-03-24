const express = require('express');
const router = express.Router();
const { getSequelize } = require('../db');

router.get('/', (req, res) => {
	const sequelize = getSequelize();

	// Check database connection state
	let dbState = 0; // disconnected by default
	let dbStatus = 'down';

	if (sequelize) {
		try {
			// Sequelize doesn't have a readyState like mongoose
			// We check if the connection is authenticated
			if (sequelize.connection && sequelize.connection.authenticated) {
				dbState = 1;
				dbStatus = 'up';
			}
		} catch (e) {
			dbState = 0;
			dbStatus = 'down';
		}
	}

	res.json({
		status: 'ok',
		uptime: process.uptime(),
		db: {
			state: dbState,
			status: dbStatus,
		},
	});
});

module.exports = router;