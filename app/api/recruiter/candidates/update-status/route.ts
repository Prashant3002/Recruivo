import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongoose';
import Application from '@/lib/models/applicationModel';
import { withAuth } from '@/lib/auth';
import { emitCandidateUpdate } from '@/lib/socketService';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { candidateId, status } = body;

    if (!candidateId || !status) {
      return NextResponse.json({ success: false, error: 'Candidate ID and status are required' }, { status: 400 });
    }

    const validStatuses = ['new', 'reviewed', 'shortlisted', 'interview', 'rejected'];
    
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: `Status must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 });
    }

    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      // For testing purposes, allow hardcoded IDs that start with "app-"
      if (candidateId.startsWith('app-')) {
        return NextResponse.json({
          success: true,
          message: 'Status updated (hardcoded data)',
          application: {
            id: candidateId,
            status: status
          }
        });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid candidate ID format' 
      }, { status: 400 });
    }

    // Update the application in the database
    const updatedApplication = await Application.findByIdAndUpdate(
      candidateId,
      { status: status },
      { new: true } // Return the updated document
    ).populate([
      { path: 'student', populate: { path: 'user' } },
      { path: 'job' }
    ]);

    if (!updatedApplication) {
      return NextResponse.json({ 
        success: false, 
        error: 'Application not found' 
      }, { status: 404 });
    }

    // Prepare candidate data for socket update
    const candidateData = {
      id: updatedApplication._id.toString(),
      name: updatedApplication.student?.user?.name || 'Unknown',
      email: updatedApplication.student?.user?.email || 'unknown@example.com',
      status: updatedApplication.status,
      appliedAt: updatedApplication.appliedAt,
      jobTitle: updatedApplication.job?.title || 'Unknown Position',
      jobId: updatedApplication.job?._id.toString(),
      recruiterId: updatedApplication.job?.recruiter?.toString(),
      resumeUrl: updatedApplication.student?.resumeUrl,
    };

    // Emit socket event for real-time updates
    try {
      emitCandidateUpdate(candidateData);
    } catch (socketError) {
      console.error('Socket event emission error:', socketError);
      // Continue even if socket event fails
    }

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      application: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update application status' 
    }, { status: 500 });
  }
} 