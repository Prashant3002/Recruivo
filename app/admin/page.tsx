"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminDashboardLayout } from "@/components/layouts/AdminDashboardLayout"
import {
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Building2,
  Download,
  GraduationCap,
  LineChart,
  PieChart,
  Plus,
  Users,
} from "lucide-react"

export default function AdminDashboard() {
  // Mock data for placement statistics
  const placementStats = {
    totalStudents: 450,
    placed: 382,
    placementRate: 85,
    averageSalary: "₹12,00,000",
    topSalary: "₹35,00,000",
  }

  // Mock data for top hiring companies
  const topCompanies = [
    {
      id: 1,
      name: "TechCorp",
      logo: "/placeholder.svg?height=40&width=40",
      hires: 28,
      openings: 5,
      industry: "Technology",
    },
    {
      id: 2,
      name: "DataSystems",
      logo: "/placeholder.svg?height=40&width=40",
      hires: 22,
      openings: 3,
      industry: "Data Analytics",
    },
    {
      id: 3,
      name: "CloudNine",
      logo: "/placeholder.svg?height=40&width=40",
      hires: 18,
      openings: 4,
      industry: "Cloud Services",
    },
    {
      id: 4,
      name: "FinTech Solutions",
      logo: "/placeholder.svg?height=40&width=40",
      hires: 15,
      openings: 2,
      industry: "Finance",
    },
  ]

  // Mock data for department statistics
  const departmentStats = [
    { department: "Computer Science", students: 120, placementRate: 92 },
    { department: "Electrical Engineering", students: 85, placementRate: 88 },
    { department: "Business Administration", students: 95, placementRate: 82 },
    { department: "Data Science", students: 75, placementRate: 94 },
    { department: "Mechanical Engineering", students: 65, placementRate: 78 },
  ]

  return (
    <AdminDashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">University Dashboard</h1>
            <p className="text-muted-foreground">Overview of campus recruitment and placement statistics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Company
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{placementStats.totalStudents}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Graduating this year</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{placementStats.placementRate}%</div>
              <Progress value={placementStats.placementRate} className="mt-2" />
              <div className="mt-2 text-xs text-muted-foreground">
                <span>+5% from last year</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{placementStats.averageSalary}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>+8% from last year</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Partner Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>14 active recruiters</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <Button variant="link" className="h-auto p-0 text-xs">
                  View all <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Placement Trends</CardTitle>
              <CardDescription>Year-over-year placement statistics</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex h-full items-center justify-center">
                <LineChart className="h-60 w-60 text-muted-foreground" />
                <p className="text-center text-sm text-muted-foreground">
                  Placement trend visualization would appear here
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Department Breakdown</CardTitle>
              <CardDescription>Placement rates by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-center">
                <PieChart className="h-40 w-40 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {departmentStats.map((dept) => (
                  <div key={dept.department} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{dept.department}</span>
                      <span className="text-sm font-medium">{dept.placementRate}%</span>
                    </div>
                    <Progress value={dept.placementRate} className="h-2" />
                    <div className="text-xs text-muted-foreground">{dept.students} students</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Hiring Companies</CardTitle>
            <CardDescription>Companies with the most hires from our university</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCompanies.map((company) => (
                <div
                  key={company.id}
                  className="flex flex-col justify-between rounded-lg border p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                      <img
                        src={company.logo || "/placeholder.svg"}
                        alt={company.name}
                        className="h-10 w-10 rounded-md"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">{company.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Building2 className="mr-1 h-4 w-4" />
                        {company.industry}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-6 sm:mt-0">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{company.hires} Hires</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{company.openings} Open Positions</span>
                    </div>
                    <Button size="sm">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Skill Demand Analysis</CardTitle>
              <CardDescription>Most requested skills by employers</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex h-full flex-col items-center justify-center">
                <BarChart3 className="h-40 w-40 text-muted-foreground" />
                <p className="text-center text-sm text-muted-foreground">
                  Skill demand visualization would appear here
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest recruitment activities on campus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-2 border-primary pl-4">
                  <h3 className="font-medium">TechCorp Campus Drive</h3>
                  <p className="text-sm text-muted-foreground">
                    Interviewing 24 students for SDE roles
                  </p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <h3 className="font-medium">DataSystems Pre-placement Talk</h3>
                  <p className="text-sm text-muted-foreground">
                    Attended by 120+ students
                  </p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <h3 className="font-medium">FinTech Solutions Results</h3>
                  <p className="text-sm text-muted-foreground">
                    12 students selected for final interviews
                  </p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <h3 className="font-medium">CloudNine Recruitment Drive</h3>
                  <p className="text-sm text-muted-foreground">
                    Made 8 on-the-spot offers
                  </p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
              <Button variant="link" className="mt-4 h-auto p-0 text-xs">
                View all activities <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}

