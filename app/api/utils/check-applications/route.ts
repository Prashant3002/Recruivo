import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Application from '@/lib/models/applicationModel';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  console.log('Starting application check process...');
  
  try {
    // Connect to the database
    await connectDB();
    
    // Count total applications
    const count = await Application.countDocuments({});
    console.log(`Total applications in database: ${count}`);
    
    // Get 5 most recent applications with all their fields
    const applications = await Application.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    // Map applications to a cleaner format
    const recentApplications = applications.map(app => ({
      id: app._id.toString(),
      studentId: app.student?.toString(),
      jobId: app.job?.toString(),
      status: app.status,
      createdAt: app.createdAt,
      appliedAt: app.appliedAt,
      studentName: app.studentName,
      studentEmail: app.studentEmail,
      studentUniversity: app.studentUniversity,
      studentDegree: app.studentDegree,
      hasStudentModel: !!app.studentModel,
      studentModel: app.studentModel || 'none',
      hasResume: !!app.resume
    }));
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    return NextResponse.json({
      success: true,
      applicationCount: count,
      recentApplications: recentApplications,
      collections: collectionNames
    });
    
  } catch (error) {
    console.error('Error checking applications:', error);
    return NextResponse.json({ error: 'Failed to check applications' }, { status: 500 });
  }
} 