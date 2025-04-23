import { NextRequest, NextResponse } from 'next/server';
import { initSocketServer } from '@/lib/socketService';

// This is needed for Next.js App Router to handle socket.io
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// This route exists purely to initialize the Socket.IO server
export async function GET(req: NextRequest, res: any) {
  try {
    // Initialize the Socket.IO server
    const io = initSocketServer(req, res);
    
    if (io) {
      return NextResponse.json(
        { success: true, message: 'Socket server is running' },
        { status: 200 }
      );
    } else {
      console.log('Socket server could not be initialized - returning mock success for client');
      
      // For App Router, we'll just return a success response even if socket initialization fails
      // This prevents errors on the client side
      return NextResponse.json(
        { 
          success: true, 
          message: 'Socket API endpoint available (server not initialized)',
          fallback: true 
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Socket initialization error:', error);
    
    // Return a 200 status to prevent client errors, but include error information
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error initializing socket server', 
        error: String(error),
        fallback: true
      },
      { status: 200 }  // Return 200 instead of 500 to prevent client polling errors
    );
  }
} 