import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Skill } from '@/lib/models';
import { withAuth } from '@/lib/auth';

// Get all skills or search skills
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get query parameters
    const url = new URL(req.url);
    const query = url.searchParams.get('query') || '';
    const category = url.searchParams.get('category') || '';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    // Build filter
    const filter: any = {};
    
    if (query) {
      filter.$text = { $search: query };
    }
    
    if (category) {
      filter.category = category;
    }
    
    // Find skills
    const skills = await Skill.find(filter)
      .sort({ popularityScore: -1 })
      .limit(limit);
    
    return NextResponse.json({ skills });
  } catch (error: any) {
    console.error('Get skills error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get skills' },
      { status: 500 }
    );
  }
}

// Create new skill (protected, admin only)
export const POST = withAuth(
  async (req: NextRequest, user) => {
    try {
      await dbConnect();
      
      // Only admin can create verified skills by default
      const body = await req.json();
      
      // If not admin, force verified to false
      if (user.role !== 'admin') {
        body.verified = false;
      }
      
      // Create skill
      const skill = await Skill.create(body);
      
      return NextResponse.json({ skill }, { status: 201 });
    } catch (error: any) {
      console.error('Create skill error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create skill' },
        { status: 500 }
      );
    }
  },
  ['admin', 'recruiter', 'student']
); 