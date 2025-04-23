import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  console.log("Logout API called");
  
  try {
    // Get the cookie store
    const cookieStore = cookies();
    
    // List of all possible auth-related cookies to clear
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      'next-auth.pkce.code-verifier',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
      'authToken',
      'token',
      'isLoggedIn',
      'user',
      'session',
      'auth',
      '__Secure-authToken'
    ];
    
    // Clear all cookies
    for (const cookieName of cookiesToClear) {
      try {
        // Delete the cookie
        cookieStore.delete(cookieName);
        console.log(`Deleted cookie: ${cookieName}`);
      } catch (cookieError) {
        console.error(`Error deleting cookie ${cookieName}:`, cookieError);
      }
    }
    
    // Set response with instructions to clear cookies on the client side too
    const response = NextResponse.json({ 
      success: true, 
      message: "Logged out successfully",
      timestamp: new Date().toISOString()
    });
    
    // Set all the same cookies with expiry in the past to ensure they're deleted
    for (const cookieName of cookiesToClear) {
      response.cookies.set({
        name: cookieName,
        value: '',
        expires: new Date(0),
        path: '/',
      });
    }
    
    // Set header to clear localStorage on client side
    response.headers.set('Clear-Local-Storage', 'true');
    
    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to complete logout process"
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Support POST method as well
  return GET(req);
} 