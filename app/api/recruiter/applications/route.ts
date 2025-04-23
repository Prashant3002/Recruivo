import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Application from '@/lib/models/applicationModel';
import Job from '@/lib/models/jobModel';
import User from '@/lib/models/userModel';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Get applications for a recruiter
export async function GET(request: NextRequest) {
  console.log('Starting recruiter applications fetch process...');
  
  try {
    // Connect to the database
    await connectDB();
    
    // Get session information
    const session = await getServerSession(authOptions);
    console.log("Session check:", session ? `User: ${session?.user?.email}, Role: ${session?.user?.role}` : "No session");
    
    // For debugging: if no session, still return results but log it
    if (!session) {
      console.log("No session found, continuing for debugging purposes");
    }
    
    // Find all applications
    let applications;
    
    if (session?.user?.role === 'recruiter' && session?.user?.id) {
      // Find jobs posted by this recruiter
      const recruiterJobs = await Job.find({ recruiter: session.user.id }).select('_id');
      console.log(`Found ${recruiterJobs.length} jobs for recruiter ${session.user.id}`);
      
      const jobIds = recruiterJobs.map(job => job._id);
      
      // Find applications for these jobs
      applications = await Application.find({
        job: { $in: jobIds }
      })
      .populate({
        path: 'job',
        select: 'title company location type'
      })
      .sort({ createdAt: -1 });
      
      console.log(`Found ${applications.length} applications for recruiter jobs`);
    } else {
      // Fallback for debugging: get all applications
      applications = await Application.find({})
        .populate({
          path: 'job',
          select: 'title company location type'
        })
        .sort({ createdAt: -1 })
        .limit(20);
      
      console.log(`For debugging: Found ${applications.length} applications in total`);
    }
    
    // Map to a cleaner response
    const mappedApplications = applications.map(app => {
      // Convert to plain object
      const plainApp = app.toObject ? app.toObject() : app;
      
      return {
        _id: plainApp._id.toString(),
        status: plainApp.status || 'pending',
        appliedAt: plainApp.appliedAt || plainApp.createdAt || new Date(),
        resume: plainApp.resume || '',
        coverLetter: plainApp.coverLetter || '',
        studentName: plainApp.studentName || 'Unknown Student',
        studentEmail: plainApp.studentEmail || 'unknown@example.com',
        studentUniversity: plainApp.studentUniversity || '',
        studentDegree: plainApp.studentDegree || '',
        studentSkills: plainApp.studentSkills || [],
        
        job: plainApp.job ? {
          _id: plainApp.job._id.toString(),
          title: plainApp.job.title || 'Unknown Job',
          location: plainApp.job.location || '',
          type: plainApp.job.type || '',
          company: {
            name: plainApp.job.company?.name || 'Unknown Company',
            logo: plainApp.job.company?.logo || ''
          }
        } : {
          _id: 'unknown',
          title: 'Unknown Job',
          location: '',
          type: '',
          company: {
            name: 'Unknown Company',
            logo: ''
          }
        }
      };
    });
    
    return NextResponse.json({
      applications: mappedApplications,
      count: applications.length
    });
    
  } catch (error) {
    console.error('Error in recruiter applications fetch:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
} 