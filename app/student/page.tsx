"use client"

import StudentDashboardLayout from "@/components/student-dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowUpRight, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  BarChart, 
  Users,
  Zap,
  Brain,
  Award,
  User,
  Building2,
  Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/components/providers/auth-provider"

export default function StudentDashboard() {
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthContext()

  // Fetch recommended jobs
  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      try {
        setLoading(true)
        
        // Fetch jobs from API with limit parameter
        const response = await fetch('/api/jobs?limit=5&status=open')
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommended jobs')
        }
        
        const data = await response.json()
        setRecommendedJobs(data.jobs || [])
      } catch (err) {
        console.error('Error fetching recommended jobs:', err)
        toast({
          title: "Error",
          description: "Failed to load job recommendations.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchRecommendedJobs()
  }, [toast])

  // Mock data for job applications
  const applications = [
    {
      id: 1,
      company: "TechCorp",
      logo: "/placeholder.svg?height=32&width=32",
      position: "Software Engineer Intern",
      date: "2024-03-10",
      status: "Interview",
    },
    {
      id: 2,
      company: "InnovateTech",
      logo: "/placeholder.svg?height=32&width=32",
      position: "Frontend Developer",
      date: "2024-03-05",
      status: "Pending",
    },
    {
      id: 3,
      company: "DataSystems",
      logo: "/placeholder.svg?height=32&width=32",
      position: "Data Analyst",
      date: "2024-02-28",
      status: "Rejected",
    },
    {
      id: 4,
      company: "CloudNine",
      logo: "/placeholder.svg?height=32&width=32",
      position: "DevOps Engineer",
      date: "2024-02-20",
      status: "Selected",
    },
  ]

  // Mock data for skill gaps
  const skillGaps = [
    { skill: "React", current: 80, required: 90 },
    { skill: "TypeScript", current: 60, required: 85 },
    { skill: "Node.js", current: 40, required: 75 },
    { skill: "AWS", current: 30, required: 70 },
  ]

  // Helper function for status badge styles
  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case "Selected":
        return "bg-primary/10 text-primary hover:bg-primary/20"
      case "Interview":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100"
      case "Rejected":
        return "bg-destructive/10 text-destructive hover:bg-destructive/20"
      case "Pending":
      default:
        return "bg-secondary hover:bg-secondary/80"
    }
  }

  return (
    <StudentDashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12">
              <img
                src="/placeholder.svg?height=48&width=48"
                alt="User avatar"
                className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
              />
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-sm">
                <User className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.name?.split(' ')[0] || 'Student'}! Here's what's happening with your job search.
              </p>
            </div>
          </div>
          <Button className="shrink-0" onClick={() => router.push('/student/profile')}>Update Profile</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Resume Score</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">78/100</div>
                <div className="text-xs text-muted-foreground">+12% from last update</div>
              </div>
              <Progress value={78} className="mt-2" />
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="link" className="h-auto p-0 text-xs">
                View suggestions <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>4 active</span>
                <span>•</span>
                <span>8 completed</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="link" className="h-auto p-0 text-xs">
                View all <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Interviews</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Next: TechCorp (Mar 18)</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="link" className="h-auto p-0 text-xs">
                Prepare now <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>+15% this week</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="link" className="h-auto p-0 text-xs">
                Improve visibility <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Available Jobs</CardTitle>
                  <CardDescription>Browse all available job opportunities</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading jobs...</span>
                </div>
              ) : recommendedJobs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No jobs available at the moment.
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendedJobs.map((job) => (
                    <div
                      key={job._id}
                      className="flex flex-col rounded-lg border p-4 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:gap-4"
                    >
                      <div className="mb-4 flex items-center sm:mb-0 sm:w-48">
                        <div className="relative mr-3 h-10 w-10">
                          <img
                            src={job.company?.logo || "/placeholder.svg"}
                            alt={job.company?.name || "Company"}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background shadow-sm">
                            <Building2 className="h-3 w-3 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium">{job.company?.name || "Company"}</h3>
                          <p className="text-xs text-muted-foreground">{job.location}</p>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium">{job.title}</h3>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {job.skills && job.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills && job.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between sm:mt-0 sm:justify-end sm:gap-4">
                        <div className="flex items-center">
                          <Badge variant="outline" className="text-xs">{job.type}</Badge>
                        </div>
                        <Button size="sm" className="shrink-0">Apply</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/student/jobs">View More Jobs</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Skill Gap Analysis</CardTitle>
                  <CardDescription>Improve these skills to match job requirements</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillGaps.map((skill) => (
                  <div key={skill.skill} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{skill.skill}</span>
                      <span className="text-xs text-muted-foreground">
                        {skill.current}% / {skill.required}%
                      </span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-primary" style={{ width: `${skill.current}%` }} />
                      <div
                        className="absolute top-0 h-full w-px bg-primary-foreground"
                        style={{ left: `${skill.required}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button variant="outline" className="w-full">
                Get Learning Resources
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Application Tracker</CardTitle>
                <CardDescription>Monitor the status of your job applications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="interview">Interview</TabsTrigger>
                <TabsTrigger value="selected">Selected</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-4">
                      <div className="flex items-center">
                        <div className="relative mr-3 h-8 w-8">
                          <img
                            src={app.logo || "/placeholder.svg"}
                            alt={app.company}
                            className="h-8 w-8 rounded-md object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-background shadow-sm">
                            <Building2 className="h-2.5 w-2.5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium">{app.position}</h3>
                          <p className="text-xs text-muted-foreground">{app.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 sm:mt-0">
                        <span className="text-sm text-muted-foreground">{new Date(app.date).toLocaleDateString()}</span>
                        <Badge
                          className={`flex items-center gap-1 whitespace-nowrap ${getStatusBadgeStyles(app.status)}`}
                        >
                          {app.status === "Selected" && <CheckCircle className="h-3 w-3" />}
                          {app.status === "Interview" && <Clock className="h-3 w-3" />}
                          {app.status === "Rejected" && <XCircle className="h-3 w-3" />}
                          {app.status === "Pending" && <Briefcase className="h-3 w-3" />}
                          {app.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="pending">
                <div className="space-y-4">
                  {applications
                    .filter((app) => app.status === "Pending")
                    .map((app) => (
                      <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-4">
                        <div className="flex items-center">
                          <div className="relative mr-3 h-8 w-8">
                            <img
                              src={app.logo || "/placeholder.svg"}
                              alt={app.company}
                              className="h-8 w-8 rounded-md object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-background shadow-sm">
                              <Building2 className="h-2.5 w-2.5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium">{app.position}</h3>
                            <p className="text-xs text-muted-foreground">{app.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 sm:mt-0">
                          <span className="text-sm text-muted-foreground">
                            {new Date(app.date).toLocaleDateString()}
                          </span>
                          <Badge className="flex items-center gap-1 whitespace-nowrap bg-secondary hover:bg-secondary/80">
                            <Briefcase className="h-3 w-3" />
                            Pending
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
              {/* Other tab contents would follow the same pattern */}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  )
}

