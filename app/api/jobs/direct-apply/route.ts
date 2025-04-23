import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongoose';
import Application from '@/lib/models/applicationModel';
import Job from '@/lib/models/jobModel';
import { Student } from '@/lib/models';
import User from '@/lib/models/userModel';
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest) {
  console.log("Starting direct job application process");
  
  try {
    // Connect to the database first
    await dbConnect();
    console.log("Database connected");
    
    // Log all cookies for debugging
    const cookieHeader = request.headers.get('cookie');
    console.log("Request cookies:", cookieHeader);
    
    // Get token from the request (this works even if getServerSession fails)
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    console.log("JWT token found:", token ? "Yes" : "No");
    
    if (token) {
      console.log("Token user ID:", token.id);
      console.log("Token user role:", token.role);
    }
    
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("Request body:", body);
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    
    const { jobId, coverLetter = "" } = body;
    
    if (!jobId) {
      console.log("Validation failed: Job ID is missing");
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }
    
    // Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      console.log("Job not found:", jobId);
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }
    
    if (job.status !== "open") {
      console.log("Job is not open for applications:", job.status);
      return NextResponse.json(
        { error: "This job is no longer accepting applications" },
        { status: 400 }
      );
    }
    
    // Get user ID from the token or try to find the user from the session
    let userId;
    if (token?.id) {
      // Use ID from the token
      userId = token.id;
    } else {
      // Try a different approach - use the session
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
      } else {
        console.log("Authentication failed: No user ID found in token or session");
        return NextResponse.json(
          { error: "Unauthorized - Please log in again" },
          { status: 401 }
        );
      }
    }
    
    console.log(`User ID for application: ${userId}`);
    
    // If a token was found but the role is not student
    if (token?.role && token.role !== "student") {
      console.log("Authorization failed: User is not a student");
      return NextResponse.json(
        { error: "Only students can submit applications" },
        { status: 403 }
      );
    }
    
    // Try to find the user
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found:", userId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    console.log(`User found: ${user.email}`);
    
    // Check if user is a student
    if (user.role !== "student") {
      console.log("User is not a student:", user.role);
      return NextResponse.json(
        { error: "Only students can submit applications" },
        { status: 403 }
      );
    }
    
    // Check if student has already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      $or: [
        { student: userId, studentModel: 'User' },
        { student: userId, studentModel: 'Student' }
      ]
    });
    
    if (existingApplication) {
      console.log("Student has already applied to this job");
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      );
    }
    
    // Find student profile with more details for the recruiter
    const student = await Student.findOne({ user: userId })
      .select('resumeUrl firstName lastName university degree skills')
      .populate('user', 'email name');
      
    console.log(`Student search result for user ${userId}:`, student ? 'found' : 'not found');
    
    if (!student) {
      console.log("Student profile not found");
      return NextResponse.json(
        { error: "Student profile not found. Please complete your profile first." },
        { status: 400 }
      );
    }
    
    // Check if student has a resume
    if (!student.resumeUrl) {
      console.log("No resume found for student");
      return NextResponse.json(
        { error: "Please upload a resume before applying to jobs" },
        { status: 400 }
      );
    }
    
    try {
      // Create new application with complete student info for recruiter
      const newApplication = {
        job: jobId,
        student: student._id, // Use the Student document ID
        studentModel: 'Student',
        status: "pending",
        appliedAt: new Date(),
        resume: student.resumeUrl,
        coverLetter: coverLetter
      };
      
      console.log("Creating application:", newApplication);
      
      const application = await Application.create(newApplication);
      
      console.log("Application created successfully:", application._id);
      
      // Increment application count for the job
      await Job.findByIdAndUpdate(jobId, {
        $inc: { applicationCount: 1 }
      });
      
      return NextResponse.json({ 
        success: true,
        message: "Application submitted successfully" 
      });
    } catch (dbError: any) {
      console.error("Database error creating application:", dbError);
      
      // Check if it's a validation error
      if (dbError.name === 'ValidationError') {
        return NextResponse.json(
          { error: "Application could not be created. Please check your profile details." },
          { status: 400 }
        );
      }
      
      // Check if it's a duplicate key error (already applied)
      if (dbError.code === 11000) {
        return NextResponse.json(
          { error: "You have already applied to this job" },
          { status: 400 }
        );
      }
      
      throw dbError; // Let the outer catch handle other errors
    }
    
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application. Please try again later." },
      { status: 500 }
    );
  }
} 