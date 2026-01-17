# NodeJS Auth API

<<<<<<< HEAD
A production-ready Authentication API built with Node.js, Express, and MongoDB. It features secure JWT-based authentication (using both HttpOnly cookies and response body for compatibility), refresh token rotation, and standardized error handling.

## Features

-   **Secure Authentication**: Access & Refresh Token architecture.
-   **Flexibility**: Supports both Cookie-based (HttpOnly) and Body-based token passing.
-   **Security**: Password hashing with `bcrypt`, security headers with `helmet`.
-   **Resilience**: Automatic MongoDB reconnection logic.
-   **Clean Architecture**: Separation of concerns (Controllers, Services, Models).

## Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose ODM)
-   **Auth**: JWT (JSON Web Tokens)
-   **Validation**: Joi
=======
A REST API implementation demonstrating JWT-based authentication with access and refresh tokens.

## Overview

I built this project to understand how real authentication systems work behind the scenes. It handles user registration, login, token management, and protected routes using industry-standard practices.

## Features

- User registration with hashed password storage
- JWT-based authentication (access + refresh tokens)
- Automatic token refresh functionality
- Protected route middleware
- Session management with MongoDB
- Secure password hashing with bcrypt

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
>>>>>>> 40fe5c2045184fb849c9f9c562ef7636ac3553d8

## Getting Started

### Prerequisites

<<<<<<< HEAD
-   Node.js (v14+ recommended)
-   MongoDB (Local or Atlas URI)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Mohammed-Abdul-Hameed/NodeJS-Auth-API.git
    cd NodeJS-Auth-API
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    NODE_ENV=development
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_long_random_secret
    REFRESH_TOKEN_SECRET=your_another_long_random_secret
    ```

4.  **Start the Server**
    ```bash
    npm start
    # OR for development with reload
    npm run dev
    ```

## API Testing Guide

The API runs on `http://localhost:3000` by default.

### 1. Check Health
Ensure the API is running and connected to the database.
-   **Endpoint**: `GET /health`
-   **Response**: `200 OK`

### 2. Sign Up
Create a new user account.
-   **Endpoint**: `POST /api/auth/signup`
-   **Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "StrongPassword123"
    }
    ```

### 3. Login
Authenticate and receive tokens.
-   **Endpoint**: `POST /api/auth/login`
-   **Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "StrongPassword123"
    }
    ```
-   **Response**: Returns `accessToken` and `refreshToken`. Also sets `refreshToken` as an HttpOnly cookie.

### 4. Get User Profile (Protected)
Access a protected route using the Access Token.
-   **Endpoint**: `GET /api/user/me`
-   **Header**: `Authorization: Bearer <your_access_token>`

### 5. Refresh Token
Get a new Access Token when the old one expires.
-   **Endpoint**: `POST /api/auth/refresh`
-   **Body** (Optional if cookie is set):
    ```json
    {
      "refreshToken": "<your_refresh_token>"
    }
    ```

### 6. Logout
Invalidate the Refresh Token.
-   **Endpoint**: `POST /api/auth/logout`
-   **Body** (Optional if cookie is set):
    ```json
    {
      "refreshToken": "<your_refresh_token>"
    }
    ```
=======
- Node.js installed
- MongoDB instance (local or cloud)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Mohammed-Abdul-Hameed/NodeJS-Auth-API
cd NodeJS-Auth-API
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

4. Start the server:
```bash
npm start
```

The API will be running at `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication Routes

#### 1. Sign Up
Register a new user account.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "username": "abdul",
  "email": "abdul@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully"
}
```

---

#### 2. Login
Authenticate user and receive tokens.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "abdul@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

---

#### 3. Refresh Access Token
Get a new access token using a valid refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

**Response:**
```json
{
  "accessToken": "new_access_token"
}
```

---

#### 4. Logout
Invalidate the refresh token and end the session.

**Endpoint:** `POST /api/auth/logout`

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

### User Routes

#### 5. Get Current User (Protected)
Retrieve logged-in user information.

**Endpoint:** `GET /api/user/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "_id": "user_id",
  "username": "abdul",
  "email": "abdul@example.com"
}
```

## Testing with Postman

1. **Sign Up:** Create a new user account
2. **Login:** Get your access and refresh tokens
3. **Access Protected Route:** Use the access token in the Authorization header
4. **Refresh Token:** When access token expires, use refresh token to get a new one
5. **Logout:** Invalidate your refresh token

## What I Learned

- How JWT authentication actually works in practice
- Proper Express backend architecture and organization
- Implementing middleware for route protection
- Secure password storage and validation
- Token refresh mechanisms and session management

## Future Enhancements

- [ ] Password reset functionality via email
- [ ] Rate limiting to prevent brute force attacks
- [ ] Swagger/OpenAPI documentation
- [ ] Email verification for new accounts
- [ ] Role-based access control (RBAC)
- [ ] OAuth integration (Google, GitHub)

>>>>>>> 40fe5c2045184fb849c9f9c562ef7636ac3553d8
