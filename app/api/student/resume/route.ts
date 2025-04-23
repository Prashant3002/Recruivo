import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Student } from "@/lib/models";
import { User } from "@/lib/models/userModel";

/**
 * Simple API to get a student's resume URL
 * Can identify the student either from session, from email header, or via email in the request body
 */
export async function GET(request: NextRequest) {
  console.log("[RESUME-API] Resume request received");
  
  try {
    // Connect to database
    await dbConnect();
    
    // Check for email in headers or query params
    const userEmail = request.headers.get('x-user-email') || request.nextUrl.searchParams.get('email');
    
    if (!userEmail) {
      return NextResponse.json({ 
        success: false, 
        error: "Student email is required" 
      }, { status: 400 });
    }
    
    // Try to find student by email
    let student = null;
    
    // First look for a student with this email directly
    student = await Student.findOne({ email: userEmail }).select('firstName lastName resumeUrl');
    
    // If not found, try to find a user with this email and then the associated student
    if (!student) {
      const user = await User.findOne({ email: userEmail });
      if (user) {
        student = await Student.findOne({ user: user._id }).select('firstName lastName resumeUrl');
      }
    }
    
    if (!student) {
      return NextResponse.json({ 
        success: false, 
        error: "Student not found" 
      }, { status: 404 });
    }
    
    // Check if student has a resume
    if (!student.resumeUrl) {
      return NextResponse.json({ 
        success: false, 
        error: "No resume found for this student" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      resumeUrl: student.resumeUrl,
      studentName: student.firstName + (student.lastName ? ` ${student.lastName}` : "")
    });
    
  } catch (error) {
    console.error("[RESUME-API] Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to retrieve resume: " + error.message 
    }, { status: 500 });
  }
}

/**
 * Support POST requests as well, allowing email to be sent in the body
 */
export async function POST(request: NextRequest) {
  console.log("[RESUME-API] Resume POST request received");
  
  try {
    // Connect to database
    await dbConnect();
    
    // Get email from request body
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: "Student email is required" 
      }, { status: 400 });
    }
    
    // Try to find student by email
    let student = null;
    
    // First look for a student with this email directly
    student = await Student.findOne({ email }).select('firstName lastName resumeUrl');
    
    // If not found, try to find a user with this email and then the associated student
    if (!student) {
      const user = await User.findOne({ email });
      if (user) {
        student = await Student.findOne({ user: user._id }).select('firstName lastName resumeUrl');
      }
    }
    
    if (!student) {
      return NextResponse.json({ 
        success: false, 
        error: "Student not found" 
      }, { status: 404 });
    }
    
    // Check if student has a resume
    if (!student.resumeUrl) {
      return NextResponse.json({ 
        success: false, 
        error: "No resume found for this student" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      resumeUrl: student.resumeUrl,
      studentName: student.firstName + (student.lastName ? ` ${student.lastName}` : "")
    });
    
  } catch (error) {
    console.error("[RESUME-API] Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to retrieve resume: " + error.message 
    }, { status: 500 });
  }
} 