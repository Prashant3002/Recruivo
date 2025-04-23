import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    console.log('Profile API - received request');
    
    // Connect to database
    console.log('Profile API - connecting to database');
    await dbConnect();
    console.log('Profile API - database connected');
    
    // Import Student model dynamically to avoid circular dependencies
    const { Student } = await import('@/lib/models');
    
    // Get session for authenticated users, but don't require it
    const session = await getServerSession(authOptions);
    
    console.log('Profile API - session check:', session ? 'Session exists' : 'No session found');
    
    let student;
    
    if (session?.user) {
      // If authenticated, find student associated with the current user
      console.log(`Profile API - finding student with user ID: ${session.user.id}`);
      student = await Student.findOne({ user: session.user.id }).lean();
    }
    
    // If no session or no student found, get first student (FOR DEMO PURPOSES)
    if (!student) {
      console.log('Profile API - no user in session or student not found, using demo student');
      student = await Student.findOne().lean();
      
      if (!student) {
        return NextResponse.json(
          { error: 'No student profiles found in database' },
          { status: 404 }
        );
      }
      
      console.log('Profile API - using demo student:', student._id);
    }
    
    // Return all student profile fields
    return NextResponse.json({
      student: {
        _id: student._id.toString(),
        user: student.user.toString(),
        university: student.university,
        degree: student.degree,
        branch: student.branch,
        graduationYear: student.graduationYear,
        resumeUrl: student.resumeUrl || null,
        resumeScore: student.resumeScore,
        skills: student.skills || [],
        experience: student.experience || [],
        projects: student.projects || [],
        status: student.status,
        matchScore: student.matchScore,
        phone: student.phone || '',
        bio: student.bio || '',
        rollNumber: student.rollNumber || '',
        cgpa: student.cgpa,
        class10Percentage: student.class10Percentage,
        class12Percentage: student.class12Percentage,
        careerObjective: student.careerObjective || '',
        linkedin: student.linkedin || '',
        github: student.github || '',
        portfolio: student.portfolio || '',
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch student profile' },
      { status: 500 }
    );
  }
}

