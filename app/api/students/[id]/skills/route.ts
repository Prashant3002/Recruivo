import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Student, StudentSkill, Skill } from '@/lib/models';
import { withAuth } from '@/lib/auth';

// Get student skills
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
    
    // Get student skills with populated skill data
    const studentSkills = await StudentSkill.find({ student: id })
      .populate('skill')
      .sort({ proficiencyLevel: -1, createdAt: -1 });
    
    return NextResponse.json({ skills: studentSkills });
  } catch (error: any) {
    console.error('Get student skills error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get student skills' },
      { status: 500 }
    );
  }
}

// Add skill to student (protected, only self or admin)
export const POST = withAuth(
  async (req: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      await dbConnect();
      
      const { id } = params;
      const body = await req.json();
      
      // Validate student
      const student = await Student.findById(id).populate('user');
      if (!student) {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        );
      }
      
      // Check authorization (only self or admin can add skills)
      if (
        user.role !== 'admin' &&
        (student.user as any)._id.toString() !== user.userId
      ) {
        return NextResponse.json(
          { error: 'Not authorized to add skills for this student' },
          { status: 403 }
        );
      }
      
      // Validate skill exists
      let skill = await Skill.findById(body.skill);
      
      // If skill doesn't exist and name is provided, create it
      if (!skill && body.skillName) {
        skill = await Skill.create({
          name: body.skillName,
          category: body.category || 'other',
          verified: false
        });
      }
      
      if (!skill) {
        return NextResponse.json(
          { error: 'Skill not found or invalid' },
          { status: 400 }
        );
      }
      
      // Create or update student skill
      const studentSkill = await StudentSkill.findOneAndUpdate(
        { student: id, skill: skill._id },
        {
          proficiencyLevel: body.proficiencyLevel || 'beginner',
          yearsOfExperience: body.yearsOfExperience || 0,
          verified: false // Only admins can verify skills separately
        },
        { upsert: true, new: true }
      ).populate('skill');
      
      return NextResponse.json({ skill: studentSkill }, { status: 201 });
    } catch (error: any) {
      console.error('Add student skill error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to add student skill' },
        { status: 500 }
      );
    }
  },
  ['student', 'admin']
); 