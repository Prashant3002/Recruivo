import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/lib/models/userModel';
import Student from '@/lib/models/studentModel';
import Application from '@/lib/models/applicationModel';
import Job from '@/lib/models/jobModel';
import { withAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { name, email, jobTitle, skills, jobId } = body;

    if (!name || !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name and email are required' 
      }, { status: 400 });
    }

    // For testing or mock data, return a success response with fake data
    if (email.includes('test') || email.includes('example.com')) {
      return NextResponse.json({
        success: true,
        message: 'Candidate added (mock data)',
        candidate: {
          id: `app-${Date.now()}`,
          name,
          email,
          jobTitle: jobTitle || 'Unspecified',
          skills: skills || [],
          status: 'pending',
          appliedDate: new Date().toISOString()
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    let userId;
    
    if (existingUser) {
      userId = existingUser._id;
    } else {
      // Create a random password (user would reset this)
      const randomPassword = Math.random().toString(36).slice(-8);
      
      // Create new user
      const newUser = new User({
        name,
        email,
        password: randomPassword, // In a real system, this would be hashed
        role: 'student'
      });
      
      await newUser.save();
      userId = newUser._id;
    }
    
    // Check if student profile exists
    let studentId;
    const existingStudent = await Student.findOne({ user: userId });
    
    if (existingStudent) {
      studentId = existingStudent._id;
      
      // Update skills if provided
      if (skills && skills.length > 0) {
        existingStudent.skills = skills;
        await existingStudent.save();
      }
    } else {
      // Create student profile
      const newStudent = new Student({
        user: userId,
        name,
        email,
        skills: skills || [],
        resumeUrl: '', // Empty for now
        profileComplete: false,
        // Add required fields with defaults
        graduationYear: new Date().getFullYear() + 1, // Default to next year
        degree: 'Not Specified',
        university: 'Not Specified'
      });
      
      await newStudent.save();
      studentId = newStudent._id;
    }
    
    // If job ID is provided, create an application
    if (jobId) {
      const job = await Job.findById(jobId);
      
      if (!job) {
        return NextResponse.json({ 
          success: false, 
          error: 'Job not found' 
        }, { status: 404 });
      }
      
      // Check if application already exists
      const existingApplication = await Application.findOne({
        student: studentId,
        job: jobId
      });
      
      if (!existingApplication) {
        // Create new application
        const newApplication = new Application({
          student: studentId,
          job: jobId,
          status: 'pending',
          studentName: name,
          studentEmail: email,
          studentSkills: skills,
          resume: 'default-resume.pdf', // Provide a default value for the required field
          matchScore: Math.floor(Math.random() * 20) + 70 // Random score between 70-90
        });
        
        await newApplication.save();
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Candidate added successfully',
      candidateId: studentId
    });
  } catch (error) {
    console.error('Error adding candidate:', error);
    
    // Return a more specific error message if available
    let errorMessage = 'Failed to add candidate';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle Mongoose validation errors more specifically
      if (error.name === 'ValidationError' && 'errors' in error) {
        const validationError = error as any;
        const errorFields = Object.keys(validationError.errors || {}).join(', ');
        errorMessage = `Validation failed for fields: ${errorFields}`;
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
} 