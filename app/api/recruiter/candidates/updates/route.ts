import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Application } from '@/lib/models';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Helper function to add cache control headers
function addNoCacheHeaders(headers: Headers) {
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  headers.set('Surrogate-Control', 'no-store');
}

export async function GET(request: NextRequest) {
  const timestamp = Date.now();
  console.log(`GET /api/recruiter/candidates/updates - ${new Date().toISOString()}`);
  
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const lastTimestamp = parseInt(searchParams.get('since') || '0');
    const jobId = searchParams.get('jobId');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log(`Query params: since=${lastTimestamp}, jobId=${jobId}, limit=${limit}`);
    
    // Check authentication with NextAuth
    const session = await getServerSession(authOptions);
    console.log("Session check:", session ? `User: ${session?.user?.email}, Role: ${session?.user?.role}` : "No session");
    
    // Restrict to recruiter role only
    if (!session || session.user.role !== 'recruiter') {
      console.log("Unauthorized attempt to access candidate updates");
      return NextResponse.json(
        { error: 'Unauthorized - Only recruiters can view candidate updates' },
        { status: 401 }
      );
    }
    
    // Build match conditions
    const matchConditions: any = {};
    
    // Only get updates since the provided timestamp
    if (lastTimestamp > 0) {
      // Use updatedAt field for getting only updated records
      matchConditions.updatedAt = { $gt: new Date(lastTimestamp) };
    }
    
    // Filter by job if provided
    if (jobId && jobId !== 'all') {
      matchConditions.job = jobId;
    }
    
    // Build aggregation pipeline
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
      { $unwind: { path: '$jobInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          status: 1,
          appliedAt: 1,
          updatedAt: 1,
          resume: 1,
          studentName: { $ifNull: ['$studentName', { $ifNull: ['$studentInfo.name', '$userInfo.name'] }] },
          studentEmail: { $ifNull: ['$studentEmail', { $ifNull: ['$studentInfo.email', '$userInfo.email'] }] },
          jobTitle: '$jobInfo.title',
          jobCompany: '$jobInfo.company',
        }
      },
      { $sort: { updatedAt: -1 } },
      { $limit: limit }
    ];
    
    const updatedApplications = await Application.aggregate(pipeline);
    console.log(`Found ${updatedApplications.length} updated applications`);
    
    // Format the updates
    const formattedUpdates = updatedApplications.map(app => {
      return {
        id: app._id.toString(),
        name: app.studentName || 'Unknown',
        email: app.studentEmail || '',
        jobTitle: app.jobTitle || 'Unknown Position',
        jobCompany: app.jobCompany || '',
        appliedDate: app.appliedAt,
        status: app.status || 'pending',
        updatedAt: app.updatedAt
      };
    });
    
    // Create response with no-cache headers
    const response = NextResponse.json({
      success: true,
      updates: formattedUpdates,
      timestamp
    });
    
    // Add no-cache headers
    addNoCacheHeaders(response.headers);
    
    return response;
    
  } catch (error) {
    console.error('Error fetching candidate updates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candidate updates', message: error.message },
      { status: 500 }
    );
  }
} 