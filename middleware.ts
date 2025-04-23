import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Configuration for paths that require authentication
const PROTECTED_PATHS = [
  '/dashboard',
  '/profile',
  '/applications',
  '/student',
  '/recruiter',
  '/admin',
];

// Configuration for paths that are only accessible to specific roles
const ROLE_PATHS = {
  student: ['/student'],
  recruiter: ['/recruiter'],
  admin: ['/admin'],
};

// Paths that are authentication-related and should be accessible for redirects
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

// The middleware function, which will run before each request
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for api routes and static files
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.includes('.') || 
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }
  
  // Check if the path requires authentication
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  
  // Get the user's authentication token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // If the path requires authentication and the user is not authenticated, redirect to login
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }
  
  // If the user is authenticated, check role-based access
  if (token?.role && isProtectedPath) {
    const userRole = token.role as string;
    
    // Check if the path is restricted to specific roles
    let isRoleRestricted = false;
    let hasAccess = false;
    
    // Check each role path configuration
    for (const [role, paths] of Object.entries(ROLE_PATHS)) {
      const isPathForRole = paths.some(path => pathname.startsWith(path));
      
      if (isPathForRole) {
        isRoleRestricted = true;
        hasAccess = role === userRole;
        break;
      }
    }
    
    // If the path is restricted to roles and the user doesn't have access, redirect to dashboard
    if (isRoleRestricted && !hasAccess) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // If the user is authenticated and trying to access auth pages, redirect to dashboard
  if (token && AUTH_PATHS.some(path => pathname === path)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Allow the request to proceed
  return NextResponse.next();
}

// Configure paths that should be matched by this middleware
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. all root files inside /public (robots.txt, favicon.ico, etc.)
     */
    '/((?!api|_next|static|favicon.ico|manifest.json).*)',
  ],
}; 