import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Skill } from '@/lib/models';
import { withAuth } from '@/lib/auth';

// Get single skill by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    const skill = await Skill.findById(id);
    
    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ skill });
  } catch (error: any) {
    console.error('Get skill error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get skill' },
      { status: 500 }
    );
  }
}

// Update skill (protected, only admin can update)
export const PUT = withAuth(
  async (req: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      await dbConnect();
      
      const { id } = params;
      const body = await req.json();
      
      // Find skill
      const skill = await Skill.findById(id);
      
      if (!skill) {
        return NextResponse.json(
          { error: 'Skill not found' },
          { status: 404 }
        );
      }
      
      // Update skill
      const updatedSkill = await Skill.findByIdAndUpdate(
        id,
        { ...body },
        { new: true, runValidators: true }
      );
      
      return NextResponse.json({ skill: updatedSkill });
    } catch (error: any) {
      console.error('Update skill error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update skill' },
        { status: 500 }
      );
    }
  },
  ['admin']
);

// Delete skill (protected, only admin can delete)
export const DELETE = withAuth(
  async (req: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      await dbConnect();
      
      const { id } = params;
      
      // Find skill
      const skill = await Skill.findById(id);
      
      if (!skill) {
        return NextResponse.json(
          { error: 'Skill not found' },
          { status: 404 }
        );
      }
      
      // Delete skill
      await Skill.findByIdAndDelete(id);
      
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error('Delete skill error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete skill' },
        { status: 500 }
      );
    }
  },
  ['admin']
); 