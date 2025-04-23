"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, Briefcase, TrendingUp, Users, Search, Filter } from "lucide-react"
import RecruiterDashboardLayout from "@/components/recruiter-dashboard-layout"

// Mock data for companies
const companies = [
  {
    id: 1,
    name: "TechCorp",
    industry: "Technology",
    logo: "TC",
    activeJobs: 12,
    status: "active",
    totalHired: 45,
    hiringTrend: "increasing",
    rating: 4.8,
  },
  {
    id: 2,
    name: "DataFlow",
    industry: "Data Analytics",
    logo: "DF",
    activeJobs: 8,
    status: "active",
    totalHired: 32,
    hiringTrend: "stable",
    rating: 4.5,
  },
  {
    id: 3,
    name: "CloudTech",
    industry: "Cloud Computing",
    logo: "CT",
    activeJobs: 5,
    status: "occasional",
    totalHired: 28,
    hiringTrend: "decreasing",
    rating: 4.2,
  },
  {
    id: 4,
    name: "AI Solutions",
    industry: "Artificial Intelligence",
    logo: "AI",
    activeJobs: 0,
    status: "inactive",
    totalHired: 15,
    hiringTrend: "stable",
    rating: 4.0,
  },
]

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [industryFilter, setIndustryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "occasional":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getHiringTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "stable":
        return <TrendingUp className="h-4 w-4 text-yellow-500 rotate-90" />
      case "decreasing":
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      default:
        return null
    }
  }

  return (
    <RecruiterDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
            <p className="text-muted-foreground">
              Manage and track your partnered companies and their hiring activities
            </p>
          </div>
          <Button className="gap-2">
            <Building2 className="h-4 w-4" />
            Add Company
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="data">Data Analytics</SelectItem>
                <SelectItem value="cloud">Cloud Computing</SelectItem>
                <SelectItem value="ai">Artificial Intelligence</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="occasional">Occasional</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Card key={company.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-lg font-semibold text-primary">{company.logo}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">{company.industry}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(company.status)}>
                  {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    Active Jobs
                  </div>
                  <p className="font-semibold">{company.activeJobs}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Total Hired
                  </div>
                  <p className="font-semibold">{company.totalHired}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {getHiringTrendIcon(company.hiringTrend)}
                  <span className="text-sm text-muted-foreground">
                    {company.hiringTrend.charAt(0).toUpperCase() + company.hiringTrend.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{company.rating}</span>
                  <span className="text-sm text-muted-foreground">/ 5.0</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </RecruiterDashboardLayout>
  )
} 