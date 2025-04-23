"use client"

import { useState } from "react"
import { RecruiterDashboardLayout } from "@/components/recruiter-dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Download,
  LineChart,
  MessageSquare,
  PieChart,
  Plus,
  Search,
  Star,
  TrendingUp,
  UserPlus,
  Users
} from "lucide-react"

export default function RecruiterDashboardPage() {
  const [period, setPeriod] = useState("week")
  
  // Mock data for the recruiter dashboard
  const dashboardData = {
    overview: {
      activeJobs: 18,
      totalApplications: 246,
      newCandidates: 58,
      scheduledInterviews: 12
    },
    recentCandidates: [
      {
        id: 1,
        name: "Alex Johnson",
        role: "Senior Frontend Developer",
        avatar: "/images/avatars/man-1.svg",
        matchScore: 92,
        status: "Shortlisted",
        appliedDate: "2 days ago"
      },
      {
        id: 2,
        name: "Samantha Miller",
        role: "UX Designer",
        avatar: "/images/avatars/woman-1.svg",
        matchScore: 88,
        status: "New",
        appliedDate: "4 days ago"
      },
      {
        id: 3,
        name: "David Chen",
        role: "Backend Engineer",
        avatar: "/images/avatars/man-2.svg",
        matchScore: 85,
        status: "Interview",
        appliedDate: "1 week ago"
      },
      {
        id: 4,
        name: "Emily Wilson",
        role: "Product Manager",
        avatar: "/images/avatars/woman-2.svg",
        matchScore: 79,
        status: "New",
        appliedDate: "1 week ago"
      }
    ],
    upcomingInterviews: [
      {
        id: 1,
        candidate: "Jordan Lee",
        position: "Frontend Developer",
        date: "Today",
        time: "2:00 PM",
        type: "Technical"
      },
      {
        id: 2,
        candidate: "Taylor Swift",
        position: "Product Designer",
        date: "Tomorrow",
        time: "11:30 AM",
        type: "Initial"
      },
      {
        id: 3,
        candidate: "Morgan Freeman",
        position: "DevOps Engineer",
        date: "Oct 25",
        time: "3:15 PM",
        type: "Manager"
      }
    ],
    activeJobs: [
      {
        id: 1,
        title: "Senior Frontend Developer",
        location: "Remote",
        applicants: 38,
        newApplications: 5,
        daysActive: 12
      },
      {
        id: 2,
        title: "UX/UI Designer",
        location: "San Francisco",
        applicants: 24,
        newApplications: 3,
        daysActive: 8
      },
      {
        id: 3,
        title: "Full Stack Engineer",
        location: "New York",
        applicants: 42,
        newApplications: 7,
        daysActive: 14
      }
    ],
    applicationTrend: [28, 32, 36, 29, 43, 47, 50],
    tasksDue: [
      {
        id: 1,
        task: "Review Frontend Developer applications",
        due: "Today",
        priority: "High"
      },
      {
        id: 2,
        task: "Schedule follow-up with interview candidates",
        due: "Tomorrow",
        priority: "Medium"
      },
      {
        id: 3,
        task: "Prepare job description for new UI Designer role",
        due: "Oct 26",
        priority: "Medium"
      }
    ]
  }

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "Shortlisted":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10 hover:text-green-500">Shortlisted</Badge>
      case "Interview":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/10 hover:text-blue-500">Interview</Badge>
      case "New":
        return <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/10 hover:text-purple-500">New</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Helper function to get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/10 hover:text-red-500">High</Badge>
      case "Medium":
        return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 hover:text-amber-500">Medium</Badge>
      case "Low":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10 hover:text-green-500">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  // Helper function to get match score color
  const getMatchScoreColor = (score) => {
    if (score >= 90) return "text-green-500"
    if (score >= 80) return "text-emerald-500"
    if (score >= 70) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <RecruiterDashboardLayout>
      <div className="h-full w-full space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Recruiter Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your recruitment today.</p>
          </div>
          <div className="flex gap-2">
            <Tabs value={period} onValueChange={setPeriod} className="w-[200px]">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active Jobs</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{dashboardData.overview.activeJobs}</p>
                    <span className="text-sm font-medium text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      2
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                2 new jobs posted this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Applications</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{dashboardData.overview.totalApplications}</p>
                    <span className="text-sm font-medium text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      12%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {dashboardData.overview.newCandidates} new candidates this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Interviews</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{dashboardData.overview.scheduledInterviews}</p>
                    <span className="text-sm font-medium text-amber-600 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      3 today
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                8 pending interview feedback
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Messages</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">15</p>
                    <span className="text-sm font-medium text-red-600 flex items-center">
                      <Bell className="h-3 w-3 mr-1" />
                      4 unread
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                7 new messages in the last 24 hours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {/* Applications Trend */}
          <Card className="xl:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Application Trend</CardTitle>
                  <CardDescription>Weekly applications received</CardDescription>
                </div>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                {/* Chart Placeholder */}
                <div className="h-full w-full bg-muted/10 rounded-md p-4">
                  <div className="flex h-full flex-col items-center justify-center space-y-3">
                    <div className="flex items-end gap-1 mb-2">
                      {dashboardData.applicationTrend.map((value, index) => (
                        <div 
                          key={index}
                          className="w-8 bg-primary/80 rounded-t"
                          style={{ height: `${value * 2}px` }}
                        ></div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Applications increased by 12% compared to last week
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="ghost" className="h-8 w-full justify-between">
                View detailed analytics
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Recent Candidates */}
          <Card className="xl:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Candidates</CardTitle>
                  <CardDescription>Latest applicants to your job postings</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentCandidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={candidate.avatar} alt={candidate.name} />
                        <AvatarFallback>
                          {candidate.name?.charAt(0)}
                          {candidate.name?.split(' ')[1]?.charAt(0) || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground">{candidate.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${getMatchScoreColor(candidate.matchScore)}`}>
                        {candidate.matchScore}%
                      </span>
                      {getStatusBadge(candidate.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="ghost" className="h-8 w-full justify-between">
                View all candidates
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Active Jobs */}
          <Card className="xl:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Job Postings</CardTitle>
                  <CardDescription>Your current open positions</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.activeJobs.map((job) => (
                  <div key={job.id} className="p-3 border rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{job.title}</p>
                      <Badge variant="outline" className="text-muted-foreground">{job.location}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {job.applicants} applicants
                      </span>
                      <span className="text-green-600 font-medium">
                        +{job.newApplications} new
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="ghost" className="h-8 w-full justify-between">
                Manage all jobs
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Upcoming Interviews */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Interviews</CardTitle>
                  <CardDescription>Your scheduled candidate interviews</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between border p-4 rounded-md">
                    <div>
                      <p className="font-medium">{interview.candidate}</p>
                      <p className="text-sm text-muted-foreground">{interview.position}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{interview.date}</p>
                        <p className="text-xs text-muted-foreground">{interview.time}</p>
                      </div>
                      <Badge>{interview.type}</Badge>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="ghost" className="h-8 w-full justify-between">
                View all scheduled interviews
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Tasks Due */}
          <Card className="xl:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tasks Due</CardTitle>
                  <CardDescription>Your pending recruitment tasks</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.tasksDue.map((task) => (
                  <div key={task.id} className="flex items-start justify-between p-3 border rounded-md">
                    <div className="space-y-1">
                      <p className="font-medium">{task.task}</p>
                      <p className="text-xs text-muted-foreground">Due: {task.due}</p>
                    </div>
                    <div>
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="ghost" className="h-8 w-full justify-between">
                View all tasks
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </RecruiterDashboardLayout>
  )
}

