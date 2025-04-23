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
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
  Star,
} from "lucide-react"
import { AdminDashboardLayout } from "@/components/layouts/AdminDashboardLayout"

// Mock data for companies
const companies = [
  {
    id: 1,
    name: "TechCorp Inc.",
    industry: "Technology",
    recruiter: "John Smith",
    jobs: 12,
    status: "active",
    totalHired: 45,
    hiringTrend: "up",
    rating: 4.8,
    logo: "https://via.placeholder.com/40",
  },
  {
    id: 2,
    name: "FinancePro",
    industry: "Finance",
    recruiter: "Sarah Johnson",
    jobs: 8,
    status: "pending",
    totalHired: 28,
    hiringTrend: "down",
    rating: 4.2,
    logo: "https://via.placeholder.com/40",
  },
  {
    id: 3,
    name: "HealthCare Plus",
    industry: "Healthcare",
    recruiter: "Mike Wilson",
    jobs: 15,
    status: "active",
    totalHired: 62,
    hiringTrend: "up",
    rating: 4.9,
    logo: "https://via.placeholder.com/40",
  },
  {
    id: 4,
    name: "EduTech Solutions",
    industry: "Education",
    recruiter: "Emily Brown",
    jobs: 6,
    status: "blacklisted",
    totalHired: 15,
    hiringTrend: "down",
    rating: 3.5,
    logo: "https://via.placeholder.com/40",
  },
]

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [industryFilter, setIndustryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "blacklisted":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Blacklisted
          </Badge>
        )
      default:
        return null
    }
  }

  const getHiringTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage and monitor company partnerships
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Building2 className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-4">
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="blacklisted">Blacklisted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Card key={company.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-12 w-12 rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {company.industry}
                    </p>
                  </div>
                </div>
                {getStatusBadge(company.status)}
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Recruiter</span>
                  <span className="font-medium">{company.recruiter}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Jobs</span>
                  <span className="font-medium">{company.jobs}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Hired</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{company.totalHired}</span>
                    {getHiringTrendIcon(company.hiringTrend)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{company.rating}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" className="flex-1">
                  Manage
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminDashboardLayout>
  )
} 