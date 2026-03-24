const { validate, schemas } = require('../src/middleware/validation');

describe('Validation Middleware', () => {
	let mockReq;
	let mockRes;
	let mockNext;

	beforeEach(() => {
		mockReq = { body: {} };
		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
		mockNext = jest.fn();
	});

	describe('validate middleware', () => {
		it('should call next() for valid data', () => {
			const schema = schemas.login;
			const middleware = validate(schema);

			mockReq.body = { email: 'test@example.com', password: 'password123' };

			middleware(mockReq, mockRes, mockNext);

			expect(mockNext).toHaveBeenCalled();
			expect(mockRes.status).not.toHaveBeenCalled();
		});

		it('should return 400 for invalid email', () => {
			const schema = schemas.login;
			const middleware = validate(schema);

			mockReq.body = { email: 'invalid-email', password: 'password123' };

			middleware(mockReq, mockRes, mockNext);

			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({
				error: 'Validation failed',
				details: expect.any(Array),
			});
			expect(mockNext).not.toHaveBeenCalled();
		});

		it('should return 400 for missing required fields', () => {
			const schema = schemas.login;
			const middleware = validate(schema);

			mockReq.body = { email: 'test@example.com' };

			middleware(mockReq, mockRes, mockNext);

			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it('should strip unknown fields', () => {
			const schema = schemas.login;
			const middleware = validate(schema);

			mockReq.body = {
				email: 'test@example.com',
				password: 'password123',
				unknownField: 'should be removed',
			};

			middleware(mockReq, mockRes, mockNext);

			expect(mockReq.body).not.toHaveProperty('unknownField');
			expect(mockNext).toHaveBeenCalled();
		});
	});

	describe('schemas', () => {
		it('register schema should require strong password', () => {
			const { error } = schemas.register.validate({
				email: 'test@example.com',
				password: 'weak',
			});

			expect(error).toBeDefined();
		});

		it('register schema should accept strong password', () => {
			const { error } = schemas.register.validate({
				email: 'test@example.com',
				password: 'Strong@123',
			});

			expect(error).toBeUndefined();
		});
	});
});
