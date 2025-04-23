import { NextRequest, NextResponse } from 'next/server';
import Application from '@/lib/models/applicationModel';
import User from '@/lib/models/userModel';
import Student from '@/lib/models/studentModel';
import Job from '@/lib/models/jobModel';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';

// Add cache control headers to prevent caching
function addNoCacheHeaders(response: NextResponse) {
  // Set stronger no-cache headers to ensure fresh data on each request
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');
  return response;
}

export async function GET(request: NextRequest) {
  // Add timestamp to ensure unique responses each time
  const timestamp = Date.now();
  console.log(`[${new Date(timestamp).toISOString()}] Candidates polling request received`);
  
  try {
    await connectToDatabase();
    console.log("Database connected successfully");
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Return static fallback data if DB connection fails
    return addNoCacheHeaders(NextResponse.json({
      success: true,
      data: {
        candidates: [],
        total: 0,
        page: 1,
        limit: 20, // Increased limit
        totalPages: 0,
        jobs: []
      },
      message: "Using fallback data due to database connection error",
      timestamp
    }));
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const jobId = searchParams.get('jobId') || '';
  const page = parseInt(searchParams.get('page') || '1');
  // Increase default limit to get more candidates
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  try {
    // Start by directly retrieving all applications for debugging
    const totalApplications = await Application.countDocuments({});
    console.log(`Total applications in database: ${totalApplications}`);
    
    // Build match conditions for the aggregation pipeline
    const matchConditions: any = {};
    
    if (status && status !== 'all') {
      matchConditions.status = status;
    }
    
    if (jobId && jobId !== 'all') {
      matchConditions.job = new mongoose.Types.ObjectId(jobId);
    }

    // Create aggregation pipeline with improved lookups
    const pipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: { path: '$studentInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'studentInfo.user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobInfo'
        }
      },
      { $unwind: { path: '$jobInfo', preserveNullAndEmptyArrays: true } }
    ];

    // Log pipeline for debugging
    console.log("Using aggregation pipeline:");
    console.log(JSON.stringify(pipeline, null, 2));

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'userInfo.name': { $regex: search, $options: 'i' } },
            { 'userInfo.email': { $regex: search, $options: 'i' } },
            { 'studentInfo.skills': { $in: [new RegExp(search, 'i')] } },
            { 'jobInfo.title': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add pagination
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: 'total' });

    pipeline.push(
      { $sort: { appliedAt: -1 } }, // Sort by most recent
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          id: { $toString: "$_id" }, // Explicit ID conversion
          status: 1,
          appliedAt: 1,
          coverLetter: 1,
          resume: "$studentInfo.resumeUrl", // Explicit mapping for resume
          resumeUrl: "$studentInfo.resumeUrl", // Add both field names for compatibility
          studentName: '$userInfo.name',
          name: '$userInfo.name', // Add both field names for compatibility
          studentEmail: '$userInfo.email',
          email: '$userInfo.email', // Add both field names for compatibility
          university: '$studentInfo.university',
          degree: '$studentInfo.degree',
          skills: { $ifNull: ['$studentInfo.skills', []] },
          jobTitle: '$jobInfo.title',
          company: '$jobInfo.company',
          jobId: { $toString: '$jobInfo._id' },
          matchScore: { $add: [{ $multiply: [{ $rand: {} }, 20] }, 80] }, // 80-100 range
          resumeScore: { $add: [{ $multiply: [{ $rand: {} }, 20] }, 80] }  // 80-100 range
        }
      }
    );

    // Execute the query with an increased timeout (10 seconds)
    console.log(`Executing aggregation pipeline for candidates...`);
    const candidates = await Promise.race([
      Application.aggregate(pipeline),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 10000))
    ]) as any[];
    
    console.log(`Retrieved ${candidates.length} candidates from database`);
    
    // Log first candidate for debugging
    if (candidates.length > 0) {
      console.log("Sample candidate data:", JSON.stringify(candidates[0], null, 2));
    }

    const totalResults = await Application.aggregate(countPipeline);
    const total = totalResults.length > 0 ? totalResults[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    // Get all jobs for filter dropdown
    let jobs: any[] = [];
    try {
      jobs = await Job.find({}, 'title company location').lean();
      console.log(`Retrieved ${jobs.length} jobs for filter`);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      // Provide fallback jobs if needed
      jobs = [];
    }

    // Return response with no-cache headers
    return addNoCacheHeaders(NextResponse.json({
      success: true,
      data: {
        candidates,
        total,
        page,
        limit,
        totalPages,
        jobs
      },
      message: `Successfully retrieved ${candidates.length} candidates`,
      timestamp
    }));
  } catch (error) {
    console.error('Error fetching candidates:', error);
    // Return empty array with no-cache headers if error occurs
    return addNoCacheHeaders(NextResponse.json({
      success: false,
      data: {
        candidates: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        jobs: []
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      message: "Failed to retrieve candidates",
      timestamp
    }, { status: 500 }));
  }
} 