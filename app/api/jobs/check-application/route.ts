import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase/firestore";
import { query, collection, where, getDocs } from "firebase/firestore";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = session.user;
    if (!user || !user.email) {
      return NextResponse.json(
        { error: "User authentication failed" },
        { status: 401 }
      );
    }

    // Query the applications collection to check if this student has already applied
    const studentsRef = collection(db, "students");
    const studentQuery = query(studentsRef, where("email", "==", user.email));
    const studentSnap = await getDocs(studentQuery);

    if (studentSnap.empty) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const studentDoc = studentSnap.docs[0];
    const studentId = studentDoc.id;

    // Check if student has already applied for this job
    const applicationsRef = collection(db, "applications");
    const applicationQuery = query(
      applicationsRef,
      where("studentId", "==", studentId),
      where("jobId", "==", jobId)
    );

    const querySnapshot = await getDocs(applicationQuery);
    const hasApplied = !querySnapshot.empty;

    return NextResponse.json({
      hasApplied,
      applicationId: hasApplied ? querySnapshot.docs[0].id : null,
      status: hasApplied ? querySnapshot.docs[0].data().status : null
    });
  } catch (error: any) {
    console.error("Error checking job application:", error);
    return NextResponse.json(
      { error: "Failed to check application status" },
      { status: 500 }
    );
  }
} 