// Update student profile
export async function PUT(req: NextRequest) {
  try {
    console.log('Profile API - received PUT request');
    
    // Connect to database
    console.log('Profile API - connecting to database');
    await dbConnect();
    console.log('Profile API - database connected');
    
    // Import models dynamically
    const { Student } = await import('@/lib/models');
    const { User } = await import('@/lib/models/userModel');
    
    // Get session for authenticated users
    const session = await getServerSession(authOptions);
    console.log('Profile API - session check:', session ? 'Session exists' : 'No session found');
    
    let userId;
    
    if (session?.user) {
      userId = session.user.id;
    } else {
      // For demo purposes, find first student
      console.log('Profile API - no user in session, using demo student');
      const demoStudent = await Student.findOne().lean();
      
      if (!demoStudent) {
        return NextResponse.json(
          { error: 'No student profiles found in database' },
          { status: 404 }
        );
      }
      
      userId = demoStudent.user;
      console.log('Profile API - using demo student with user ID:', userId);
    }
    
    // Get request body
    const body = await req.json();
    console.log('Profile API - received full body:', body);
    
    const { 
      firstName, 
      lastName, 
      email, 
      university, 
      degree, 
      branch,
      graduationYear, 
      skills, 
      phone, 
      bio, 
      linkedin, 
      github, 
      portfolio,
      careerObjective,
      rollNumber,
      cgpa,
      class10Percentage,
      class12Percentage
    } = body;
    
    console.log('Profile API - extracted fields:');
    console.log('- firstName:', firstName);
    console.log('- lastName:', lastName);
    console.log('- email:', email);
    console.log('- university:', university);
    console.log('- degree:', degree);
    console.log('- branch:', branch);
    console.log('- graduationYear:', graduationYear);
    console.log('- phone:', phone);
    console.log('- bio:', bio);
    console.log('- rollNumber:', rollNumber);
    console.log('- cgpa:', cgpa);
    console.log('- class10Percentage:', class10Percentage);
    console.log('- class12Percentage:', class12Percentage);
    console.log('- careerObjective:', careerObjective);
    
    // Validate required fields
    if (!university || !degree || !graduationYear) {
      console.log('Profile API - validation failed: missing required fields');
      return NextResponse.json(
        { error: "University, degree, and graduation year are required" },
        { status: 400 }
      );
    }
    
    // Create update data with proper types
    const updateData = {
      university: university || '',
      degree: degree || '',
      branch: branch || '',
      graduationYear: Number(graduationYear) || 0,
      skills: skills || [],
      phone: phone || '',
      bio: bio || '',
      linkedin: linkedin || '',
      github: github || '',
      portfolio: portfolio || '',
      careerObjective: careerObjective || '',
      rollNumber: rollNumber || '',
      cgpa: cgpa !== undefined ? Number(cgpa) : null,
      class10Percentage: class10Percentage !== undefined ? Number(class10Percentage) : null,
      class12Percentage: class12Percentage !== undefined ? Number(class12Percentage) : null,
    };
    
    console.log('Profile API - updating student with data:', JSON.stringify(updateData));
    
    // Direct MongoDB update approach
    try {
      // Get the MongoDB collection directly
      const db = mongoose.connection.db;
      const studentsCollection = db.collection('students');
      
      // Find the student document to update
      const studentToUpdate = await studentsCollection.findOne({ user: new mongoose.Types.ObjectId(userId) });
      
      if (!studentToUpdate) {
        // Create new student document if it doesn't exist
        const newStudent = {
          user: new mongoose.Types.ObjectId(userId),
          university: updateData.university,
          degree: updateData.degree,
          branch: updateData.branch,
          graduationYear: updateData.graduationYear,
          skills: updateData.skills,
          phone: updateData.phone,
          bio: updateData.bio,
          linkedin: updateData.linkedin,
          github: updateData.github,
          portfolio: updateData.portfolio,
          careerObjective: updateData.careerObjective,
          rollNumber: updateData.rollNumber,
          cgpa: updateData.cgpa,
          class10Percentage: updateData.class10Percentage,
          class12Percentage: updateData.class12Percentage,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await studentsCollection.insertOne(newStudent);
        console.log('Profile API - created new student document:', result.insertedId);
      } else {
        // Update existing student document
        const result = await studentsCollection.updateOne(
          { user: new mongoose.Types.ObjectId(userId) },
          { 
            $set: {
              university: updateData.university,
              degree: updateData.degree,
              branch: updateData.branch,
              graduationYear: updateData.graduationYear,
              skills: updateData.skills,
              phone: updateData.phone,
              bio: updateData.bio,
              linkedin: updateData.linkedin,
              github: updateData.github,
              portfolio: updateData.portfolio,
              careerObjective: updateData.careerObjective,
              rollNumber: updateData.rollNumber,
              cgpa: updateData.cgpa,
              class10Percentage: updateData.class10Percentage,
              class12Percentage: updateData.class12Percentage,
              updatedAt: new Date()
            } 
          }
        );
        
        console.log('Profile API - updated student document:', result.modifiedCount, 'document(s) modified');
      }
      
      // Verify the update by fetching the document again
      const updatedStudent = await studentsCollection.findOne({ user: new mongoose.Types.ObjectId(userId) });
      
      console.log('Profile API - student after update:');
      console.log('- university:', updatedStudent.university);
      console.log('- degree:', updatedStudent.degree);
      console.log('- branch:', updatedStudent.branch);
      console.log('- graduationYear:', updatedStudent.graduationYear);
      console.log('- phone:', updatedStudent.phone);
      console.log('- bio:', updatedStudent.bio);
      console.log('- rollNumber:', updatedStudent.rollNumber);
      console.log('- cgpa:', updatedStudent.cgpa);
      console.log('- class10Percentage:', updatedStudent.class10Percentage);
      console.log('- class12Percentage:', updatedStudent.class12Percentage);
      console.log('- careerObjective:', updatedStudent.careerObjective);
    } catch (dbError) {
      console.error('Profile API - MongoDB direct update failed:', dbError);
      throw dbError;
    }
    
    // Also update the user's name and email if provided
    if (firstName || lastName || email) {
      const updateFields: any = {};
      if (firstName && lastName) updateFields.name = `${firstName} ${lastName}`;
      if (email) updateFields.email = email;
      
      console.log('Profile API - updating user data:', JSON.stringify(updateFields));
      await User.findByIdAndUpdate(userId, updateFields);
    }
    
    return NextResponse.json({
      message: "Student profile updated successfully",
      student: await Student.findOne({ user: userId })
    });
  } catch (error: any) {
    console.error('Error updating student profile:', error);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update student profile" },
      { status: 500 }
    );
  }
} 