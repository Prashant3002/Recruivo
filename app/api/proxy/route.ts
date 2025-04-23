import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * This is a proxy route that forwards requests to the backend API
 * It helps with CORS issues and provides better error handling
 */
export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  
  try {
    const response = await fetch(`${backendUrl}/api/test-cors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If the response is not OK, try to parse the error
      try {
        const errorData = await response.json();
        return NextResponse.json(
          { 
            success: false, 
            message: errorData.message || 'Backend error',
            error: errorData 
          },
          { status: response.status }
        );
      } catch (parseError) {
        // If we can't parse the error as JSON, return the text
        const errorText = await response.text();
        return NextResponse.json(
          { 
            success: false, 
            message: 'Backend returned non-JSON response',
            error: errorText 
          },
          { status: response.status }
        );
      }
    }

    // If response is OK, return the data
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to connect to backend',
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * Handler for POST requests
 */
export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  
  try {
    // Get the request body
    const body = await request.json();
    const endpoint = new URL(request.url).searchParams.get('endpoint') || 'test-cors';

    const response = await fetch(`${backendUrl}/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // If the response is not OK, try to parse the error
      try {
        const errorData = await response.json();
        return NextResponse.json(
          { 
            success: false, 
            message: errorData.message || 'Backend error',
            error: errorData 
          },
          { status: response.status }
        );
      } catch (parseError) {
        // If we can't parse the error as JSON, return the text
        const errorText = await response.text();
        return NextResponse.json(
          { 
            success: false, 
            message: 'Backend returned non-JSON response',
            error: errorText 
          },
          { status: response.status }
        );
      }
    }

    // If response is OK, return the data
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to connect to backend',
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 