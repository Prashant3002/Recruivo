import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Log the request
  console.log('Resume test URL API called');
  
  try {
    // Return a valid test PDF URL
    return NextResponse.json({
      success: true,
      resumeUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      message: "Test resume URL provided"
    });
  } catch (error) {
    console.error('Error in test resume URL API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to provide test resume URL" 
      },
      { status: 500 }
    );
  }
} 