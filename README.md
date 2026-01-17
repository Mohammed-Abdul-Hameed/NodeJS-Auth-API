# NodeJS Auth API

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

## Getting Started

### Prerequisites

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
