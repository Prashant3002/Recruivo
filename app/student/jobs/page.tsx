"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import StudentDashboardLayout from "@/components/student-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
  Briefcase,
  Search,
  MapPin,
  Building2,
  Clock,
  Filter,
  ArrowUpRight,
  Star,
  StarHalf,
  Loader2
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { JobApplicationDialog } from "@/components/job-application-dialog"

export default function JobsPage() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [jobListings, setJobListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()
  const router = useRouter()
  
  // Application dialog state
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState("")
  const [selectedJobTitle, setSelectedJobTitle] = useState("")
  
  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        
        // Debug session information
        console.log("Session status:", status);
        console.log("Session data:", session ? {
          id: session.user?.id,
          email: session.user?.email,
          role: session.user?.role
        } : "No session");
        
        // Verify session is properly loaded
        if (status === "authenticated") {
          try {
            const sessionCheckResponse = await fetch('/api/auth/check-session', {
              credentials: 'include'
            });
            const sessionData = await sessionCheckResponse.json();
            console.log("Session verification on page load:", sessionData);
          } catch (err) {
            console.error("Error verifying session:", err);
          }
        }
        
        // Build query parameters
        const params = new URLSearchParams()
        if (searchQuery) params.append('search', searchQuery)
        if (locationFilter && locationFilter !== 'all') params.append('location', locationFilter)
        if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter)
        
        // Fetch jobs from API
        const response = await fetch(`/api/jobs?${params.toString()}`, {
          credentials: 'include' // Ensure credentials are included
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch jobs')
        }
        
        const data = await response.json()
        setJobListings(data.jobs || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching jobs:', err)
        setError('Failed to load jobs. Please try again later.')
        toast({
          title: "Error",
          description: "Failed to load jobs. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchJobs()
  }, [searchQuery, locationFilter, typeFilter, toast, status, session])

  // Match score badge component
  const MatchScoreBadge = ({ score }) => {
    if (score >= 90) {
      return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">{score}% Match</Badge>
    } else if (score >= 80) {
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{score}% Match</Badge>
    } else {
      return <Badge variant="outline">{score}% Match</Badge>
    }
  }

  // Format date to relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return date.toLocaleDateString()
  }

  // Format application deadline
  const formatDeadline = (dateString) => {
    const date = new Date(dateString)
    return `Apply by ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  // Handle opening application dialog
  const handleOpenApplicationDialog = (job) => {
    // Always open the dialog without checking authentication
    // The dialog itself will handle any auth issues
    setSelectedJobId(job._id)
    setSelectedJobTitle(job.title)
    setApplicationDialogOpen(true)
  }

  // Refresh job listings
  const refreshJobListings = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (locationFilter && locationFilter !== 'all') params.append('location', locationFilter)
      if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter)
      
      const response = await fetch(`/api/jobs?${params.toString()}`)
      
      if (response.ok) {
        const data = await response.json()
        setJobListings(data.jobs || [])
      }
    } catch (error) {
      console.error('Error refreshing job listings:', error)
    }
  }

  return (
    <StudentDashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Find Jobs</h1>
          <p className="text-muted-foreground">Discover opportunities that match your skills and interests</p>
          </div>
          <Button variant="outline">
            <Star className="mr-2 h-4 w-4" /> Saved Jobs
          </Button>
        </div>

        {/* Search and filters */}
        <Card>
              <CardHeader>
            <CardTitle>Search Jobs</CardTitle>
            <CardDescription>Find the perfect job match for your skills</CardDescription>
              </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search job titles, skills, or companies..." 
                    className="pl-8" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                    <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="sf">San Francisco, CA</SelectItem>
                    <SelectItem value="ny">New York, NY</SelectItem>
                    <SelectItem value="chicago">Chicago, IL</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-3 w-3" /> More Filters
            </Button>
            <div className="text-sm text-muted-foreground">
              Showing {jobListings.length} job opportunities
            </div>
          </CardFooter>
        </Card>

        {/* AI Job Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Available Jobs</CardTitle>
            <CardDescription>Browse all available job opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading jobs...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                {error}
              </div>
            ) : jobListings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No jobs found matching your criteria. Try adjusting your filters.
                      </div>
            ) : (
              <div className="space-y-6">
                {jobListings.map((job) => (
                  <div key={job._id} className="rounded-lg border p-6 hover:border-primary/40 transition-all">
                    <div className="flex flex-col md:flex-row md:items-start">
                      <div className="flex items-center">
                        <div className="h-14 w-14 rounded-md bg-primary/10 flex items-center justify-center mr-4">
                          <img 
                            src={job.company?.logo || "/placeholder.svg"} 
                            alt={job.company?.name || "Company"} 
                            className="h-10 w-10 rounded-md" 
                          />
                    </div>
                        <div>
                          <h3 className="font-medium text-lg">{job.title}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Building2 className="mr-1 h-4 w-4" /> {job.company?.name || "Company"}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-auto flex flex-wrap gap-2">
                        <Badge variant="outline">{job.type}</Badge>
                      </div>
                          </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-4 w-4" /> {job.location}
                          </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" />
                        {job.createdAt ? formatRelativeTime(job.createdAt) : "Recently"} • 
                        {job.applicationDeadline ? formatDeadline(job.applicationDeadline) : "No deadline"}
                          </div>
                        </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.skills && job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="font-medium">
                        {job.salary ? `${job.salary.currency || 'INR'} ${job.salary.min}-${job.salary.max}` : "Salary not specified"}
                      </div>
                      <div className="mt-4 sm:mt-0 flex gap-3">
                        <Button variant="outline" size="sm">
                          <Star className="mr-2 h-4 w-4" /> Save
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleOpenApplicationDialog(job)}
                        >
                          Apply Now <ArrowUpRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button variant="outline" className="mx-auto">
              View More Jobs
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Application Dialog */}
      <JobApplicationDialog
        open={applicationDialogOpen}
        onOpenChange={setApplicationDialogOpen}
        jobId={selectedJobId}
        jobTitle={selectedJobTitle}
        onSuccess={refreshJobListings}
      />
    </StudentDashboardLayout>
  )
}

