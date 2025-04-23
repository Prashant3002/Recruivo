import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Application from '@/lib/models/applicationModel';
import User from '@/lib/models/userModel';
import Student from '@/lib/models/studentModel';
import Job from '@/lib/models/jobModel';

// Helper function to add cache control headers
function addNoCacheHeaders(headers: Headers) {
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  headers.set('Surrogate-Control', 'no-store');
}

export async function GET(request: NextRequest) {
  const timestamp = Date.now(); // For ensuring fresh results
  console.log(`GET /api/recruiter/candidates - ${new Date().toISOString()}`);
  
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const jobId = searchParams.get('jobId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    console.log(`Query params: status=${status}, search=${search}, jobId=${jobId}, page=${page}, limit=${limit}`);
    
    // Build match conditions
    const matchConditions: any = {};
    
    if (status && status !== 'all') {
      matchConditions.status = status;
    }
    
    if (jobId && jobId !== 'all') {
      matchConditions.job = jobId;  // Updated to match correct field name
    }
    
    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: matchConditions },
      {
        $lookup: {
          from: 'students',
          localField: 'student',  // Updated to match correct field name
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'student.user',  // Updated to match correct field name
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',  // Updated to match correct field name
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } }
    ];
    
    // Add search condition if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'user.name': { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } },
            { 'student.skills': { $in: [new RegExp(search, 'i')] } }
          ]
        }
      });
    }
    
    // Count total documents for pagination
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: 'total' });
    const totalResults = await Application.aggregate(countPipeline);
    const total = totalResults.length > 0 ? totalResults[0].total : 0;
    
    // Add pagination
    pipeline.push(
      { $sort: { appliedAt: -1 } }, // Sort by most recent, updated field name
      { $skip: skip },
      { $limit: limit }
    );
    
    // Add projection to format the output
    pipeline.push({
      $project: {
        _id: 1,
        id: { $toString: '$_id' },
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        coverLetter: 1,
        studentName: '$user.name',
        studentEmail: '$user.email',
        resumeUrl: '$student.resumeUrl',
        jobTitle: '$job.title',
        company: '$job.company',
        appliedAt: '$appliedAt',
        skills: '$student.skills',
        // Add computed fields for consistency with frontend
        resumeScore: { $add: [{ $multiply: [{ $rand: {} }, 30] }, 70] }, // Random 70-100
        matchScore: { $add: [{ $multiply: [{ $rand: {} }, 30] }, 70] }   // Random 70-100
      }
    });
    
    // Execute the query
    console.log('Executing MongoDB aggregation...');
    const candidates = await Application.aggregate(pipeline);
    console.log(`Found ${candidates.length} candidates`);
    
    // Get all jobs for filter dropdown
    let jobs = [];
    try {
      jobs = await Job.find({}).select('_id title').lean();
      console.log(`Found ${jobs.length} jobs for filter dropdown`);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Continue even if job fetch fails
    }
    
    // Create response with no-cache headers
    const response = NextResponse.json({
      success: true,
      candidates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      jobs,
      timestamp
    });
    
    // Add no-cache headers
    addNoCacheHeaders(response.headers);
    
    return response;
    
  } catch (error) {
    console.error('Error processing candidate request:', error);
    
    // Create error response with no-cache headers
    const response = NextResponse.json({
      success: false,
      error: 'Failed to retrieve candidates',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp
    }, { status: 500 });
    
    // Add no-cache headers
    addNoCacheHeaders(response.headers);
    
    return response;
  }
} 