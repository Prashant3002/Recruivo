import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/mongodb"
import Application from "@/lib/models/applicationModel"
import Job from "@/lib/models/jobModel"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "student") {
      return NextResponse.json(
        { error: "Unauthorized - Only students can apply for jobs" },
        { status: 401 }
      )
    }

    await connectToDatabase()

    // Check if job exists and is open
    const job = await Job.findById(params.id)
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    if (job.status !== "open") {
      return NextResponse.json(
        { error: "This job is not accepting applications" },
        { status: 400 }
      )
    }

    // Check if student has already applied
    const existingApplication = await Application.findOne({
      job: params.id,
      student: session.user.id
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this job" },
        { status: 400 }
      )
    }

    // Create new application
    const application = await Application.create({
      job: params.id,
      student: session.user.id,
      status: "pending"
    })

    // Increment job application count
    await Job.findByIdAndUpdate(params.id, {
      $inc: { applicationCount: 1 }
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error("Error applying for job:", error)
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    )
  }
} 