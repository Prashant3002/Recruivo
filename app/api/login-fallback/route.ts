import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/userModel';
import { connect } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    console.log("Fallback login API called");
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { success: false, error: "Invalid request format" },
        { status: 400 }
      );
    }
    
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }
    
    console.log("Login attempt for email:", email);
    
    try {
      // Connect to the database
      await connect();
      console.log("Connected to database");
      
      // Find the user
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        console.log("User not found:", email);
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        console.log("Password mismatch for user:", email);
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }
      
      // Create a safe user object without the password
      const safeUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      };
      
      // Generate JWT token
      const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        secret,
        { expiresIn: '7d' }
      );
      
      console.log("Login successful for user:", email);
      
      // Create the response with the user data and token
      const response = NextResponse.json({
        success: true,
        user: safeUser,
        token
      });
      
      // Set authentication cookies
      response.cookies.set({
        name: 'authToken',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
        path: '/',
      });
      
      // Set a non-HttpOnly cookie for the frontend
      response.cookies.set({
        name: 'isLoggedIn',
        value: 'true',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
        path: '/',
      });
      
      // Also set the token NextAuth would use
      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
        path: '/',
      });
      
      return response;
    } catch (dbError) {
      console.error("Database error during login:", dbError);
      return NextResponse.json(
        { 
          success: false, 
          error: "Authentication service unavailable",
          message: "Database connection error"
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unhandled login error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        message: error.message || "Unknown error occurred"
      },
      { status: 500 }
    );
  }
} 