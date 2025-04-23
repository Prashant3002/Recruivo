import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongoose';
import Application from '@/lib/models/applicationModel';
import Job from '@/lib/models/jobModel';
import { Student } from '@/lib/models';
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";

export async function POST(request: NextRequest) {
  console.log("Starting job application process");
  console.log("Request cookies:", request.headers.get('cookie'));
  
  try {
    // Connect to the database first
    await dbConnect();
    console.log("Database connected");
    
    // Get the session
    const session = await getServerSession(authOptions);
    
    console.log("Session check details:", {
      hasSession: !!session,
      hasUser: session ? !!session.user : false,
      userEmail: session?.user?.email || 'none',
      userId: session?.user?.id || 'none',
      userRole: session?.user?.role || 'none'
    });
    
    // Validate session
    if (!session?.user?.id) {
      console.log("Authentication failed: No valid session found");
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }
    
    // Validate user role
    if (session.user.role !== "student") {
      console.log("Authorization failed: User is not a student");
      return NextResponse.json(
        { error: "Only students can submit applications" },
        { status: 403 }
      );
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
    
    const userId = session.user.id;
    console.log(`User ID from session: ${userId}`);
    
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
        student: student._id, // Use the Student document ID instead of User ID
        studentModel: 'Student', // Set to Student model
        status: "pending",
        appliedAt: new Date(),
        resume: student.resumeUrl,
        coverLetter: coverLetter,
        // Add additional student info to make it easier for recruiters
        studentDetails: {
          userId: userId,
          name: student.user.name,
          email: student.user.email,
          university: student.university,
          degree: student.degree,
          skills: student.skills
        }
      };
      
      console.log("Creating application:", newApplication);
      
      // Remove studentDetails as it's not in the schema, but log the info
      const { studentDetails, ...applicationData } = newApplication;
      console.log("Student details for recruiter:", studentDetails);
      
      const application = await Application.create(applicationData);
      
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