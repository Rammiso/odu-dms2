# DMS Backend - Dormitory Management System API

## Overview
This is the backend API for the Dormitory Management System, built with Node.js, Express, and MongoDB.

## Features
- RESTful API with Express.js
- MongoDB database with Mongoose ODM
- JWT authentication
- Rate limiting and security middleware
- Comprehensive error handling
- Health check endpoint for monitoring

## Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/dms
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## Local Development
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Seed database (optional)
npm run seed
```

## Render Deployment

### Prerequisites
- GitHub repository with backend code
- Render account
- MongoDB database (Render's managed MongoDB or external)

### Deployment Steps

1. **Push to GitHub branch**:
```bash
# From backend directory
git add .
git commit -m "Add Render deployment configuration"
git push origin backend-branch
```

2. **Create Render Web Service**:
- Go to Render Dashboard
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select the `backend-branch` branch
- Render will auto-detect Node.js settings
- Configure environment variables in Render dashboard

3. **Required Environment Variables on Render**:
```
NODE_ENV=production
PORT=10000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CORS_ORIGIN=your_frontend_domain
```

4. **Database Setup**:
- Use Render's managed MongoDB OR
- Connect to external MongoDB (MongoDB Atlas recommended)

### Health Check
The application includes a health check endpoint at `/api/health` that Render uses to monitor service health.

## API Documentation
Once deployed, the API will be available at:
- Base URL: `https://your-app-name.onrender.com/api`
- Health Check: `https://your-app-name.onrender.com/api/health`

## Docker Support
The application includes a `Dockerfile` for containerized deployment if needed.

## Project Structure
```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Express middleware
│   ├── models/         # MongoDB models
│   ├── repositories/   # Data access layer
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── validators/     # Input validation
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore file
├── Dockerfile         # Docker configuration
├── package.json       # Dependencies and scripts
├── render.yaml        # Render service configuration
└── server.js          # Application entry point
```

## Security Features
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation with Joi
- JWT authentication
- Password hashing with bcryptjs
