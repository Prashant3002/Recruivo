import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Application from "@/lib/models/applicationModel";
import Job from "@/lib/models/jobModel";
import { Student } from "@/lib/models";
import { User } from "@/lib/models/userModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(request: NextRequest) {
  console.log("[SUBMIT-APPLICATION] Starting job application process");
  
  try {
    // Connect to database
    await dbConnect();
    console.log("[SUBMIT-APPLICATION] Database connected successfully");
    
    // Parse request body
    const body = await request.json();
    const { 
      jobId, 
      coverLetter = "", 
      resumeUrl,
      studentName = "",
      studentEmail = "",
      studentUniversity = "",
      studentDegree = "",
      studentSkills = []
    } = body;
    
    // Log application details
    console.log("[SUBMIT-APPLICATION] Received application for job:", jobId);
    console.log("[SUBMIT-APPLICATION] Resume URL provided:", resumeUrl);
    
    // Validate required fields
    if (!jobId) {
      console.log("[SUBMIT-APPLICATION] Error: Missing job ID");
      return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
    }
    
    if (!resumeUrl) {
      console.log("[SUBMIT-APPLICATION] Error: Missing resume URL");
      return NextResponse.json({ success: false, error: "Resume is required" }, { status: 400 });
    }
    
    // Try to get authenticated user from session
    const session = await getServerSession(authOptions);
    let userId = null;
    let userEmail = null;
    
    if (session?.user) {
      userId = session.user.id;
      userEmail = session.user.email;
      console.log("[SUBMIT-APPLICATION] Authenticated user:", userEmail);
    } else if (studentEmail) {
      // Use provided email as fallback
      userEmail = studentEmail;
      console.log("[SUBMIT-APPLICATION] Using provided email (no session):", userEmail);
    } else {
      console.log("[SUBMIT-APPLICATION] Error: No authentication or email provided");
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }
    
    // Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      console.log("[SUBMIT-APPLICATION] Error: Job not found:", jobId);
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }
    
    if (job.status !== "open") {
      console.log("[SUBMIT-APPLICATION] Error: Job is not open for applications:", job.status);
      return NextResponse.json({ 
        success: false, 
        error: "This job is no longer accepting applications" 
      }, { status: 400 });
    }
    
    // Find or identify the student
    let student = null;
    let studentId = null;
    
    // First try to find student by userId if available
    if (userId) {
      student = await Student.findOne({ user: userId });
      if (student) {
        studentId = student._id;
        console.log("[SUBMIT-APPLICATION] Found student by user ID:", studentId);
      }
    }
    
    // If not found by userId, try by email
    if (!student && userEmail) {
      // Find the user by email first
      const user = await User.findOne({ email: userEmail });
      if (user) {
        // Try to find student linked to this user
        student = await Student.findOne({ user: user._id });
        if (student) {
          studentId = student._id;
          console.log("[SUBMIT-APPLICATION] Found student by email lookup:", studentId);
        }
      }
    }
    
    // If still no student found but we have userEmail, try to find Student directly with the same email
    if (!student && userEmail) {
      const possibleStudent = await Student.findOne({ email: userEmail });
      if (possibleStudent) {
        student = possibleStudent;
        studentId = student._id;
        console.log("[SUBMIT-APPLICATION] Found student by direct email match:", studentId);
      }
    }
    
    // If we still don't have a student but have user info, create a temporary student reference
    // This ensures applications are properly tracked even without full student profiles
    if (!studentId && userId) {
      console.log("[SUBMIT-APPLICATION] Using user ID as student reference:", userId);
      studentId = userId;
    }
    
    // Check if user has already applied for this job
    if (studentId) {
      const existingApplication = await Application.findOne({
        student: studentId,
        job: jobId
      });
      
      if (existingApplication) {
        console.log("[SUBMIT-APPLICATION] Student already applied for this job");
        return NextResponse.json({ 
          success: true, 
          duplicate: true,
          message: "You have already applied for this job" 
        });
      }
    }
    
    // Create application record
    const applicationData = {
      student: studentId,
      job: jobId,
      status: "pending",
      appliedAt: new Date(),
      resume: resumeUrl,
      coverLetter: coverLetter || "",
      studentName: studentName || (student?.firstName ? `${student.firstName} ${student.lastName || ''}` : ""),
      studentEmail: userEmail || studentEmail,
      studentUniversity: studentUniversity || student?.university || "",
      studentDegree: studentDegree || student?.degree || "",
      studentSkills: studentSkills?.length ? studentSkills : (student?.skills || [])
    };
    
    // Insert into applications table
    const application = new Application(applicationData);
    await application.save();
    
    console.log("[SUBMIT-APPLICATION] Application saved successfully with ID:", application._id);
    
    // Update job application count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationCount: 1 }
    });
    
    return NextResponse.json({ 
      success: true,
      applicationId: application._id,
      message: "Application submitted successfully"
    });
    
  } catch (error: any) {
    console.error("[SUBMIT-APPLICATION] Error:", error.message);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      console.log("[SUBMIT-APPLICATION] Duplicate application detected");
      return NextResponse.json({ 
        success: true, 
        duplicate: true,
        message: "You have already applied for this job" 
      });
    }
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      console.log("[SUBMIT-APPLICATION] Validation error:", validationErrors.join(", "));
      return NextResponse.json({ 
        success: false, 
        error: "Validation error: " + validationErrors.join(", ") 
      }, { status: 400 });
    }
    
    // Return general error
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create application: " + error.message 
    }, { status: 500 });
  }
} 