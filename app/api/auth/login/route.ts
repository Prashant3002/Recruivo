import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { User } from '@/lib/models';
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Parse request body with error handling
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const { email, password } = body || {};
    
    // Validate input
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      console.error('Missing or invalid credentials:', { 
        emailProvided: !!email, 
        passwordProvided: !!password,
        emailType: typeof email,
        passwordType: typeof password
      });
      return NextResponse.json(
        { error: 'Please provide valid email and password' },
        { status: 400 }
      );
    }
    
    // Find user by email and include the password field
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists
    if (!user) {
      console.log('User not found with email:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    console.log('User found, attempting password comparison');
    
    // Check if password is correct
    try {
      const isMatch = await user.comparePassword(password);
      console.log('Password comparison result:', isMatch);
      
      if (!isMatch) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
    } catch (e) {
      console.error('Password comparison error:', e);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
    
    try {
      // Generate token
      const token = generateToken({
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
      });
      
      // Create response
      const response = NextResponse.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
      
      // Set cookie directly in response
      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      });
      
      return response;
    } catch (e) {
      console.error('Token generation/setting error:', e);
      return NextResponse.json(
        { error: 'Authentication service error' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
} 