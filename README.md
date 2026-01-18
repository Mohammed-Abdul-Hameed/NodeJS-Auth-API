# NodeJS Auth API

A production-style authentication API built with **Node.js**, **Express**, and **MongoDB**.
Implements **JWT access tokens**, **refresh token rotation**, **HttpOnly cookie support**, and **clean layered architecture**.

This is project demonstrates how real authentication systems are structured.

---

## Features

- User registration & login
- bcrypt password hashing
- JWT access tokens (short-lived)
- Refresh tokens stored in MongoDB
- Refresh token rotation
- HttpOnly cookie support
- Protected route middleware
- Centralized error handling
- MongoDB auto-reconnection logic
- Security headers with Helmet
- Joi request validation

---

## Tech Stack

| Layer      | Technology   |
| ---------- | ------------ |
| Runtime    | Node.js      |
| Framework  | Express.js   |
| Database   | MongoDB      |
| ODM        | Mongoose     |
| Auth       | JWT + Crypto |
| Hashing    | bcrypt       |
| Validation | Joi          |
| Security   | Helmet       |

---

## Setup

### Prerequisites

- Node.js v14+
- MongoDB (local or Atlas)

### Installation

```bash
git clone https://github.com/Mohammed-Abdul-Hameed/NodeJS-Auth-API.git
cd NodeJS-Auth-API
npm install
```

#### Create .env

```bash
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

#### Start Server

```bash
npm start
```

### Server starts at

```bash
http://localhost:3000
```

## API Endpoints

```bash
Health Check

GET /health
-> 200 OK
```

```bash
Sign Up

POST /api/auth/signup

{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

```bash
Log In

POST /api/auth/login

{
  "email": "user@example.com",
  "password": "StrongPassword123"
}

Response

{
  "accessToken": "...",
  "refreshToken": "..."
}
```

- Refresh token is also set as an HttpOnly cookie.

```bash
Refresh Access Token

POST /api/auth/refresh

- Accepts refresh token from body or cookie.

Response

{
  "accessToken": "...",
  "refreshToken": "..."
}
```

```bash
Logout

POST /api/auth/logout

- Revokes refresh token.
```

```bash
Get Current User (Protected)

GET /api/user/me
Authorization: Bearer <access token>
```

## Security Notes

- Passwords never stored in plain text
- Access tokens are short-lived
- Refresh tokens stored and revocable
- Token rotation prevents reuse attacks
- HttpOnly cookies mitigate XSS theft
- Helmet sets secure HTTP headers

## Purpose Of This Project

To build authentication the way backend systems do it in production: token separation, rotation, revocation, and clean architecture.
