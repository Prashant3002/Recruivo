import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Company } from '@/lib/models';
import { withAuth } from '@/lib/auth';

// Get all companies
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search');
    const industry = searchParams.get('industry');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Build filter object
    const filter: any = {};
    
    // Add optional filters
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
    if (industry) {
      filter.industry = industry;
    }
    
    if (status) {
      filter.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get companies with pagination
    const companies = await Company.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Company.countDocuments(filter);
    
    return NextResponse.json({
      companies,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error: any) {
    console.error('Get companies error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get companies' },
      { status: 500 }
    );
  }
}

// Create a new company (protected, only recruiters and admins can create companies)
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    if (user.role !== 'recruiter' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only recruiters and admins can create companies' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const body = await req.json();
    
    // Validate required fields
    const { name, industry, description, location } = body;
    if (!name || !industry || !description || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if company with same name already exists
    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return NextResponse.json(
        { error: 'A company with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create company
    const company = await Company.create({
      ...body,
      verified: user.role === 'admin', // Only companies created by admins are auto-verified
      status: user.role === 'admin' ? 'active' : 'pending',
    });
    
    return NextResponse.json({ company }, { status: 201 });
  } catch (error: any) {
    console.error('Create company error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create company' },
      { status: 500 }
    );
  }
}, ['recruiter', 'admin']); 