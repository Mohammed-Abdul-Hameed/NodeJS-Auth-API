// Mock dependencies BEFORE requiring app
jest.mock('../src/db', () => ({
	connect: jest.fn().mockResolvedValue({}),
	disconnect: jest.fn().mockResolvedValue(undefined),
	getSequelize: jest.fn(),
}));

jest.mock('../src/services/authService', () => ({
	registerUser: jest.fn(),
	loginUser: jest.fn(),
	getUserById: jest.fn(),
}));

jest.mock('../src/services/tokenService', () => ({
	generateAccessToken: jest.fn().mockReturnValue('mock-access-token'),
	generateRefreshToken: jest.fn().mockResolvedValue({
		token: 'mock-refresh-token',
	}),
	getRefreshToken: jest.fn(),
	revokeToken: jest.fn(),
}));

jest.mock('../src/model/VerificationToken', () => {
	return jest.fn().mockImplementation(() => ({
		createToken: jest.fn(),
		findValidToken: jest.fn(),
		destroy: jest.fn(),
	}));
});

jest.mock('../src/model/User', () => {
	return jest.fn().mockImplementation(() => ({
		findOne: jest.fn(),
		findByPk: jest.fn(),
		create: jest.fn(),
		comparePassword: jest.fn().mockResolvedValue(true),
	}));
});

const request = require('supertest');
const app = require('../src/app');

const authService = require('../src/services/authService');
const tokenService = require('../src/services/tokenService');

describe('Auth API Endpoints', () => {
	describe('POST /api/v1/auth/signup', () => {
		it('should register a new user with valid credentials', async () => {
			const mockUser = {
				id: 'user123',
				email: 'test@example.com',
				roles: ['user'],
				isVerified: false,
				save: jest.fn().mockResolvedValue(true),
			};

			authService.registerUser.mockResolvedValue(mockUser);

			const res = await request(app).post('/api/v1/auth/signup').send({
				email: 'test@example.com',
				password: 'Test@1234',
			});

			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty('accessToken');
			expect(res.body).toHaveProperty('user');
		});

		it('should return 400 for invalid email format', async () => {
			const res = await request(app).post('/api/v1/auth/signup').send({
				email: 'invalid-email',
				password: 'Test@1234',
			});

			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('error', 'Validation failed');
		});

		it('should return 400 for weak password', async () => {
			const res = await request(app).post('/api/v1/auth/signup').send({
				email: 'test@example.com',
				password: 'weak',
			});

			expect(res.status).toBe(400);
			expect(res.body.details).toBeDefined();
		});
	});

	describe('POST /api/v1/auth/login', () => {
		it('should login with valid credentials', async () => {
			const mockUser = {
				id: 'user123',
				email: 'test@example.com',
				roles: ['user'],
				isVerified: true,
			};

			authService.loginUser.mockResolvedValue(mockUser);

			const res = await request(app).post('/api/v1/auth/login').send({
				email: 'test@example.com',
				password: 'correctpassword',
			});

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('accessToken');
		});

		it('should return 400 for invalid email format', async () => {
			const res = await request(app).post('/api/v1/auth/login').send({
				email: 'not-an-email',
				password: 'somepassword',
			});

			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('error', 'Validation failed');
		});
	});

	describe('GET /health', () => {
		it('should return health status', async () => {
			const res = await request(app).get('/health');
			expect(res.status).toBe(200);
		});
	});
});