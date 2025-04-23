import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Student, Resume } from '@/lib/models';
import { withAuth } from '@/lib/auth';

// Get a specific resume
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; resumeId: string } }
) {
  try {
    await dbConnect();
    
    const { id, resumeId } = params;
    
    // Find the resume
    const resume = await Resume.findOne({
      _id: resumeId,
      student: id
    });
    
    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ resume });
  } catch (error: any) {
    console.error('Get resume error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get resume' },
      { status: 500 }
    );
  }
}

// Set a resume as active (protected, only self or admin)
export const PATCH = withAuth(
  async (req: NextRequest, user, { params }: { params: { id: string; resumeId: string } }) => {
    try {
      await dbConnect();
      
      const { id, resumeId } = params;
      const body = await req.json();
      
      // Validate student
      const student = await Student.findById(id).populate('user');
      if (!student) {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        );
      }
      
      // Check authorization (only self or admin can modify resumes)
      if (
        user.role !== 'admin' &&
        (student.user as any)._id.toString() !== user.userId
      ) {
        return NextResponse.json(
          { error: 'Not authorized to modify resumes for this student' },
          { status: 403 }
        );
      }
      
      // Find resume
      const resume = await Resume.findOne({
        _id: resumeId,
        student: id
      });
      
      if (!resume) {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        );
      }
      
      // If setting as active, deactivate all other resumes
      if (body.isActive === true) {
        await Resume.updateMany(
          { 
            student: id,
            _id: { $ne: resumeId } 
          },
          { isActive: false }
        );
        
        // Update student record with this resume's URL
        await Student.findByIdAndUpdate(id, { resumeUrl: resume.url });
      }
      
      // Update resume
      const updatedResume = await Resume.findByIdAndUpdate(
        resumeId,
        { 
          isActive: body.isActive,
          // Allow updating parsed data if provided
          ...(body.parsedData && { parsedData: body.parsedData }),
          // Allow updating score and feedback if admin
          ...(user.role === 'admin' && { 
            score: body.score, 
            feedback: body.feedback 
          })
        },
        { new: true, runValidators: true }
      );
      
      return NextResponse.json({ resume: updatedResume });
    } catch (error: any) {
      console.error('Update resume error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update resume' },
        { status: 500 }
      );
    }
  },
  ['student', 'admin']
);

// Delete a resume (protected, only self or admin)
export const DELETE = withAuth(
  async (req: NextRequest, user, { params }: { params: { id: string; resumeId: string } }) => {
    try {
      await dbConnect();
      
      const { id, resumeId } = params;
      
      // Validate student
      const student = await Student.findById(id).populate('user');
      if (!student) {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        );
      }
      
      // Check authorization (only self or admin can delete resumes)
      if (
        user.role !== 'admin' &&
        (student.user as any)._id.toString() !== user.userId
      ) {
        return NextResponse.json(
          { error: 'Not authorized to delete resumes for this student' },
          { status: 403 }
        );
      }
      
      // Find resume
      const resume = await Resume.findOne({
        _id: resumeId,
        student: id
      });
      
      if (!resume) {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        );
      }
      
      // If this is the active resume, we need to update the student record
      if (resume.isActive) {
        // Find the next most recent resume
        const nextResume = await Resume.findOne({
          student: id,
          _id: { $ne: resumeId }
        }).sort({ version: -1 }).limit(1);
        
        if (nextResume) {
          // Set the next resume as active
          await Resume.findByIdAndUpdate(nextResume._id, { isActive: true });
          
          // Update student record with this resume's URL
          await Student.findByIdAndUpdate(id, { resumeUrl: nextResume.url });
        } else {
          // No other resumes, clear the URL
          await Student.findByIdAndUpdate(id, { resumeUrl: null });
        }
      }
      
      // Delete the resume
      await Resume.findByIdAndDelete(resumeId);
      
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error('Delete resume error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete resume' },
        { status: 500 }
      );
    }
  },
  ['student', 'admin']
); 