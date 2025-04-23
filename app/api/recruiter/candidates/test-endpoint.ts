import { NextRequest, NextResponse } from 'next/server';

// Create a simple fallback endpoint for testing
export async function GET(request: NextRequest) {
  console.log('Starting test candidates endpoint...');
  
  try {
    // Generate mock data without any database connection
    const mockCandidates = Array(5).fill(0).map((_, index) => ({
      id: `mock-${index}`,
      name: `Mock Candidate ${index + 1}`,
      email: `candidate${index + 1}@example.com`,
      avatar: '/placeholder.svg?height=40&width=40',
      jobTitle: 'Software Developer',
      company: 'Acme Inc',
      appliedDate: new Date(),
      status: ['pending', 'shortlisted', 'interview', 'rejected'][Math.floor(Math.random() * 4)],
      resumeScore: Math.floor(Math.random() * 20) + 80,
      matchScore: Math.floor(Math.random() * 30) + 70,
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Next.js'].slice(0, Math.floor(Math.random() * 5) + 1),
      experience: `${Math.floor(Math.random() * 8) + 1} years`,
      education: 'BS Computer Science, Example University',
      resume: 'mock-resume-url'
    }));
    
    return NextResponse.json({
      candidates: mockCandidates,
      count: mockCandidates.length,
      mock: true
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json({ 
      error: 'Test endpoint error', 
      details: error.message || 'Unknown error',
      mockData: true
    }, { status: 500 });
  }
} 