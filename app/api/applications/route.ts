import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Application from '@/lib/models/applicationModel';
import Job from '@/lib/models/jobModel';
import { getCurrentUser, withAuth } from '@/lib/auth';
import { Student } from '@/lib/models';
import Resume from '@/lib/models/resumeModel';
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";

// Get applications (different behavior based on user role)
export async function GET(request: Request) {
  try {
    console.log("GET /api/applications - Received request");
    
    const session = await getServerSession(authOptions);
    console.log("Session check:", session ? `User: ${session.user.email}, Role: ${session.user.role}` : "No session");
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await dbConnect();
    console.log("Database connected");
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    console.log("Query params:", { status, page, limit, skip });
    
    // Build query based on user role
    const query: any = {};
    
    if (session.user.role === "student") {
      // Students can only see their own applications
      console.log(`Finding applications for student: ${session.user.id}, email: ${session.user.email}`);
      
      // Find the student document first to ensure the student exists
      const student = await Student.findOne({ user: session.user.id });
      if (student) {
        console.log("Student profile found, ID:", student._id);
      } else {
        console.log("Student profile not found, will search by email only");
      }
      
      // Query for applications where:
      // 1. Student is the user ID with studentModel 'User'
      // 2. Student is the student document ID with studentModel 'Student'
      // 3. The studentEmail field matches the user's email (for hardcoded applications)
      const orConditions = [];
      
      if (session.user.id) {
        orConditions.push({ student: session.user.id, studentModel: 'User' });
      }
      
      if (student && student._id) {
        orConditions.push({ student: student._id, studentModel: 'Student' });
      }
      
      if (session.user.email) {
        orConditions.push({ studentEmail: session.user.email });
      }
      
      query.$or = orConditions;
      
      console.log("Enhanced query for student applications:", JSON.stringify(query));
    } else if (session.user.role === "recruiter") {
      // Recruiters can see applications for jobs they posted
      console.log(`Finding applications for recruiter: ${session.user.id}`);
      const recruiterJobs = await Job.find({ recruiter: session.user.id }).select('_id');
      query.job = { $in: recruiterJobs.map(job => job._id) };
    } else {
      console.log(`Unauthorized role: ${session.user.role}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Add status filter if provided
    if (status) {
      query.status = status;
      console.log(`Adding status filter: ${status}`);
    }
    
    console.log("Final query:", JSON.stringify(query));
    
    // First check how many applications exist in total (ignoring pagination)
    const totalCount = await Application.countDocuments(query);
    console.log(`Total applications found in database matching query: ${totalCount}`);
    
    // Get applications with populated job data
    const applications = await Application.find(query)
      .populate({
        path: "job",
        select: "title company location type salary status applicationDeadline",
        populate: {
          path: "company",
          select: "name logo"
        }
      })
      .populate({
        path: "student",
        select: "user firstName lastName email resumeUrl"
      })
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    console.log(`Retrieved ${applications.length} applications after pagination`);
    
    // Debug log the first application to see its structure
    if (applications.length > 0) {
      console.log("First application data structure:", 
        JSON.stringify({
          _id: applications[0]._id,
          studentEmail: applications[0].studentEmail,
          studentName: applications[0].studentName,
          jobTitle: applications[0].job?.title || 'No job title',
          status: applications[0].status
        })
      );
    }
    
    // Map the results to ensure consistent format with proper data
    const mappedApplications = applications.map(app => {
      // Convert the Mongoose document to a plain object
      const plainApp = app.toObject ? app.toObject() : app;
      
      console.log(`Processing application with ID: ${plainApp._id}`);
      
      // Basic application data
      const mappedApp = {
        _id: plainApp._id.toString(),
        status: plainApp.status || "pending",
        appliedAt: plainApp.appliedAt || new Date(),
        resume: plainApp.resume || "",
        coverLetter: plainApp.coverLetter || "",
        
        // Include student details
        studentName: plainApp.studentName || (plainApp.student?.firstName ? `${plainApp.student.firstName} ${plainApp.student.lastName || ''}` : null),
        studentEmail: plainApp.studentEmail || plainApp.student?.email || session.user.email,
        studentUniversity: plainApp.studentUniversity || null,
        studentDegree: plainApp.studentDegree || null,
        studentSkills: plainApp.studentSkills || [],
        
        // Use job data directly if populated
        job: plainApp.job ? {
          _id: plainApp.job._id.toString(),
          title: plainApp.job.title || "Unknown Job",
          location: plainApp.job.location || "Unknown Location",
          type: plainApp.job.type || "Unknown Type",
          status: plainApp.job.status || "unknown",
          applicationDeadline: plainApp.job.applicationDeadline || null,
          company: plainApp.job.company ? {
            name: plainApp.job.company.name || "Unknown Company",
            logo: plainApp.job.company.logo || ""
          } : {
            name: "Unknown Company",
            logo: ""
          }
        } : {
          _id: "unknown",
          title: "Unknown Job",
          location: "Unknown",
          type: "Unknown",
          status: "unknown",
          company: {
            name: "Unknown Company",
            logo: ""
          }
        }
      };
      
      return mappedApp;
    });
    
    console.log(`Processed ${mappedApplications.length} applications for display`);
    
    // Get total count for pagination
    const total = await Application.countDocuments(query);
    
    return NextResponse.json({
      applications: mappedApplications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

// Create a new application (students only)
export async function POST(request: NextRequest) {
  try {
    console.log("Starting application submission process");
    
    // Connect to the database first
    await dbConnect();
    console.log("Database connected");
    
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Log session details with more information
    console.log("Session check details:", {
      hasSession: !!session,
      hasUser: session ? !!session.user : false,
      userEmail: session?.user?.email || 'none',
      userId: session?.user?.id || 'none',
      userRole: session?.user?.role || 'none'
    });
    
    // Validate session
    if (!session || !session.user || !session.user.id) {
      console.log("Authentication failed: Invalid session data");
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }
    
    // Log user role for debugging
    console.log(`User role: ${session.user.role}, ID: ${session.user.id}`);
    
    if (session.user.role !== "student") {
      console.log("Authorization failed: User is not a student");
      return NextResponse.json(
        { error: "Only students can submit applications" },
        { status: 403 }
      );
    }
    
    // Parse the request body
    let body;
    try {
      const bodyText = await request.text();
      console.log("Request body text:", bodyText);
      body = JSON.parse(bodyText);
      console.log("Parsed body:", body);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body - could not parse JSON" },
        { status: 400 }
      );
    }
    
    const { jobId } = body;
    
    if (!jobId) {
      console.log("Validation failed: Job ID is missing");
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }
    
    // Check if job exists and is open
    console.log(`Looking for job with ID: ${jobId}`);
    const job = await Job.findById(jobId);
    if (!job) {
      console.log("Job not found:", jobId);
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }
    
    console.log(`Job found: ${job.title}, status: ${job.status}`);
    if (job.status !== "open") {
      console.log("Job is not open for applications:", job.status);
      return NextResponse.json(
        { error: "This job is no longer accepting applications" },
        { status: 400 }
      );
    }
    
    console.log("Checking for existing application");
    // Check if student has already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      student: session.user.id,
      studentModel: 'User'
    });
    
    if (existingApplication) {
      console.log("Student has already applied to this job:", existingApplication._id);
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      );
    }
    
    // Find student's resume
    console.log("Looking for student profile with user ID:", session.user.id);
    const student = await Student.findOne({ user: session.user.id });
    
    if (!student) {
      console.log("Student profile not found for user ID:", session.user.id);
      return NextResponse.json(
        { error: "Student profile not found. Please complete your profile first." },
        { status: 400 }
      );
    }
    
    console.log("Student found:", student._id);
    
    // Find the active resume for the student
    let resumeUrl = student.resumeUrl; 
    
    if (!resumeUrl) {
      console.log("No resume URL found for student");
      return NextResponse.json(
        { error: "Please upload a resume before applying to jobs" },
        { status: 400 }
      );
    }
    
    console.log("Resume URL found:", resumeUrl);
    console.log("Creating new application with resume URL:", resumeUrl);
    
    // Create new application
    try {
      // Create application with both references - the User ID and Student ID
      const newApplication = {
        job: jobId,
        student: session.user.id,
        studentModel: 'User',
        status: "pending",
        appliedAt: new Date(),
        resume: resumeUrl,
        coverLetter: body.coverLetter || ""
      };
      
      console.log("Creating application:", newApplication);
      
      const application = await Application.create(newApplication);
      
      console.log("Updating job application count");
      // Increment application count for the job
      await Job.findByIdAndUpdate(jobId, {
        $inc: { applicationCount: 1 }
      });
      
      console.log("Application created successfully:", application._id);
      return NextResponse.json({ 
        success: true,
        application,
        message: "Application submitted successfully" 
      });
    } catch (dbError) {
      console.error("Database error creating application:", dbError);
      
      // Check if it's a validation error
      if (dbError.name === 'ValidationError') {
        // Return a more specific error message
        return NextResponse.json(
          { error: "Application could not be created. Please complete your profile and upload a resume first." },
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
      
      // For other errors, return a generic error message
      return NextResponse.json(
        { error: "Failed to create application" },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add a new endpoint to fetch applications without authentication for testing purposes
export async function PATCH(request: NextRequest) {
  try {
    console.log("PATCH /api/applications - Test endpoint without auth");
    
    await dbConnect();
    console.log("Database connected");
    
    // Find all applications with studentEmail field
    const applications = await Application.find({
      studentEmail: { $exists: true, $ne: null }
    })
    .populate({
      path: "job",
      select: "title company location type status applicationDeadline",
      populate: {
        path: "company",
        select: "name logo"
      }
    })
    .sort({ appliedAt: -1 })
    .limit(20);
    
    console.log(`Found ${applications.length} applications with studentEmail field`);
    
    // Map the results to ensure consistent format
    const mappedApplications = applications.map(app => {
      // Convert the Mongoose document to a plain object
      const plainApp = app.toObject ? app.toObject() : app;
      
      return {
        _id: plainApp._id.toString(),
        status: plainApp.status || "pending",
        appliedAt: plainApp.appliedAt || new Date(),
        resume: plainApp.resume || "",
        coverLetter: plainApp.coverLetter || "",
        
        // Include student details
        studentName: plainApp.studentName || "Unknown Student",
        studentEmail: plainApp.studentEmail || "unknown@email.com",
        studentUniversity: plainApp.studentUniversity || null,
        studentDegree: plainApp.studentDegree || null,
        studentSkills: plainApp.studentSkills || [],
        
        // Use job data directly if populated
        job: plainApp.job ? {
          _id: plainApp.job._id.toString(),
          title: plainApp.job.title || "Unknown Job",
          location: plainApp.job.location || "Unknown Location",
          type: plainApp.job.type || "Unknown Type",
          status: plainApp.job.status || "unknown",
          applicationDeadline: plainApp.job.applicationDeadline || null,
          company: plainApp.job.company ? {
            name: plainApp.job.company.name || "Unknown Company",
            logo: plainApp.job.company.logo || ""
          } : {
            name: "Unknown Company",
            logo: ""
          }
        } : {
          _id: "unknown",
          title: "Unknown Job",
          location: "Unknown",
          type: "Unknown",
          status: "unknown",
          company: {
            name: "Unknown Company",
            logo: ""
          }
        }
      };
    });
    
    return NextResponse.json({
      success: true,
      message: "Test endpoint - no authentication required",
      applications: mappedApplications,
      count: mappedApplications.length
    });
  } catch (error) {
    console.error("Error in test endpoint:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications in test endpoint" },
      { status: 500 }
    );
  }
} 