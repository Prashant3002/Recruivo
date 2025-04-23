import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define routes that should bypass authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/api/jobs/simple-apply',
  '/api/jobs/hardcoded-apply',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/session',
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/callback',
  '/api/auth/verify-request',
  '/api/auth/error',
  '/api/auth/csrf',
  '/api/auth/providers',
];

// Export the middleware function as the default export
export async function middleware(request: NextRequest) {
  // Get auth token from various places
  const authToken = request.cookies.get('token')?.value 
    || request.cookies.get('authToken')?.value;
  
  // Check cookies directly in case NextAuth token is not available
  const isLoggedInCookie = request.cookies.get('isLoggedIn')?.value === 'true';
  
  // Get NextAuth token
  const token = await getToken({ req: request });
  
  // Determine if authenticated by any method
  const isAuthenticated = !!token || !!authToken || isLoggedInCookie;
  
  console.log('Middleware executing for path:', request.nextUrl.pathname);
  console.log('Authentication status:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
  console.log('Auth token exists:', !!authToken);
  console.log('IsLoggedIn cookie:', isLoggedInCookie);
  console.log('NextAuth token exists:', !!token);
  
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;
  
  // Add no-cache headers for real-time API routes
  if (pathname.startsWith('/api/recruiter/candidates')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    return response;
  }
  
  // Check if the route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check if this is any auth-related API path
  const isAuthPath = pathname.startsWith('/api/auth/');
  
  // Allow all auth-related API paths and bypass paths without authentication
  if (isAuthPath) {
    console.log('Bypassing auth check for API path:', pathname);
    return NextResponse.next();
  }
  
  // API path but not one of the auth or bypass paths
  const isApiPath = pathname.startsWith('/api/');
  
  // Handle API routes that aren't in the bypass list
  if (isApiPath && !isAuthenticated) {
    console.log('API route access attempted without authentication:', pathname);
    // For API routes, return JSON response instead of redirect
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: 'Authentication required',
        // Include a feature flag to let the client know to use fallback endpoints
        useFallback: true
      }),
      { 
        status: 401,
        headers: { 'content-type': 'application/json' }
      }
    );
  }
  
  // Check if we just came from login page to avoid immediate redirect
  const referer = request.headers.get('referer') || '';
  const isPostLogin = referer.includes('/login') && 
    (pathname.includes('/student') || pathname.includes('/recruiter') || pathname.includes('/admin'));
  
  // Skip redirect right after login to allow token to be properly set
  if (isPostLogin) {
    console.log('Post-login request detected, skipping auth check to allow redirection');
    return NextResponse.next();
  }
  
  // Route protection based on role
  if (isAuthenticated) {
    const userRole = token?.role as string || '';
    
    // If token exists, use its role, otherwise check cookie-based auth
    // For cookie-based auth without token, allow access since we can't verify role
    if (token) {
      // Student routes
      if (pathname.startsWith('/student/') && userRole !== 'student') {
        console.log('Unauthorized access: Non-student trying to access student routes');
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      // Recruiter routes
      if (pathname.startsWith('/recruiter/') && userRole !== 'recruiter') {
        console.log('Unauthorized access: Non-recruiter trying to access recruiter routes');
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      // Admin routes
      if (pathname.startsWith('/admin/') && userRole !== 'admin') {
        console.log('Unauthorized access: Non-admin trying to access admin routes');
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }
  
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Apply to all routes except static files, api health checks, and NextAuth routes
    '/((?!_next/static|_next/image|favicon.ico|health|api/auth/\\[\\.\\.\\.|api/auth/callback|api/auth/session|api/auth/csrf).*)',
  ],
}; 