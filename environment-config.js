/**
 * ENVIRONMENT SETUP INSTRUCTIONS
 * 
 * Please create the following files with the specified content to fix the authentication issues:
 * 
 * 1. File: .env.local (in root directory)
 * Content:
 * # MongoDB Connection
 * MONGODB_URI=mongodb://localhost:27017/recruivo
 * 
 * # Next.js & Authentication
 * NEXTAUTH_SECRET=your-secret-key-for-development
 * JWT_SECRET=your_jwt_secret
 * 
 * # API URLs
 * BACKEND_URL=http://localhost:5000
 * NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
 * FRONTEND_URL=http://localhost:3000
 * 
 * 
 * 2. File: backend/.env (in backend directory)
 * Content:
 * # MongoDB Connection
 * MONGODB_URI=mongodb://localhost:27017/recruivo
 * 
 * # Authentication
 * JWT_SECRET=your_jwt_secret
 * 
 * # CORS
 * FRONTEND_URL=http://localhost:3000
 * 
 * # Server
 * PORT=5000
 */

// Note: This file just contains instructions and doesn't actually set any environment variables.
// You need to manually create the .env files as described above. 