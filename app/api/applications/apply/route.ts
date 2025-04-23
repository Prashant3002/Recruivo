import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Application from "@/lib/models/applicationModel";
import Job from "@/lib/models/jobModel";
import { Student } from "@/lib/models";
import { User } from "@/lib/models/userModel";

/**
 * Simple, focused API endpoint for handling job applications
 * that works with or without full session authentication
 */
export async function POST(request: NextRequest) {
  console.log("[APPLY-API] Job application request received");
  
  try {
    // Connect to database
    await dbConnect();
    console.log("[APPLY-API] Database connected");
    
    // Parse request body
    const body = await request.json();
    const { 
      jobId, 
      coverLetter = "", 
      resumeUrl,
      studentName = "",
      studentEmail = "",
      userId = ""
    } = body;
    
    // Validate required fields
    if (!jobId) {
      console.log("[APPLY-API] Error: Missing job ID");
      return NextResponse.json({ 
        success: false, 
        error: "Job ID is required" 
      }, { status: 400 });
    }
    
    if (!resumeUrl) {
      console.log("[APPLY-API] Error: Missing resume URL");
      return NextResponse.json({ 
        success: false, 
        error: "Resume is required" 
      }, { status: 400 });
    }
    
    if (!studentEmail) {
      console.log("[APPLY-API] Error: Missing student email");
      return NextResponse.json({ 
        success: false, 
        error: "Student email is required" 
      }, { status: 400 });
    }
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      console.log("[APPLY-API] Error: Job not found:", jobId);
      return NextResponse.json({ 
        success: false, 
        error: "Job not found" 
      }, { status: 404 });
    }
    
    if (job.status !== "open") {
      console.log("[APPLY-API] Error: Job is not open for applications");
      return NextResponse.json({ 
        success: false, 
        error: "This job is no longer accepting applications" 
      }, { status: 400 });
    }
    
    // Find or identify the student
    let student = null;
    let studentId = null;
    let user = null;
    
    // Try to find the student based on information provided
    if (userId) {
      // If userId was directly provided
      user = await User.findById(userId);
      if (user) {
        student = await Student.findOne({ user: userId });
        if (student) {
          studentId = student._id;
          console.log("[APPLY-API] Found student by user ID:", studentId);
        }
      }
    }
    
    // If not found by userId, try by email
    if (!student && studentEmail) {
      // Find a user with this email
      user = await User.findOne({ email: studentEmail });
      if (user) {
        student = await Student.findOne({ user: user._id });
        if (student) {
          studentId = student._id;
          console.log("[APPLY-API] Found student by email lookup:", studentId);
        }
      }
      
      // If still no student, try to find Student directly with the email
      if (!student) {
        student = await Student.findOne({ email: studentEmail });
        if (student) {
          studentId = student._id;
          console.log("[APPLY-API] Found student by direct email match:", studentId);
        }
      }
    }
    
    // If we still don't have a student reference, create minimal user record
    if (!studentId) {
      console.log("[APPLY-API] No existing student found, creating reference");
      
      if (!user) {
        // Create a minimal user record if needed
        user = new User({
          name: studentName || "Job Applicant",
          email: studentEmail,
          role: "student",
          emailVerified: new Date()
        });
        
        try {
          await user.save();
          console.log("[APPLY-API] Created new user for application:", user._id);
        } catch (userError) {
          if (userError.code === 11000) { // Duplicate key error
            // User already exists, find it
            user = await User.findOne({ email: studentEmail });
            console.log("[APPLY-API] Found existing user for email:", user?._id);
          } else {
            throw userError;
          }
        }
      }
      
      // If we have a user ID but no student, create a basic student profile
      if (user && !student) {
        try {
          student = new Student({
            firstName: studentName.split(' ')[0] || "Applicant",
            lastName: studentName.split(' ').slice(1).join(' ') || "",
            email: studentEmail,
            user: user._id,
          });
          
          await student.save();
          studentId = student._id;
          console.log("[APPLY-API] Created basic student profile:", studentId);
        } catch (studentError) {
          // If can't create student, use user ID as reference
          studentId = user._id;
          console.log("[APPLY-API] Using user ID as student reference:", studentId);
        }
      }
    }
    
    // Check if user has already applied for this job
    const existingApplication = await Application.findOne({
      job: jobId,
      $or: [
        { student: studentId, studentEmail: studentEmail },
        { studentEmail: studentEmail }
      ]
    });
    
    if (existingApplication) {
      console.log("[APPLY-API] Student already applied for this job");
      return NextResponse.json({ 
        success: true, 
        duplicate: true,
        message: "You have already applied for this job" 
      });
    }
    
    // Prepare application data
    const applicationData = {
      student: studentId,
      job: jobId,
      status: "pending",
      appliedAt: new Date(),
      resume: resumeUrl,
      coverLetter: coverLetter || "",
      studentName: studentName || (student?.firstName ? `${student.firstName} ${student.lastName || ''}` : "Applicant"),
      studentEmail: studentEmail,
    };
    
    if (student) {
      applicationData.studentUniversity = student.university || "";
      applicationData.studentDegree = student.degree || "";
      applicationData.studentSkills = student.skills || [];
    }
    
    // Create application record
    const application = new Application(applicationData);
    await application.save();
    
    console.log("[APPLY-API] Application saved successfully with ID:", application._id);
    
    // Update job application count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationCount: 1 }
    });
    
    return NextResponse.json({ 
      success: true,
      applicationId: application._id,
      message: "Application submitted successfully"
    });
    
  } catch (error) {
    console.error("[APPLY-API] Error:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: true, 
        duplicate: true,
        message: "You have already applied for this job" 
      });
    }
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
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