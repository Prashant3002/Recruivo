import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { google } from 'googleapis';
import path from 'path';

// Helper function to extract file ID from Google Drive URL
function extractFileId(url: string): string | null {
  // Match patterns like /d/FILE_ID/ or /file/d/FILE_ID/
  const matches = url.match(/\/d\/([^/]+)\/|\/file\/d\/([^/]+)\//);
  return matches ? (matches[1] || matches[2]) : null;
}

export async function DELETE(req: NextRequest) {
  try {
    console.log('Resume delete - received request');
    
    // Connect to database
    console.log('Resume delete - connecting to database');
    await dbConnect();
    console.log('Resume delete - database connected');
    
    // Import models
    const { Student, Resume } = await import('@/lib/models');
    
    // Get session for authenticated users, but don't require it
    const session = await getServerSession(authOptions);
    
    console.log('Resume delete - session check:', session ? 'Session exists' : 'No session found');
    
    // FOR DEMO PURPOSES: directly find a student without auth check
    console.log('Resume delete - finding a student (bypass auth for demo)');
    const student = await Student.findOne();
    
    if (!student) {
      console.error('No student profile found in database');
      return NextResponse.json(
        { error: 'No student profile found in database' },
        { status: 404 }
      );
    }
    
    console.log('Found student profile for demo:', student._id);
    
    // Find active resume to get its URL
    const activeResume = await Resume.findOne({ 
      student: student._id,
      isActive: true
    });
    
    if (activeResume && activeResume.url) {
      // Check if this is a Google Drive URL
      const fileId = extractFileId(activeResume.url);
      
      if (fileId) {
        try {
          console.log(`Attempting to delete file from Google Drive, ID: ${fileId}`);
          
          // Get credentials path from environment
          const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
          
          // Create a new auth client
          const auth = new google.auth.GoogleAuth({
            keyFile: path.resolve(process.cwd(), keyFilePath),
            scopes: ['https://www.googleapis.com/auth/drive']
          });
          
          // Create drive client
          const drive = google.drive({ version: 'v3', auth });
          
          // Delete the file
          await drive.files.delete({
            fileId: fileId
          });
          
          console.log('File deleted from Google Drive successfully');
        } catch (driveError) {
          console.error('Failed to delete file from Google Drive:', driveError);
          // Continue with database cleanup even if Drive deletion fails
        }
      }
    }
    
    // Delete all resumes for this student
    console.log(`Deleting all resumes for student: ${student._id}`);
    await Resume.deleteMany({ student: student._id });
    
    // Update student record to remove resume URL
    console.log(`Updating student record to remove resume URL`);
    await Student.findByIdAndUpdate(student._id, { resumeUrl: null });
    
    console.log('Resume deleted successfully');
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting resume:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete resume' },
      { status: 500 }
    );
  }
} 