"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow, format } from "date-fns"
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Briefcase, 
  FileText, 
  Loader2, 
  RefreshCw, 
  ExternalLink, 
  Globe,
  Clock,
  CheckCircle2,
  Clock8,
  XCircle 
} from "lucide-react"
import StudentDashboardLayout from "@/components/student-dashboard-layout"
import { useRouter } from "next/navigation"

// Interface definitions 
interface Application {
  _id: string
  jobTitle: string
  jobId: string
  status: string
  appliedAt: string
  jobType: string
  jobLocation: string
}

interface Company {
  _id: string
  name: string
  logo: string
  industry: string
  location: string
  website: string
  applications: Application[]
}

export default function ApplicationsPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    totalApplications: 0,
    totalCompanies: 0,
    pendingApplications: 0,
    acceptedApplications: 0
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      console.log("Fetching student applications")
      
      const response = await fetch(`/api/student/applications`, {
        credentials: 'include',
        cache: 'no-store'
      })
      
      console.log("API response status:", response.status)
      
      // Handle 401 Unauthorized separately
      if (response.status === 401) {
        console.log("Authentication required - showing demo data");
        // Use demo data when unauthorized
        const demoCompanies = [
          {
            _id: "demo-company-1",
            name: "Demo Tech Company",
            logo: "",
            industry: "Technology",
            location: "Remote",
            website: "https://example.com",
            applications: [
              {
                _id: "demo-app-1",
                jobTitle: "Frontend Developer",
                jobId: "demo-job-1",
                status: "pending",
                appliedAt: new Date().toISOString(),
                jobType: "Full-time",
                jobLocation: "Remote"
              },
              {
                _id: "demo-app-2",
                jobTitle: "Backend Developer",
                jobId: "demo-job-2",
                status: "shortlisted",
                appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                jobType: "Full-time",
                jobLocation: "Remote"
              }
            ]
          },
          {
            _id: "demo-company-2",
            name: "Demo Finance Corp",
            logo: "",
            industry: "Finance",
            location: "New York",
            website: "https://example-finance.com",
            applications: [
              {
                _id: "demo-app-3",
                jobTitle: "Data Analyst",
                jobId: "demo-job-3",
                status: "rejected",
                appliedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                jobType: "Full-time",
                jobLocation: "New York"
              }
            ]
          }
        ];
        
        setCompanies(demoCompanies);
        
        // Calculate stats for demo data
        const allApplications = demoCompanies.flatMap(company => company.applications);
        const pendingCount = allApplications.filter(app => 
          app.status === "pending" || app.status === "reviewed").length;
        const acceptedCount = allApplications.filter(app => 
          app.status === "accepted" || app.status === "offered").length;
        
        setStats({
          totalApplications: allApplications.length,
          totalCompanies: demoCompanies.length,
          pendingApplications: pendingCount,
          acceptedApplications: acceptedCount
        });
        
        toast({
          title: "Demo Mode",
          description: "Displaying sample application data for demonstration purposes.",
          variant: "default",
        });
        
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        throw new Error(errorData.error || "Failed to fetch applications")
      }
      
      const data = await response.json()
      console.log("Applications data received:", data)
      
      setCompanies(data.companies || [])
      
      // Calculate stats
      const allApplications = data.companies.flatMap(company => company.applications)
      const pendingCount = allApplications.filter(app => 
        app.status === "pending" || app.status === "reviewed").length
      const acceptedCount = allApplications.filter(app => 
        app.status === "accepted" || app.status === "offered").length
      
      setStats({
        totalApplications: data.totalApplications || allApplications.length,
        totalCompanies: data.companies.length,
        pendingApplications: pendingCount,
        acceptedApplications: acceptedCount
      })
    } catch (error) {
      console.error("Fetch error:", error)
      
      // Provide fallback data in case of error
      const fallbackCompanies = [
        {
          _id: "fallback-company-1",
          name: "Sample Tech Company",
          logo: "",
          industry: "Technology",
          location: "Remote",
          website: "https://example.com",
          applications: [
            {
              _id: "fallback-app-1",
              jobTitle: "Software Engineer",
              jobId: "fallback-job-1",
              status: "pending",
              appliedAt: new Date().toISOString(),
              jobType: "Full-time",
              jobLocation: "Remote"
            }
          ]
        }
      ];
      
      setCompanies(fallbackCompanies);
      
      setStats({
        totalApplications: 1,
        totalCompanies: 1,
        pendingApplications: 1,
        acceptedApplications: 0
      });
      
      toast({
        title: "Error loading data",
        description: "Displaying sample data. " + (error instanceof Error ? error.message : "Failed to load applications."),
        variant: "destructive",
      });
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshing(true)
    fetchApplications()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "reviewed":
        return <Clock8 className="h-4 w-4 text-yellow-500" />
      case "shortlisted":
      case "interviewed":
      case "offered":
      case "accepted":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "rejected":
      case "declined":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "reviewed":
        return "bg-yellow-100 text-yellow-800"
      case "shortlisted":
      case "interviewed":
        return "bg-blue-100 text-blue-800"
      case "offered":
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
      case "declined":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderSkeletons = () => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array(2).fill(0).map((_, j) => (
                  <div key={j} className="flex items-center justify-between border-b pb-3">
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  return (
    <StudentDashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
            <p className="text-muted-foreground mt-2">
              Track the status of your job applications across companies
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={loading || refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => router.push('/student/jobs')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Browse Jobs
            </Button>
          </div>
        </div>

        {!loading && companies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">Companies</p>
                <p className="text-2xl font-bold mt-1">{stats.totalCompanies}</p>
                <p className="text-xs text-muted-foreground mt-1">You've applied to {stats.totalCompanies} {stats.totalCompanies === 1 ? 'company' : 'companies'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold mt-1">{stats.totalApplications}</p>
                <p className="text-xs text-muted-foreground mt-1">Across all companies</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1">{stats.pendingApplications}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.pendingApplications === 0 ? "No pending applications" : 
                  `${stats.pendingApplications} applications awaiting review`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold mt-1">{stats.acceptedApplications}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.acceptedApplications === 0 ? "No accepted applications yet" : 
                  `${stats.acceptedApplications} applications accepted`}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {loading ? (
          renderSkeletons()
        ) : companies.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No applications found</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  You haven't applied to any jobs yet
                </p>
                <Button onClick={() => router.push('/student/jobs')}>
                  Browse Jobs
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {companies.map((company) => (
              <Card key={company._id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{company.name}</h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                        {company.industry && (
                          <div className="flex items-center">
                            <Briefcase className="w-3.5 h-3.5 mr-1" />
                            {company.industry}
                          </div>
                        )}
                        {company.location && (
                          <div className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            {company.location}
                          </div>
                        )}
                        {company.website && (
                          <div className="flex items-center">
                            <Globe className="w-3.5 h-3.5 mr-1" />
                            <a href={company.website} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:underline">
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium text-sm text-gray-500 mb-3">
                    Applied to {company.applications.length} {company.applications.length === 1 ? 'job' : 'jobs'}
                  </h4>
                  <div className="space-y-4">
                    {company.applications.map((application) => (
                      <div key={application._id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div>
                          <h3 className="font-medium">{application.jobTitle}</h3>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-1" />
                              Applied {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-3.5 h-3.5 mr-1" />
                              {application.jobLocation}
                            </div>
                            <div className="flex items-center">
                              <Briefcase className="w-3.5 h-3.5 mr-1" />
                              {application.jobType}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge
                            className={`${getStatusColor(application.status)} capitalize flex items-center gap-1`}
                          >
                            {getStatusIcon(application.status)}
                            {application.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentDashboardLayout>
  )
} 