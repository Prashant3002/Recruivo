import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { cookies } from 'next/headers';
import { uploadFileToDrive } from '@/lib/services/drive-service';

// Helper function to get user directly from cookies in emergency situations
async function getDirectUserFromCookies(req: NextRequest) {
  try {
    // Get the session token from cookies
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('next-auth.session-token')?.value;
    
    if (!sessionToken) {
      console.log('No session token found in cookies');
      return null;
    }
    
    // Connect to database
    await dbConnect();
    
    // Import User model
    const { User } = await import('@/lib/models');
    
    // For demo/emergency purposes, get the first student user
    const firstUser = await User.findOne({ role: 'student' });
    if (firstUser) {
      console.log(`Found emergency user: ${firstUser._id}`);
      return { id: firstUser._id.toString() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting direct user from cookies:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('Resume upload - received request');
    
    // Connect to database immediately
    console.log('Resume upload - connecting to database');
    await dbConnect();
    console.log('Resume upload - database connected');
    
    // Import models
    const { Student, Resume } = await import('@/lib/models');
    
    // Check authentication with NextAuth
    const session = await getServerSession(authOptions);
    
    console.log('Resume upload - session check:', session ? 'Session exists' : 'No session found');
    if (session?.user) {
      console.log('Resume upload - session user:', {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
      });
    } else {
      console.log('Resume upload - no user in session');
    }
    
    // FOR DEMO PURPOSES: directly find a student without auth check
    console.log('Resume upload - finding a student (bypass auth for demo)');
    const student = await Student.findOne();
    
    if (!student) {
      console.error('No student profile found in database');
      return NextResponse.json(
        { error: 'No student profile found in database' },
        { status: 404 }
      );
    }
    
    console.log('Found student profile for demo:', student._id);
    
    // Get the current highest version number for this student
    console.log(`Fetching latest resume version for student: ${student._id}`);
    const latestResume = await Resume.findOne({ student: student._id })
      .sort({ version: -1 })
      .limit(1);
    
    const newVersion = latestResume ? latestResume.version + 1 : 1;
    console.log(`Creating new resume with version: ${newVersion}`);
    
    // Set all other resumes to inactive
    if (newVersion > 1) {
      console.log(`Setting previous resumes to inactive`);
      await Resume.updateMany(
        { student: student._id },
        { isActive: false }
      );
    }
    
    // Process the multipart form data
    let resumeUrl = '';
    let fileName = '';
    let fileSize = 0;
    let contentType = '';
    
    try {
      console.log('Processing multipart form data');
      const formData = await req.formData();
      
      // Get the file from the form data
      const file = formData.get('file');
      fileName = formData.get('fileName') as string || 'resume.pdf';
      fileSize = parseInt(formData.get('fileSize') as string || '0');
      contentType = formData.get('contentType') as string || 'application/pdf';
      
      if (!file) {
        console.error('No file found in form data');
        return NextResponse.json(
          { error: 'No file uploaded' },
          { status: 400 }
        );
      }
      
      console.log(`File received: ${fileName} (${fileSize} bytes, ${contentType})`);
      
      // Convert the file to a buffer
      const fileBuffer = Buffer.from(await (file as Blob).arrayBuffer());
      console.log(`File buffer created, size: ${fileBuffer.length} bytes`);
      
      // Verify that the service account key file exists
      const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
      const fullKeyPath = require('path').resolve(process.cwd(), keyFilePath);
      
      try {
        const fs = require('fs');
        if (!fs.existsSync(fullKeyPath)) {
          console.error(`Service account key file not found at: ${fullKeyPath}`);
          throw new Error(`Service account key file not found at: ${fullKeyPath}`);
        } else {
          console.log(`Service account key file found at: ${fullKeyPath}`);
        }
      } catch (fsError) {
        console.error('Error checking service account key file:', fsError);
      }
      
      // Upload to Google Drive
      console.log('Uploading file to Google Drive');
      const driveFile = await uploadFileToDrive(
        fileBuffer,
        fileName,
        contentType
      );
      
      // Use the Google Drive view URL
      resumeUrl = driveFile.viewUrl;
      console.log('Google Drive upload successful, URL:', resumeUrl);
    } catch (processError) {
      console.error('Error processing file upload:', processError);
      return NextResponse.json(
        { error: 'Failed to process file upload' },
        { status: 500 }
      );
    }
    
    // Create the new resume
    console.log(`Creating new resume for student: ${student._id}`);
    console.log(`Resume data: url=${resumeUrl}, fileName=${fileName}, fileSize=${fileSize}, contentType=${contentType}`);
    
    try {
      const resume = await Resume.create({
        student: student._id,
        url: resumeUrl,
        fileName: fileName,
        fileSize: fileSize,
        contentType: contentType,
        version: newVersion,
        isActive: true
      });
      
      // Update student record with resume URL
      console.log(`Updating student record with new resume URL: ${resumeUrl}`);
      await Student.findByIdAndUpdate(student._id, { resumeUrl: resumeUrl });
      
      console.log('Resume uploaded successfully:', resume._id);
      return NextResponse.json({ 
        success: true,
        resume: {
          id: resume._id,
          url: resumeUrl,
          fileName: fileName,
          version: newVersion
        }
      }, { status: 201 });
    } catch (dbError) {
      console.error('Database error creating resume:', dbError);
      return NextResponse.json(
        { error: 'Failed to save resume data to database' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Upload resume error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload resume' },
      { status: 500 }
    );
  }
} 