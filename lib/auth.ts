import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface UserJwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Generate JWT token
export function generateToken(user: { _id: string; email: string; role: string }) {
  try {
    return jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate authentication token');
  }
}

// Verify JWT token
export function verifyToken(token: string): UserJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserJwtPayload;
  } catch (error) {
    return null;
  }
}

// Get current user from token
export function getCurrentUser(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  const decoded = verifyToken(token);
  return decoded;
}

// Authentication middleware
export function withAuth(
  handler: (req: NextRequest, user: UserJwtPayload) => Promise<NextResponse>,
  allowedRoles: string[] = []
) {
  return async (req: NextRequest) => {
    const user = getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if role is allowed
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    return handler(req, user);
  };
}

// Set token in cookies
export function setAuthCookie(token: string) {
  cookies().set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
  });
}

// Clear auth cookie
export function clearAuthCookie() {
  cookies().delete('token');
} 