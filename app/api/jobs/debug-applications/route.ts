import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Application from '@/lib/models/applicationModel';
import Job from '@/lib/models/jobModel';
import Student from '@/lib/models/studentModel';

export async function GET(request: NextRequest) {
  console.log('Starting debug applications fetch process...');
  
  try {
    // Connect to the database
    await connectDB();
    
    // Find all applications
    const applications = await Application.find({})
      .populate({
        path: 'job',
        select: 'title company location type'
      })
      .sort({ createdAt: -1 })
      .limit(20);
    
    console.log(`Found ${applications.length} applications`);
    
    // Map to a cleaner response
    const mappedApplications = applications.map(app => {
      // Convert to plain object
      const plainApp = app.toObject ? app.toObject() : app;
      
      return {
        id: plainApp._id.toString(),
        jobId: plainApp.job?._id?.toString(),
        jobTitle: plainApp.job?.title || 'Unknown Job',
        studentId: plainApp.student?.toString(),
        studentName: plainApp.studentName || 'Unknown Student',
        studentEmail: plainApp.studentEmail || 'unknown@example.com',
        studentUniversity: plainApp.studentUniversity || '',
        studentDegree: plainApp.studentDegree || '',
        status: plainApp.status || 'pending',
        appliedAt: plainApp.appliedAt || plainApp.createdAt || new Date(),
        hasResume: !!plainApp.resume,
        hasCoverLetter: !!plainApp.coverLetter
      };
    });
    
    return NextResponse.json({
      success: true,
      applications: mappedApplications,
      count: applications.length
    });
    
  } catch (error) {
    console.error('Error in debug applications fetch:', error);
    return NextResponse.json({ error: 'Failed to fetch applications for debugging' }, { status: 500 });
  }
} 