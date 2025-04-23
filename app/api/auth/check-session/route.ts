import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const sessionInfo = {
      hasSession: !!session,
      hasUser: session ? !!session.user : false,
      userEmail: session?.user?.email || 'none',
      userId: session?.user?.id || 'none',
      userRole: session?.user?.role || 'none',
      expires: session?.expires || 'none',
      cookieHeader: request.headers.get('cookie') || 'none'
    };
    
    console.log("Session check details:", sessionInfo);
    
    if (session) {
      return NextResponse.json({
        authenticated: true,
        sessionInfo
      });
    } else {
      return NextResponse.json({
        authenticated: false,
        sessionInfo
      });
    }
  } catch (error) {
    console.error("Error checking session:", error);
    return NextResponse.json({
      authenticated: false,
      error: "Error checking session"
    }, { status: 500 });
  }
} 