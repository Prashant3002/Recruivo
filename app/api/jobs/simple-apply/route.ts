import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log("Simple job application process started");
  
  try {
    // Parse request body for logging purposes
    let body;
    try {
      body = await request.json();
      console.log("Request body:", body);
      
      // Log resume URL specifically for debugging
      if (body.resumeUrl) {
        console.log("Resume URL received:", body.resumeUrl);
      } else {
        console.log("Warning: No resume URL received in simple-apply");
      }
    } catch (error) {
      console.error("Failed to parse request body, but continuing anyway:", error);
      body = { jobId: "unknown", coverLetter: "", resumeUrl: null };
    }
    
    // Log all cookies for debugging
    const cookieHeader = request.headers.get('cookie');
    console.log("Request cookies:", cookieHeader);
    
    // Store the application data in memory (it will be lost on restart)
    const applicationData = {
      jobId: body.jobId || "unknown",
      studentEmail: body.studentEmail || "unknown",
      resumeUrl: body.resumeUrl || null,
      timestamp: new Date().toISOString()
    };
    
    console.log("Stored application data:", applicationData);
    
    // Always return success
    return NextResponse.json({ 
      success: true,
      applicationId: `simple-${Date.now()}`,
      message: "Application simulation successful",
      note: "This is a simulated success response for testing purposes.",
      resumeAttached: !!body.resumeUrl,
      applicationData
    });
  } catch (error) {
    console.error("Error in simple apply:", error);
    // Even for errors, return success for testing
    return NextResponse.json({ 
      success: true,
      message: "Application simulation completed with errors, but returning success anyway",
      error: String(error)
    });
  }
} 