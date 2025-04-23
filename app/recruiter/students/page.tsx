"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  User,
  Search,
  Filter,
  GraduationCap,
  FileText,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"
import RecruiterDashboardLayout from "@/components/recruiter-dashboard-layout"

// Mock data for students
const students = [
  {
    id: 1,
    name: "John Doe",
    university: "MIT",
    graduationYear: 2024,
    resumeScore: 95,
    matchScore: 92,
    appliedJobs: 3,
    status: "shortlisted",
    skills: ["React", "TypeScript", "Node.js"],
  },
  {
    id: 2,
    name: "Jane Smith",
    university: "Stanford",
    graduationYear: 2024,
    resumeScore: 88,
    matchScore: 85,
    appliedJobs: 2,
    status: "interview",
    skills: ["Python", "Machine Learning", "Data Analysis"],
  },
  {
    id: 3,
    name: "Mike Johnson",
    university: "UC Berkeley",
    graduationYear: 2025,
    resumeScore: 82,
    matchScore: 78,
    appliedJobs: 1,
    status: "new",
    skills: ["Java", "Spring Boot", "AWS"],
  },
  {
    id: 4,
    name: "Sarah Williams",
    university: "Harvard",
    graduationYear: 2024,
    resumeScore: 90,
    matchScore: 88,
    appliedJobs: 4,
    status: "rejected",
    skills: ["UI/UX", "Figma", "Product Design"],
  },
]

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [universityFilter, setUniversityFilter] = useState("all")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "shortlisted":
        return <Badge className="bg-green-100 text-green-800">Shortlisted</Badge>
      case "interview":
        return <Badge className="bg-blue-100 text-blue-800">Interview</Badge>
      case "new":
        return <Badge className="bg-yellow-100 text-yellow-800">New</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <RecruiterDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">
              Manage and track student applications and their progress
            </p>
          </div>
          <Button className="gap-2">
            <User className="h-4 w-4" />
            Add Student
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={universityFilter} onValueChange={setUniversityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="University" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Universities</SelectItem>
                <SelectItem value="mit">MIT</SelectItem>
                <SelectItem value="stanford">Stanford</SelectItem>
                <SelectItem value="berkeley">UC Berkeley</SelectItem>
                <SelectItem value="harvard">Harvard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Graduation</TableHead>
                <TableHead>Scores</TableHead>
                <TableHead>Applied Jobs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-semibold text-primary">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {student.skills.join(", ")}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      {student.university}
                    </div>
                  </TableCell>
                  <TableCell>{student.graduationYear}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className={getScoreColor(student.resumeScore)}>
                          {student.resumeScore}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span className={getScoreColor(student.matchScore)}>
                          {student.matchScore}%
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.appliedJobs}</TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Clock className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </RecruiterDashboardLayout>
  )
} 