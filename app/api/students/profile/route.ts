import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { getCurrentUser } from "@/lib/auth";
import { Student } from "@/lib/models";
import { User } from "@/lib/models/userModel";
import mongoose from 'mongoose';

// Get current student profile
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Get the current user
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if the user is a student
    if (user.role !== "student") {
      return NextResponse.json(
        { error: "Access denied - only for students" },
        { status: 403 }
      );
    }

    // Find the student profile
    const student = await Student.findOne({ user: user.userId }).lean();
    
    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Get user data as well
    const userData = await User.findById(user.userId).select("-password").lean();

    // Return the student profile with all fields
    return NextResponse.json({
      student: {
        ...student,
        _id: student._id.toString(),
        user: userData ? {
          _id: userData._id.toString(),
          name: userData.name,
          email: userData.email,
          role: userData.role
        } : student.user.toString(),
        experience: student.experience || [],
        projects: student.projects || [],
        skills: student.skills || [],
        resumeUrl: student.resumeUrl || null,
        phone: student.phone || '',
        bio: student.bio || '',
        rollNumber: student.rollNumber || '',
        careerObjective: student.careerObjective || '',
        linkedin: student.linkedin || '',
        github: student.github || '',
        portfolio: student.portfolio || ''
      }
    });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch student profile" },
      { status: 500 }
    );
  }
}

// Update student profile
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    // Get the current user
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if the user is a student
    if (user.role !== "student") {
      return NextResponse.json(
        { error: "Access denied - only for students" },
        { status: 403 }
      );
    }

    // Get request body
    const body = await req.json();
    console.log('Students Profile API - received full body:', body);
    
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
    
    console.log('Students Profile API - extracted fields:');
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
    
    console.log('Students Profile API - updating student with data:', JSON.stringify(updateData));
    
    // Direct MongoDB update approach
    try {
      // Get the MongoDB collection directly
      const db = mongoose.connection.db;
      const studentsCollection = db.collection('students');
      
      // Find the student document to update
      const studentToUpdate = await studentsCollection.findOne({ user: new mongoose.Types.ObjectId(user.userId) });
      
      if (!studentToUpdate) {
        // Create new student document if it doesn't exist
        const newStudent = {
          user: new mongoose.Types.ObjectId(user.userId),
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
        console.log('Students Profile API - created new student document:', result.insertedId);
      } else {
        // Update existing student document
        const result = await studentsCollection.updateOne(
          { user: new mongoose.Types.ObjectId(user.userId) },
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
        
        console.log('Students Profile API - updated student document:', result.modifiedCount, 'document(s) modified');
      }
      
      // Verify the update by fetching the document again
      const updatedStudent = await studentsCollection.findOne({ user: new mongoose.Types.ObjectId(user.userId) });
      
      console.log('Students Profile API - student after update:');
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
      console.error('Students Profile API - MongoDB direct update failed:', dbError);
      throw dbError;
    }

    // Also update the user's name and email if provided
    if (firstName || lastName || email) {
      const updateFields: any = {};
      if (firstName && lastName) updateFields.name = `${firstName} ${lastName}`;
      if (email) updateFields.email = email;

      await User.findByIdAndUpdate(user.userId, updateFields);
    }

    return NextResponse.json({
      message: "Student profile updated successfully",
      student: await Student.findOne({ user: user.userId })
    });
  } catch (error) {
    console.error("Error updating student profile:", error);
    
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