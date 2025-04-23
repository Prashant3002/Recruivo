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
  Users,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Mail,
  MoreVertical,
} from "lucide-react"
import { AdminDashboardLayout } from "@/components/layouts/AdminDashboardLayout"

// Mock data for students
const students = [
  {
    id: 1,
    name: "Rahul Sharma",
    university: "IIT Delhi",
    degree: "B.Tech Computer Science",
    graduationYear: 2024,
    resumeScore: 92,
    matchScore: 88,
    appliedJobs: 12,
    status: "placed",
    skills: ["React", "Node.js", "Python"],
  },
  {
    id: 2,
    name: "Priya Patel",
    university: "BITS Pilani",
    degree: "M.Tech Data Science",
    graduationYear: 2024,
    resumeScore: 85,
    matchScore: 92,
    appliedJobs: 8,
    status: "interviewing",
    skills: ["Machine Learning", "Python", "SQL"],
  },
  {
    id: 3,
    name: "Amit Kumar",
    university: "NIT Trichy",
    degree: "B.Tech Electronics",
    graduationYear: 2024,
    resumeScore: 78,
    matchScore: 75,
    appliedJobs: 5,
    status: "applying",
    skills: ["Embedded Systems", "C++", "MATLAB"],
  },
  {
    id: 4,
    name: "Neha Gupta",
    university: "IIIT Hyderabad",
    degree: "B.Tech Computer Science",
    graduationYear: 2024,
    resumeScore: 95,
    matchScore: 90,
    appliedJobs: 15,
    status: "placed",
    skills: ["Full Stack", "System Design", "Cloud"],
  },
]

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [universityFilter, setUniversityFilter] = useState("all")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "placed":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Placed
          </Badge>
        )
      case "interviewing":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Interviewing
          </Badge>
        )
      case "applying":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Applying
          </Badge>
        )
      default:
        return null
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 80) return "text-blue-500"
    if (score >= 70) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage student profiles and track placements
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="placed">Placed</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="applying">Applying</SelectItem>
              </SelectContent>
            </Select>
            <Select value={universityFilter} onValueChange={setUniversityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="University" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Universities</SelectItem>
                <SelectItem value="iit">IIT Delhi</SelectItem>
                <SelectItem value="bits">BITS Pilani</SelectItem>
                <SelectItem value="nit">NIT Trichy</SelectItem>
                <SelectItem value="iiit">IIIT Hyderabad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Students Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Graduation</TableHead>
                <TableHead>Resume Score</TableHead>
                <TableHead>Match Score</TableHead>
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
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {student.degree}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.university}</TableCell>
                  <TableCell>{student.graduationYear}</TableCell>
                  <TableCell>
                    <span className={getScoreColor(student.resumeScore)}>
                      {student.resumeScore}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={getScoreColor(student.matchScore)}>
                      {student.matchScore}%
                    </span>
                  </TableCell>
                  <TableCell>{student.appliedJobs}</TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminDashboardLayout>
  )
} 