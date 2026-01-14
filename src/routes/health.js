const express = require('express');
const router = express.Router();
const { mongoose } = require('../db'); // uses the mongoose instance from db module

router.get('/', (req, res) => {
	// mongoose.connection.readyState:
	// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
	const dbState = mongoose.connection.readyState;
	const dbStatus = dbState === 1 ? 'up' : dbState === 2 ? 'connecting' : 'down';

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
