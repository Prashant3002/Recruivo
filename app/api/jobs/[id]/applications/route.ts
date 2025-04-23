import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import Application from "@/lib/models/applicationModel"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    if (session.user.role !== "recruiter") {
      return NextResponse.json(
        { error: "Only recruiters can view job applications" },
        { status: 403 }
      )
    }
    
    await connectToDatabase()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const sort = searchParams.get("sort") || "-createdAt"
    
    // Build query
    const query: any = { job: params.id }
    if (status) {
      query.status = status
    }
    
    // Get total count for pagination
    const total = await Application.countDocuments(query)
    
    // Fetch applications with pagination and sorting
    const applications = await Application.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("student", "name email")
      .populate({
        path: "job",
        select: "title company",
        populate: {
          path: "recruiter",
          select: "name email",
          match: { _id: session.user.id }
        }
      })
    
    // Verify that the recruiter owns the job
    if (applications.length > 0 && !applications[0].job?.recruiter) {
      return NextResponse.json(
        { error: "Unauthorized to view applications for this job" },
        { status: 403 }
      )
    }
    
    return NextResponse.json({
      applications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 