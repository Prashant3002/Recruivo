"use client"

import { useState } from "react"
import { RecruiterDashboardLayout } from "@/components/recruiter-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  LineChartIcon,
  BarChartIcon,
  Activity,
  Users,
  Calendar,
  Briefcase,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Badge,
  Target,
  AlertCircle,
  CheckCircle2
} from "lucide-react"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6m")
  
  // Mock analytics data
  const applicantsData = {
    totalCount: 823,
    growthRate: 12.4,
    bySource: [
      { name: "Job Boards", value: 35 },
      { name: "Company Site", value: 25 },
      { name: "Referrals", value: 20 },
      { name: "Social Media", value: 15 },
      { name: "Other", value: 5 }
    ],
    byPosition: [
      { name: "Software Engineer", value: 182 },
      { name: "Product Manager", value: 124 },
      { name: "UX Designer", value: 93 },
      { name: "Data Scientist", value: 87 },
      { name: "DevOps Engineer", value: 65 }
    ],
    timeline: [
      { date: "Jan", count: 65 },
      { date: "Feb", count: 72 },
      { date: "Mar", count: 80 },
      { date: "Apr", count: 74 },
      { date: "May", count: 85 },
      { date: "Jun", count: 92 },
      { date: "Jul", count: 104 },
      { date: "Aug", count: 115 },
      { date: "Sep", count: 135 }
    ]
  }
  
  const hiringData = {
    openPositions: 24,
    offersMade: 37,
    acceptanceRate: 78,
    timeToHire: 23,
    hiringByDepartment: [
      { name: "Engineering", count: 15 },
      { name: "Product", count: 9 },
      { name: "Design", count: 6 },
      { name: "Marketing", count: 4 },
      { name: "Sales", count: 7 }
    ],
    timeline: [
      { date: "Jan", hired: 4 },
      { date: "Feb", hired: 3 },
      { date: "Mar", hired: 5 },
      { date: "Apr", hired: 4 },
      { date: "May", hired: 6 },
      { date: "Jun", hired: 5 },
      { date: "Jul", hired: 7 },
      { date: "Aug", hired: 8 },
      { date: "Sep", hired: 10 }
    ]
  }
  
  const interviewData = {
    scheduled: 42,
    completed: 37,
    cancelRate: 14,
    passRate: 68,
    byStage: [
      { name: "Initial Screen", count: 18 },
      { name: "Technical", count: 12 },
      { name: "Manager", count: 9 },
      { name: "Team", count: 6 },
      { name: "Final", count: 5 }
    ]
  }
  
  const jobPerformanceData = {
    topPerforming: [
      { title: "Senior Frontend Developer", applicants: 87, views: 1243, conversionRate: 7.1 },
      { title: "Product Manager", applicants: 63, views: 892, conversionRate: 6.8 },
      { title: "UX/UI Designer", applicants: 54, views: 765, conversionRate: 6.2 }
    ],
    lowPerforming: [
      { title: "Junior QA Engineer", applicants: 12, views: 435, conversionRate: 2.3 },
      { title: "Technical Writer", applicants: 8, views: 321, conversionRate: 2.1 },
      { title: "IT Support Specialist", applicants: 7, views: 289, conversionRate: 1.9 }
    ]
  }

  const salaryRanges = [
    { range: "₹5,00,000 - ₹10,00,000", count: 45 },
    { range: "₹10,00,000 - ₹20,00,000", count: 78 },
    { range: "₹20,00,000 - ₹30,00,000", count: 34 },
    { range: "₹30,00,000+", count: 12 }
  ]

  const metrics = [
    {
      title: "Total Applications",
      value: "1,234",
      change: "+12.5%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Active Jobs",
      value: "45",
      change: "+5.2%",
      trend: "up",
      icon: Briefcase,
    },
    {
      title: "Avg. Time to Hire",
      value: "15 days",
      change: "-2.3%",
      trend: "down",
      icon: Clock,
    },
    {
      title: "Interview Success Rate",
      value: "68%",
      change: "+4.1%",
      trend: "up",
      icon: Target,
    },
  ]

  const topJobs = [
    {
      title: "Senior Software Engineer",
      applications: 156,
      matchRate: 92,
      status: "high",
    },
    {
      title: "Data Scientist",
      applications: 143,
      matchRate: 88,
      status: "high",
    },
    {
      title: "Product Manager",
      applications: 98,
      matchRate: 85,
      status: "medium",
    },
    {
      title: "UI/UX Designer",
      applications: 76,
      matchRate: 82,
      status: "medium",
    },
  ]

  const hiringTrends = [
    {
      month: "Jan",
      applications: 120,
      interviews: 45,
      offers: 12,
    },
    {
      month: "Feb",
      applications: 145,
      interviews: 52,
      offers: 15,
    },
    {
      month: "Mar",
      applications: 168,
      interviews: 58,
      offers: 18,
    },
    {
      month: "Apr",
      applications: 189,
      interviews: 62,
      offers: 20,
    },
    {
      month: "May",
      applications: 210,
      interviews: 68,
      offers: 22,
    },
    {
      month: "Jun",
      applications: 198,
      interviews: 65,
      offers: 21,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <RecruiterDashboardLayout>
      <div className="h-full w-full space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Recruitment Analytics</h1>
            <p className="text-muted-foreground">Track your hiring metrics, applicant sources, and recruitment performance</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.title} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <metric.icon className="h-6 w-6 text-primary" />
                </div>
                <Badge
                  variant={metric.trend === "up" ? "default" : "destructive"}
                  className="gap-1"
                >
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingUp className="h-3 w-3 rotate-180" />
                  )}
                  {metric.change}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="applicants" className="space-y-4">
          <TabsList className="w-full justify-start border-b rounded-none px-0 h-auto pb-0">
            <div className="flex w-full overflow-x-auto scrollbar-hide pb-2 gap-2">
              <TabsTrigger 
                value="applicants" 
                className="rounded-md data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-b-none pb-2"
              >
                Applicant Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="hiring" 
                className="rounded-md data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-b-none pb-2"
              >
                Hiring Metrics
              </TabsTrigger>
              <TabsTrigger 
                value="interviews" 
                className="rounded-md data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-b-none pb-2"
              >
                Interview Performance
              </TabsTrigger>
              <TabsTrigger 
                value="jobs" 
                className="rounded-md data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-b-none pb-2"
              >
                Job Performance
              </TabsTrigger>
            </div>
          </TabsList>

          {/* Applicant Analytics */}
          <TabsContent value="applicants" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {/* Applicants Over Time Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Applicants Over Time</CardTitle>
                      <CardDescription>Number of applications received by month</CardDescription>
                    </div>
                    <LineChartIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    {/* Chart Placeholder - Display a mock line chart */}
                    <div className="h-full w-full bg-muted/10 rounded-md flex items-center justify-center">
                      <div className="space-y-2">
                        <Activity className="h-10 w-10 text-primary/60 mx-auto" />
                        <p className="text-sm text-muted-foreground text-center">
                          Application trend chart would be rendered here
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Applicants by Source */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Applicants by Source</CardTitle>
                      <CardDescription>Where candidates are coming from</CardDescription>
                    </div>
                    <PieChart className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    {/* Pie Chart Placeholder */}
                    <div className="h-full w-full bg-muted/10 rounded-md flex items-center justify-center">
                      <div className="space-y-2">
                        <PieChart className="h-10 w-10 text-primary/60 mx-auto" />
                        <p className="text-sm text-muted-foreground text-center">
                          Applicant source distribution chart would be rendered here
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Applicants by Position */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Applicants by Position</CardTitle>
                    <CardDescription>Most popular job positions</CardDescription>
                  </div>
                  <BarChartIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applicantsData.byPosition.map((position, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{position.name}</span>
                        <span className="text-sm text-muted-foreground">{position.value} applicants</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ 
                            width: `${(position.value / applicantsData.byPosition[0].value) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hiring Metrics */}
          <TabsContent value="hiring" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {/* Hiring Trend */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Hiring Trend</CardTitle>
                      <CardDescription>Number of hires per month</CardDescription>
                    </div>
                    <AreaChart className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    {/* Chart Placeholder */}
                    <div className="h-full w-full bg-muted/10 rounded-md flex items-center justify-center">
                      <div className="space-y-2">
                        <AreaChart className="h-10 w-10 text-primary/60 mx-auto" />
                        <p className="text-sm text-muted-foreground text-center">
                          Monthly hiring trend chart would be rendered here
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hiring by Department */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Hiring by Department</CardTitle>
                      <CardDescription>Distribution of hires across departments</CardDescription>
                    </div>
                    <BarChartIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hiringData.hiringByDepartment.map((dept, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{dept.name}</span>
                          <span className="text-sm text-muted-foreground">{dept.count} hires</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ 
                              width: `${(dept.count / hiringData.hiringByDepartment[0].count) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Offers & Acceptance */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Offer Acceptance Rate</CardTitle>
                    <CardDescription>Tracking offers made vs. accepted</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-md">
                    <div className="text-3xl font-bold">{hiringData.offersMade}</div>
                    <div className="text-sm text-muted-foreground mt-1">Offers Made</div>
                  </div>
                  <div className="text-center p-4 border rounded-md">
                    <div className="text-3xl font-bold">{Math.round(hiringData.offersMade * hiringData.acceptanceRate / 100)}</div>
                    <div className="text-sm text-muted-foreground mt-1">Offers Accepted</div>
                  </div>
                  <div className="text-center p-4 border rounded-md">
                    <div className="text-3xl font-bold text-green-600">{hiringData.acceptanceRate}%</div>
                    <div className="text-sm text-muted-foreground mt-1">Acceptance Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interview Performance */}
          <TabsContent value="interviews" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {/* Interview Distribution */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Interview Stage Distribution</CardTitle>
                      <CardDescription>Interviews at each hiring stage</CardDescription>
                    </div>
                    <PieChart className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {interviewData.byStage.map((stage, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{stage.name}</span>
                          <span className="text-sm text-muted-foreground">{stage.count} interviews</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ 
                              width: `${(stage.count / interviewData.byStage[0].count) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Interview Stats */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Interview Performance</CardTitle>
                      <CardDescription>Key interview metrics</CardDescription>
                    </div>
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-2">
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Scheduled</div>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-bold mt-2">{interviewData.scheduled}</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Completed</div>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-bold mt-2">{interviewData.completed}</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Pass Rate</div>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-bold mt-2 text-green-600">{interviewData.passRate}%</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Cancel Rate</div>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-bold mt-2 text-amber-600">{interviewData.cancelRate}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Job Performance */}
          <TabsContent value="jobs" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {/* Top Performing Jobs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Top Performing Job Postings</CardTitle>
                      <CardDescription>Jobs with highest conversion rates</CardDescription>
                    </div>
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topJobs.map((job) => (
                      <div key={job.title} className="p-4 border rounded-md space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{job.title}</div>
                          <div className="text-sm font-semibold text-green-600">{job.matchRate}%</div>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                          <div>Views: {job.views}</div>
                          <div>Applicants: {job.applicants}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Performing Jobs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Underperforming Job Postings</CardTitle>
                      <CardDescription>Jobs with lowest conversion rates</CardDescription>
                    </div>
                    <TrendingDown className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobPerformanceData.lowPerforming.map((job, index) => (
                      <div key={index} className="p-4 border rounded-md space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{job.title}</div>
                          <div className="text-sm font-semibold text-red-600">{job.conversionRate}%</div>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                          <div>Views: {job.views}</div>
                          <div>Applicants: {job.applicants}</div>
                        </div>
                        <div className="pt-2">
                          <Button variant="outline" size="sm" className="w-full">Improve Job Post</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterDashboardLayout>
  )
}