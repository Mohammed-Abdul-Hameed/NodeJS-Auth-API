const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const healthRouter = require('./routes/health');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security + parsing
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use('/health', healthRouter);
app.use('/api/auth', require('./routes/auth'));

// 404 for unknown routes (JSON)
app.use((req, res) => {
	res.status(404).json({ error: 'Not Found' });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
