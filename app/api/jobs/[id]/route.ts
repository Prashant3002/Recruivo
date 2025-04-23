import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Job } from '@/lib/models';
import { withAuth } from '@/lib/auth';
import { getCurrentUser } from '@/lib/auth';

// Get single job by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    const job = await Job.findById(id)
      .populate('company', 'name logo website location')
      .populate('recruiter', 'name email');
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ job });
  } catch (error: any) {
    console.error('Get job error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get job' },
      { status: 500 }
    );
  }
}

// Update job (protected, only the recruiter who created the job or admin can update)
export const PUT = withAuth(
  async (req: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      await dbConnect();
      
      const { id } = params;
      const body = await req.json();
      
      // Find job
      const job = await Job.findById(id);
      
      if (!job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      
      // Check if user is authorized to update this job
      if (
        user.role !== 'admin' && 
        job.recruiter.toString() !== user.userId
      ) {
        return NextResponse.json(
          { error: 'Not authorized to update this job' },
          { status: 403 }
        );
      }
      
      // Update job
      const updatedJob = await Job.findByIdAndUpdate(
        id,
        { ...body },
        { new: true, runValidators: true }
      ).populate('company', 'name logo');
      
      return NextResponse.json({ job: updatedJob });
    } catch (error: any) {
      console.error('Update job error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update job' },
        { status: 500 }
      );
    }
  },
  ['recruiter', 'admin']
);

// Delete job (protected, only the recruiter who created the job or admin can delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the user from the token
    const user = getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if role is allowed
    if (!['recruiter', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const { id } = params;
    console.log("Deleting job with ID:", id);
    
    // Find job
    const job = await Job.findById(id);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to delete this job
    if (
      user.role !== 'admin' && 
      job.recruiter.toString() !== user.userId
    ) {
      return NextResponse.json(
        { error: 'Not authorized to delete this job' },
        { status: 403 }
      );
    }
    
    // Delete job
    await Job.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete job error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete job' },
      { status: 500 }
    );
  }
} 