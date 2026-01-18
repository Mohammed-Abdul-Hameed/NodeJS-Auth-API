# NodeJS Authentication API

A production-ready authentication API built with Node.js, Express, and MongoDB, featuring JWT-based authentication with access and refresh tokens.

## Features

- **Secure Authentication**: JWT access & refresh token architecture
- **Dual Token Delivery**: HttpOnly cookies + response body for flexibility
- **Password Security**: bcrypt hashing with validation
- **Protected Routes**: Middleware-based authentication
- **Token Refresh**: Automatic token rotation
- **Clean Architecture**: Separation of concerns (Controllers, Services, Models)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Security**: helmet, bcrypt

## Getting Started

### Prerequisites

- Node.js
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/Mohammed-Abdul-Hameed/NodeJS-Auth-API.git
   cd NodeJS-Auth-API
```

2. **Install dependencies**
```bash
   npm install
```

3. **Configure environment**
   
   Create `.env` file:
```env
   NODE_ENV=development
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   REFRESH_TOKEN_SECRET=your_refresh_secret
```

4. **Start the server**
```bash
   npm start
   # Development mode
   npm run dev
```

## API Endpoints

### Health Check
```
GET /health
```

### Authentication

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "username": "abdul",
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPassword123"
}

Response: { accessToken, refreshToken }
```

#### Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

#### Logout
```
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

### User Routes

#### Get Profile (Protected)
```
GET /api/user/me
Authorization: Bearer <access_token>
```

## Testing Workflow

1. **Sign Up** → Create account
2. **Login** → Get tokens
3. **Access Protected Routes** → Use access token
4. **Refresh** → Get new access token when expired
5. **Logout** → Invalidate refresh token

## Future Enhancements

- [ ] Password reset via email
- [ ] Rate limiting
- [ ] Email verification
- [ ] Role-based access control (RBAC)
- [ ] OAuth integration (Google, GitHub)
- [ ] Swagger/OpenAPI documentation
