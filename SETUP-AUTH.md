# Authentication Setup Instructions

To fix the 500 Internal Server Error on `/api/auth/me` and other authentication issues, you need to set up the environment variables properly.

## Step 1: Create Frontend Environment Variables

Create a file named `.env.local` in the root directory with the following content:

```
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/recruivo

# Next.js & Authentication
NEXTAUTH_SECRET=your-secret-key-for-development
JWT_SECRET=your_jwt_secret

# API URLs
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

## Step 2: Create Backend Environment Variables

Create a file named `.env` in the `backend` directory with the following content:

```
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/recruivo

# Authentication
JWT_SECRET=your_jwt_secret

# CORS
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
```

## Step 3: Start MongoDB

Ensure that MongoDB is running on your system. If you don't have MongoDB installed:

1. Install MongoDB from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Start the MongoDB service

## Step 4: Start the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the Next.js frontend (in a new terminal):
   ```
   npm run dev
   ```

## Additional Notes

- The backend runs on port 5000 by default
- The frontend runs on port 3000 by default
- Make sure both JWT_SECRET values match between frontend and backend
- If you change the MongoDB connection string, update it in both .env files 