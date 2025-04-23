import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Job } from '@/lib/models';
import { getCurrentUser, withAuth } from '@/lib/auth';

// Get all jobs with filtering
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get query parameters
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || 'open';
    const type = url.searchParams.get('type') || '';
    const location = url.searchParams.get('location') || '';
    const company = url.searchParams.get('company') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    
    // Build filter object
    const filter: any = {
      status: status || 'open', // Default to open jobs
    };
    
    // Add optional filters
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (company) {
      filter.company = company;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get jobs with pagination
    const jobs = await Job.find(filter)
      .populate('company', 'name logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Job.countDocuments(filter);
    
    return NextResponse.json({
      jobs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error: any) {
    console.error('Get jobs error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get jobs' },
      { status: 500 }
    );
  }
}

// Create a new job (protected, only recruiters can create jobs)
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    if (user.role !== 'recruiter') {
      return NextResponse.json(
        { error: 'Only recruiters can create jobs' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const body = await req.json();
    
    // Create job with recruiter ID
    const job = await Job.create({
      ...body,
      recruiter: user.userId,
    });
    
    return NextResponse.json({ job }, { status: 201 });
  } catch (error: any) {
    console.error('Create job error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create job' },
      { status: 500 }
    );
  }
}, ['recruiter']); 