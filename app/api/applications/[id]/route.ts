import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Application, Job } from '@/lib/models';
import { withAuth } from '@/lib/auth';
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

// Get application by ID
export const GET = withAuth(
  async (req: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      await dbConnect();
      
      const { id } = params;
      
      const session = await getServerSession(authOptions)
      if (!session) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }
      
      const application = await Application.findById(id)
        .populate('student', 'name email')
        .populate({
          path: 'job',
          select: 'title company recruiter',
          populate: {
            path: 'company',
            select: 'name logo'
          }
        });
      
      if (!application) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
      
      // Verify the user has permission to view this application
      if (session.user.role === "student" && application.student._id.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "Unauthorized - You can only view your own applications" },
          { status: 403 }
        )
      }
      
      if (session.user.role === "recruiter") {
        const job = application.job
        if (job.recruiter.toString() !== session.user.id) {
          return NextResponse.json(
            { error: "Unauthorized - You can only view applications for your jobs" },
            { status: 403 }
          )
        }
      }
      
      return NextResponse.json({ application });
    } catch (error: any) {
      console.error('Get application error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to get application' },
        { status: 500 }
      );
    }
  },
  ['student', 'recruiter', 'admin']
);

// Update application status (recruiter/admin only)
export const PATCH = withAuth(
  async (req: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session || session.user.role !== "recruiter") {
        return NextResponse.json(
          { error: "Unauthorized - Only recruiters can update application status" },
          { status: 401 }
        )
      }
      
      const { status } = await req.json()
      if (!status) {
        return NextResponse.json(
          { error: "Status is required" },
          { status: 400 }
        )
      }
      
      // Validate status value
      const validStatuses = ["pending", "reviewing", "shortlisted", "rejected", "accepted"]
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        )
      }
      
      await connectToDatabase()
      
      const application = await Application.findById(params.id).populate("job")
      if (!application) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        )
      }
      
      // Verify the recruiter owns the job
      const job = application.job
      if (job.recruiter.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "Unauthorized - You can only update applications for your jobs" },
          { status: 403 }
        )
      }
      
      // Update the application status
      application.status = status
      application.updatedAt = new Date()
      await application.save()
      
      return NextResponse.json({ application })
      
    } catch (error) {
      console.error("Error updating application:", error)
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      )
    }
  },
  ['recruiter', 'admin']
);

// Delete application (owner student or admin only)
export const DELETE = withAuth(
  async (req: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      await dbConnect();
      
      const { id } = params;
      
      const session = await getServerSession(authOptions)
      if (!session) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }
      
      // Find application
      const application = await Application.findById(id);
      
      if (!application) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
      
      // Verify the user has permission to delete this application
      if (session.user.role === "student" && application.student.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "Unauthorized - You can only delete your own applications" },
          { status: 403 }
        )
      }
      
      if (session.user.role === "recruiter") {
        const job = await Job.findById(application.job)
        if (!job || job.recruiter.toString() !== session.user.id) {
          return NextResponse.json(
            { error: "Unauthorized - You can only delete applications for your jobs" },
            { status: 403 }
          )
        }
      }
      
      // Delete application
      await Application.findByIdAndDelete(id);
      
      // Decrement application count on job
      await Job.findByIdAndUpdate(application.job, {
        $inc: { applicationCount: -1 },
      });
      
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error('Delete application error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete application' },
        { status: 500 }
      );
    }
  },
  ['student', 'admin']
); 