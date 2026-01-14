# NodeJS Authentication Backend

A backend authentication service built with Node.js, Express, and MongoDB.  
Implements JWT authentication with refresh token rotation.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT access tokens
- Refresh token rotation stored in MongoDB
- Protected routes with middleware
- Health check endpoint
- Graceful shutdown

## Tech Stack

Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Joi, Helmet

## API Endpoints

POST /api/auth/register  
POST /api/auth/login  
GET  /api/auth/me  
POST /api/auth/refresh-token  
POST /api/auth/revoke-token  
GET  /health
