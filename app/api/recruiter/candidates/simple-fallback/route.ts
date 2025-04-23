import { NextRequest, NextResponse } from 'next/server';

// Add no-cache headers to prevent caching
function addNoCacheHeaders(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');
  return response;
}

// Generate fake candidates data
function generateCandidates(count: number) {
  const statuses = ['pending', 'reviewed', 'shortlisted', 'interviewed', 'rejected'];
  const skills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C#', 
    'Angular', 'Vue.js', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
    'HTML', 'CSS', 'SASS', 'Redux', 'GraphQL', 'REST API', 'PHP', 'Laravel',
    'Next.js', 'Express', 'Git', 'CI/CD', 'TDD'
  ];
  const jobTitles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Mobile Developer', 'DevOps Engineer', 'QA Engineer', 'Data Scientist',
    'UI/UX Designer', 'Product Manager', 'Project Manager'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const randomSkills = [...new Set(Array.from(
      { length: Math.floor(Math.random() * 5) + 2 }, 
      () => skills[Math.floor(Math.random() * skills.length)]
    ))];
    
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
    
    return {
      _id: `candidate-${i + 1}`,
      id: `candidate-${i + 1}`,
      name: `Test Candidate ${i + 1}`,
      email: `candidate${i + 1}@example.com`,
      jobTitle: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      appliedAt: randomDate.toISOString(),
      matchScore: Math.floor(Math.random() * 30) + 70, // 70-100
      resumeScore: Math.floor(Math.random() * 30) + 70, // 70-100
      skills: randomSkills,
      studentName: `Test Candidate ${i + 1}`,
      studentEmail: `candidate${i + 1}@example.com`,
      resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    };
  });
}

// Generate jobs for filter
function generateJobs(count: number) {
  const jobTitles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Mobile Developer', 'DevOps Engineer', 'QA Engineer', 'Data Scientist',
    'UI/UX Designer', 'Product Manager', 'Project Manager'
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    _id: `job-${i + 1}`,
    title: jobTitles[i % jobTitles.length],
    company: 'Example Corp',
    location: 'Remote'
  }));
}

export async function GET(request: NextRequest) {
  // Add timestamp to ensure unique responses
  const timestamp = Date.now();
  console.log(`[${new Date(timestamp).toISOString()}] Simple candidates polling request received`);
  
  try {
    // Parse query parameters 
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const jobId = searchParams.get('jobId') || '';
    
    console.log(`Query params - status: ${status}, search: ${search}, jobId: ${jobId}`);
    
    // Generate fake data
    let candidates = generateCandidates(15);
    
    // Apply filters if provided
    if (status && status !== 'all') {
      candidates = candidates.filter(c => c.status === status);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      candidates = candidates.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }
    
    // Generate jobs
    const jobs = generateJobs(8);
    
    // Return successful response with no-cache headers
    return addNoCacheHeaders(NextResponse.json({
      success: true,
      data: {
        candidates,
        total: candidates.length,
        page: 1,
        limit: 15,
        totalPages: 1,
        jobs
      },
      message: "Successfully retrieved candidates from simple fallback",
      timestamp
    }));
    
  } catch (error) {
    console.error('Error in simple fallback:', error);
    
    // Even on error, return some data to ensure the UI works
    const candidates = generateCandidates(5);
    const jobs = generateJobs(3);
    
    // Return error response with no-cache headers
    return addNoCacheHeaders(NextResponse.json({
      success: false,
      data: {
        candidates,
        total: candidates.length,
        page: 1,
        limit: 15,
        totalPages: 1,
        jobs
      },
      error: error instanceof Error ? error.message : 'Unknown error in simple fallback',
      message: "Error occurred but returning some fallback data",
      timestamp
    }));
  }
} 