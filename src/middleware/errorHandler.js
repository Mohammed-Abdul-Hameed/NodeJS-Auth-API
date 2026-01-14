module.exports = (err, req, res, next) => {
	// minimal structured error response
	console.error(err); // server-side log
	const status = err.status || 500;
	res.status(status).json({ error: err.message || 'Internal Server Error' });
};

