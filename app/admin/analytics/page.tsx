"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
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
  LineChart,
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react"
import { AdminDashboardLayout } from "@/components/layouts/AdminDashboardLayout"

// Mock data for analytics
const metrics = [
  {
    title: "Total Applications",
    value: "2,547",
    trend: "+12.5%",
    trendUp: true,
    icon: Users,
  },
  {
    title: "Active Jobs",
    value: "156",
    trend: "+8.2%",
    trendUp: true,
    icon: Briefcase,
  },
  {
    title: "Average Time to Hire",
    value: "15 days",
    trend: "-3.1%",
    trendUp: true,
    icon: Building2,
  },
  {
    title: "Interview Success Rate",
    value: "68%",
    trend: "-2.4%",
    trendUp: false,
    icon: LineChart,
  },
]

const topJobs = [
  {
    title: "Senior Software Engineer",
    applications: 245,
    matchRate: 92,
    status: "high",
  },
  {
    title: "Data Scientist",
    applications: 189,
    matchRate: 85,
    status: "medium",
  },
  {
    title: "Product Manager",
    applications: 156,
    matchRate: 78,
    status: "low",
  },
]

const hiringTrends = [
  {
    month: "Jan",
    applications: 450,
    interviews: 120,
    offers: 45,
  },
  {
    month: "Feb",
    applications: 520,
    interviews: 145,
    offers: 52,
  },
  {
    month: "Mar",
    applications: 480,
    interviews: 130,
    offers: 48,
  },
  {
    month: "Apr",
    applications: 550,
    interviews: 160,
    offers: 58,
  },
  {
    month: "May",
    applications: 600,
    interviews: 180,
    offers: 65,
  },
  {
    month: "Jun",
    applications: 580,
    interviews: 170,
    offers: 62,
  },
]

const aiInsights = [
  {
    title: "High Demand Skills",
    description: "React, Node.js, and Python are trending in job requirements",
    action: "Update student training programs",
  },
  {
    title: "Company Engagement",
    description: "TechCorp Inc. shows highest engagement rate",
    action: "Consider premium partnership",
  },
  {
    title: "Application Timing",
    description: "Most successful applications are submitted in morning hours",
    action: "Optimize job posting schedule",
  },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("month")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
        return "text-green-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Track recruitment metrics and insights
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.title} className="p-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 p-2">
                  <metric.icon className="h-5 w-5 text-primary" />
                </div>
                <Badge
                  variant={metric.trendUp ? "success" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {metric.trendUp ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {metric.trend}
                </Badge>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </h3>
                <p className="mt-1 text-2xl font-bold">{metric.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Top Jobs and Hiring Trends */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Top Performing Jobs</h2>
            <div className="mt-4 space-y-4">
              {topJobs.map((job) => (
                <div
                  key={job.title}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.applications} applications
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={getStatusColor(job.status)}>
                      {job.matchRate}% match
                    </span>
                    {job.matchRate >= 90 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : job.matchRate >= 80 ? (
                      <TrendingUp className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold">Hiring Trends</h2>
            <div className="mt-4 space-y-4">
              {hiringTrends.map((trend) => (
                <div
                  key={trend.month}
                  className="flex items-center justify-between"
                >
                  <span className="font-medium">{trend.month}</span>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Applications
                      </p>
                      <p className="font-medium">{trend.applications}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Interviews
                      </p>
                      <p className="font-medium">{trend.interviews}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Offers</p>
                      <p className="font-medium">{trend.offers}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold">AI-Powered Insights</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {aiInsights.map((insight) => (
              <div
                key={insight.title}
                className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
              >
                <h3 className="font-medium">{insight.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {insight.description}
                </p>
                <Button
                  variant="link"
                  className="mt-2 h-auto p-0 text-sm text-primary"
                >
                  {insight.action} →
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminDashboardLayout>
  )
} 