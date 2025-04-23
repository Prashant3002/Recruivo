import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Student, Resume } from '@/lib/models';
import { withAuth } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

// Get student's resumes
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // Verify student exists
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }
    
    // Get all resumes for the student, sorted by version (latest first)
    const resumes = await Resume.find({ student: id })
      .sort({ version: -1, uploadedAt: -1 });
    
    return NextResponse.json({ resumes });
  } catch (error: any) {
    console.error('Get student resumes error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get student resumes' },
      { status: 500 }
    );
  }
}

// Upload a new resume
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication with NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.error('Authentication required for resume upload');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.log('Resume upload - session:', JSON.stringify(session, null, 2));
    console.log('Resume upload - params:', params);
    
    await dbConnect();
    
    const { id } = params;
    
    // Validate student
    const student = await Student.findById(id);
    if (!student) {
      console.error(`Student not found with ID: ${id}`);
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }
    
    // Check authorization (only self or admin can upload resumes)
    // Fetch user associated with the student
    const studentUser = await (await import('@/lib/models')).User.findById(student.user);
    
    if (!studentUser) {
      console.error(`User not found for student ID: ${id}`);
      return NextResponse.json(
        { error: 'Student user not found' },
        { status: 404 }
      );
    }
    
    const isAdmin = session.user.role === 'admin';
    const isSelf = studentUser.email === session.user.email;
    
    if (!isAdmin && !isSelf) {
      console.error('Unauthorized upload attempt - not self or admin');
      return NextResponse.json(
        { error: 'Not authorized to upload resume for this student' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const bodyText = await req.text();
    console.log('Resume upload - request body:', bodyText);
    
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!body.url || !body.fileName || !body.fileSize || !body.contentType) {
      console.error('Missing required resume information:', body);
      return NextResponse.json(
        { error: 'Missing required resume information' },
        { status: 400 }
      );
    }
    
    // Get the current highest version number for this student
    const latestResume = await Resume.findOne({ student: id })
      .sort({ version: -1 })
      .limit(1);
    
    const newVersion = latestResume ? latestResume.version + 1 : 1;
    
    // Set all other resumes to inactive
    if (newVersion > 1) {
      await Resume.updateMany(
        { student: id },
        { isActive: false }
      );
    }
    
    // Create the new resume
    const resume = await Resume.create({
      student: id,
      url: body.url,
      fileName: body.fileName,
      fileSize: body.fileSize,
      contentType: body.contentType,
      version: newVersion,
      isActive: true,
      parsedData: body.parsedData || {} // Optional parsed data from resume
    });
    
    // Update student record with resume URL
    await Student.findByIdAndUpdate(id, { resumeUrl: body.url });
    
    console.log('Resume uploaded successfully:', resume);
    return NextResponse.json({ resume }, { status: 201 });
  } catch (error: any) {
    console.error('Upload resume error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload resume' },
      { status: 500 }
    );
  }
} 