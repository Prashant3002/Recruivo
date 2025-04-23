import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * This is a catch-all proxy route that forwards any request to the backend API
 * It helps with CORS issues and provides better error handling
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: { path: string[] } }
) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const path = params.path.join('/');
  
  try {
    console.log(`Proxying GET request to: ${backendUrl}/api/${path}`);
    
    const response = await fetch(`${backendUrl}/api/${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        return NextResponse.json(
          errorData,
          { status: response.status }
        );
      } catch (parseError) {
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

    try {
      const data = await response.json();
      return NextResponse.json(data);
    } catch (parseError) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  } catch (error) {
    console.error(`Proxy error for path ${path}:`, error);
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
export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const path = params.path.join('/');
  
  try {
    console.log(`Proxying POST request to: ${backendUrl}/api/${path}`);
    
    // Get the request body and headers
    const contentType = request.headers.get('Content-Type') || 'application/json';
    let body;
    
    // Handle different content types
    if (contentType.includes('application/json')) {
      body = JSON.stringify(await request.json());
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = new URLSearchParams();
      for (const [key, value] of formData.entries()) {
        body.append(key, value.toString());
      }
    } else {
      body = await request.text();
    }

    const response = await fetch(`${backendUrl}/api/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'Authorization': request.headers.get('Authorization') || '',
      },
      body,
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        return NextResponse.json(
          errorData,
          { status: response.status }
        );
      } catch (parseError) {
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

    try {
      const data = await response.json();
      return NextResponse.json(data);
    } catch (parseError) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  } catch (error) {
    console.error(`Proxy error for path ${path}:`, error);
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

// Support for other HTTP methods
export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, 'DELETE');
}

/**
 * Generic handler for all HTTP methods
 */
async function handleRequest(
  request: NextRequest,
  { params }: { params: { path: string[] } },
  method: string
) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const path = params.path.join('/');
  
  try {
    console.log(`Proxying ${method} request to: ${backendUrl}/api/${path}`);
    
    // Get the request body and headers
    const contentType = request.headers.get('Content-Type') || 'application/json';
    let body;
    
    // Handle different content types
    if (contentType.includes('application/json')) {
      body = JSON.stringify(await request.json());
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = new URLSearchParams();
      for (const [key, value] of formData.entries()) {
        body.append(key, value.toString());
      }
    } else {
      body = await request.text();
    }

    const response = await fetch(`${backendUrl}/api/${path}`, {
      method,
      headers: {
        'Content-Type': contentType,
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: method !== 'GET' ? body : undefined,
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        return NextResponse.json(
          errorData,
          { status: response.status }
        );
      } catch (parseError) {
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

    try {
      const data = await response.json();
      return NextResponse.json(data);
    } catch (parseError) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  } catch (error) {
    console.error(`Proxy error for path ${path}:`, error);
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