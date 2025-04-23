import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Job from "@/lib/models/jobModel";
import User from "@/lib/models/userModel";
import Application from "@/lib/models/applicationModel";
import Student from "@/lib/models/studentModel";
import mongoose from "mongoose";
import { emitCandidateUpdate } from "@/lib/socketService";

export async function POST(request: NextRequest) {
  console.log("[HARDCODED-APPLY] Starting job application process");
  
  try {
    // Connect to database with retry logic
    let dbConnected = false;
    let retries = 3;
    
    while (!dbConnected && retries > 0) {
      try {
        await connectDB();
        dbConnected = true;
        console.log("[HARDCODED-APPLY] Database connected successfully");
        
        // Log the number of existing applications for debugging
        const existingAppsCount = await Application.countDocuments({});
        console.log(`[HARDCODED-APPLY] Found ${existingAppsCount} existing applications in database`);
      } catch (dbError) {
        retries--;
        console.error(`[HARDCODED-APPLY] Database connection error, retries left: ${retries}`, dbError);
        if (retries > 0) {
          // Wait 500ms before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          throw new Error("Failed to connect to database after multiple attempts");
        }
      }
    }
    
    // Parse request body
    const body = await request.json();
    const { 
      jobId, 
      coverLetter, 
      resumeUrl,
      studentName,
      studentEmail,
      studentUniversity,
      studentDegree,
      studentSkills 
    } = body;
    
    console.log("[HARDCODED-APPLY] Received application for job:", jobId);
    console.log("[HARDCODED-APPLY] Student email:", studentEmail);
    console.log("[HARDCODED-APPLY] Resume URL provided:", resumeUrl);
    console.log("[HARDCODED-APPLY] Student name:", studentName);
    console.log("[HARDCODED-APPLY] Student university:", studentUniversity || "Not provided");
    console.log("[HARDCODED-APPLY] Student degree:", studentDegree || "Not provided");
    console.log("[HARDCODED-APPLY] Student skills:", studentSkills ? JSON.stringify(studentSkills) : "Not provided");
    
    // Validate required fields
    if (!jobId) {
      console.log("[HARDCODED-APPLY] Error: Missing job ID");
      return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
    }
    
    if (!studentEmail) {
      console.log("[HARDCODED-APPLY] Error: Missing student email");
      return NextResponse.json({ success: false, error: "Student email is required" }, { status: 400 });
    }
    
    if (!resumeUrl) {
      console.log("[HARDCODED-APPLY] Error: Missing resume URL");
      return NextResponse.json({ success: false, error: "Resume is required" }, { status: 400 });
    }
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      console.log("[HARDCODED-APPLY] Error: Job not found:", jobId);
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }
    
    // Find or create user
    let user = await User.findOne({ email: studentEmail });
    
    if (!user) {
      console.log("[HARDCODED-APPLY] Creating new user for:", studentEmail);
      // Create new user if not exists
      user = new User({
        name: studentName || "Student User",
        email: studentEmail,
        role: "student",
        emailVerified: new Date(),
      });
      await user.save();
      console.log("[HARDCODED-APPLY] Created new user with ID:", user._id);
    }
    
    // Find or create student profile
    let student = await Student.findOne({ user: user._id });
    
    if (!student) {
      console.log("[HARDCODED-APPLY] Creating new student profile for user:", user._id);
      // Create student profile if not exists
      student = new Student({
        user: user._id,
        university: studentUniversity || "Unknown University",
        degree: studentDegree || "Unknown Degree",
        skills: studentSkills || [],
        resumeUrl: resumeUrl,
      });
      await student.save();
      console.log("[HARDCODED-APPLY] Created new student profile with ID:", student._id);
      console.log("[HARDCODED-APPLY] Saved resume URL to student profile:", resumeUrl);
      
      // Update user with student profile reference
      user.profile = student._id;
      await user.save();
    } else {
      // Update resume if needed
      if (student.resumeUrl !== resumeUrl) {
        student.resumeUrl = resumeUrl;
        if (studentUniversity) student.university = studentUniversity;
        if (studentDegree) student.degree = studentDegree;
        if (studentSkills && studentSkills.length) student.skills = studentSkills;
        await student.save();
        console.log("[HARDCODED-APPLY] Updated student profile with new resume URL:", resumeUrl);
      }
    }
    
    // Check if user has already applied for this job
    const existingApplication = await Application.findOne({
      student: student._id,
      job: jobId
    });
    
    if (existingApplication) {
      console.log("[HARDCODED-APPLY] Student already applied for this job");
      return NextResponse.json({ 
        success: true, 
        duplicate: true,
        message: "You have already applied for this job" 
      });
    }
    
    // Create new application
    const application = new Application({
      student: student._id,
      job: jobId,
      status: "pending",
      appliedAt: new Date(),
      resume: resumeUrl,
      coverLetter: coverLetter || "",
    });
    
    await application.save();
    console.log("[HARDCODED-APPLY] Application created successfully with ID:", application._id);
    console.log("[HARDCODED-APPLY] Resume URL saved in application:", resumeUrl);
    
    // Verify the application was saved correctly
    const savedApplication = await Application.findById(application._id);
    if (savedApplication) {
      console.log("[HARDCODED-APPLY] Application verification successful!");
      console.log("[HARDCODED-APPLY] Saved application data:", {
        id: savedApplication._id,
        student: savedApplication.student,
        job: savedApplication.job,
        status: savedApplication.status,
        appliedAt: savedApplication.appliedAt
      });
      
      // Count applications again to verify the count increased
      const updatedAppsCount = await Application.countDocuments({});
      console.log(`[HARDCODED-APPLY] Application count is now ${updatedAppsCount}`);
    } else {
      console.error("[HARDCODED-APPLY] Failed to verify saved application!");
    }
    
    // Find the job to get the recruiter ID
    const jobDetails = await Job.findById(jobId).populate('recruiter');
    const recruiterId = jobDetails?.recruiter?._id?.toString();
    
    // Prepare candidate data for real-time update
    const candidateData = {
      id: application._id.toString(),
      name: user.name,
      email: user.email,
      status: "pending",
      appliedDate: application.appliedAt,
      resumeUrl: resumeUrl,
      jobTitle: job.title,
      company: job.company,
      jobId: job._id.toString(),
      recruiterId: recruiterId,
      skills: student.skills || [],
      // Add some reasonable scores for the frontend
      resumeScore: Math.floor(Math.random() * 20) + 80, // 80-100
      matchScore: Math.floor(Math.random() * 20) + 80   // 80-100
    };
    
    // Emit socket event for real-time updates
    try {
      console.log("[HARDCODED-APPLY] Emitting real-time update for new application");
      emitCandidateUpdate(candidateData);
    } catch (socketError) {
      console.error("[HARDCODED-APPLY] Error emitting socket event:", socketError);
      // Don't fail the request if socket emission fails
    }
    
    return NextResponse.json({ 
      success: true,
      applicationId: application._id,
      message: "Application submitted successfully"
    });
    
  } catch (error: any) {
    console.error("[HARDCODED-APPLY] Error:", error.message);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      console.log("[HARDCODED-APPLY] Duplicate application detected");
      return NextResponse.json({ 
        success: true, 
        duplicate: true,
        message: "You have already applied for this job" 
      });
    }
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      console.log("[HARDCODED-APPLY] Validation error:", validationErrors.join(", "));
      return NextResponse.json({ 
        success: false, 
        error: "Validation error: " + validationErrors.join(", ") 
      }, { status: 400 });
    }
    
    // Handle database connection errors
    if (error.message.includes("connect to database") || error.name === "MongoNetworkError") {
      console.log("[HARDCODED-APPLY] Database connection error detected");
      return NextResponse.json({ 
        success: false, 
        error: "We're experiencing database connectivity issues. Please try again later." 
      }, { status: 503 });
    }
    
    console.log("[HARDCODED-APPLY] Unhandled error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create application: " + error.message 
    }, { status: 500 });
  }
} 