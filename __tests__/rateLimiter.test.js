const request = require('supertest');
const express = require('express');

// Mock db before requiring rateLimiter
jest.mock('../src/db', () => ({
	connect: jest.fn(),
	disconnect: jest.fn(),
	mongoose: {
		connection: {
			readyState: 1,
		},
	},
}));

const { apiLimiter, authLimiter, refreshLimiter } = require('../src/middleware/rateLimiter');

describe('Rate Limiter Middleware', () => {
	describe('apiLimiter', () => {
		it('should allow requests under the limit', async () => {
			const app = express();
			app.use('/test', apiLimiter, (req, res) => res.json({ ok: true }));

			const res = await request(app).get('/test');
			expect(res.status).toBe(200);
		});

		it('should include rate limit headers', async () => {
			const app = express();
			app.use('/test', apiLimiter, (req, res) => res.json({ ok: true }));

			const res = await request(app).get('/test');
			expect(res.headers['ratelimit-limit']).toBeDefined();
		});
	});

	describe('authLimiter', () => {
		it('should be defined', () => {
			expect(authLimiter).toBeDefined();
		});
	});

	describe('refreshLimiter', () => {
		it('should be defined', () => {
			expect(refreshLimiter).toBeDefined();
		});
	});
});
