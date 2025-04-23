"use client"

import { useState, useEffect } from "react"
import RecruiterDashboardLayout from "@/components/recruiter-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  Filter,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  MapPin,
  Briefcase,
  DollarSign,
  User,
  Mail
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ApplicationsPage() {
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        
        // Use our dedicated endpoint for recruiter applications
        const response = await fetch('/api/recruiter/applications')
        
        if (!response.ok) {
          throw new Error('Failed to fetch applications')
        }
        
        const data = await response.json()
        console.log('Applications data:', data);
        setApplications(data.applications || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching applications:', err)
        setError('Failed to load applications. Please try again later.')
        toast({
          title: "Error",
          description: "Failed to load applications. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchApplications()
  }, [toast])

  // Helper function for status badge styles
  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case "selected":
        return "bg-primary/10 text-primary hover:bg-primary/20"
      case "interview":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100"
      case "rejected":
        return "bg-destructive/10 text-destructive hover:bg-destructive/20"
      case "pending":
      default:
        return "bg-secondary hover:bg-secondary/80"
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "selected":
        return <CheckCircle2 className="h-4 w-4 text-primary" />
      case "interview":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />
      case "pending":
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  // Handle application status update
  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update application status')
      }

      // Update local state
      setApplications(applications.map(app => 
        app._id === applicationId 
          ? { ...app, status: newStatus }
          : app
      ))

      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating application status:', error)
      toast({
        title: "Error",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <RecruiterDashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
            <p className="text-muted-foreground">Review and manage job applications</p>
          </div>
          <div className="flex gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search applications..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                try {
                  // Try alternative API endpoints for debugging
                  const debugResponse = await fetch('/api/utils/check-applications');
                  const debugData = await debugResponse.json();
                  console.log('Debug data:', debugData);
                  
                  toast({
                    title: "Debug Info",
                    description: `Found ${debugData.applicationCount} total applications`,
                  });
                  
                  // Attempt to load applications from the debug API
                  const directResponse = await fetch('/api/jobs/debug-applications');
                  const directData = await directResponse.json();
                  if (directData.applications && directData.applications.length > 0) {
                    console.log('Direct applications data:', directData);
                    setApplications(directData.applications);
                    toast({
                      title: "Applications Loaded",
                      description: `Loaded ${directData.applications.length} applications directly`,
                    });
                  }
                } catch (err) {
                  console.error('Debug error:', err);
                }
              }}
            >
              Debug
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>View and manage all job applications</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading applications...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-destructive">
                  {error}
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No applications received yet.
                </div>
              ) : (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {applications.map(app => (
                      <div 
                        key={app._id} 
                        className={`rounded-lg border p-4 cursor-pointer transition-all ${
                          selectedApplication?._id === app._id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-primary/40'
                        }`}
                        onClick={() => setSelectedApplication(app)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{app.student?.name || "Applicant"}</h3>
                              <p className="text-sm text-muted-foreground">{app.job?.title || "Job Title"}</p>
                            </div>
                          </div>
                          <Badge className={getStatusBadgeStyles(app.status)}>
                            {getStatusIcon(app.status)}
                            <span className="ml-1 capitalize">{app.status}</span>
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-4 w-4" /> Applied on {formatDate(app.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
              <CardDescription>
                {selectedApplication 
                  ? `Review application from ${selectedApplication.student?.name || "this applicant"}`
                  : "Select an application to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedApplication ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Application Selected</h3>
                  <p className="text-muted-foreground mt-1">
                    Select an application from the list to view details
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{selectedApplication.student?.name || "Applicant"}</h3>
                        <p className="text-muted-foreground">{selectedApplication.job?.title || "Job Title"}</p>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeStyles(selectedApplication.status)}>
                      {getStatusIcon(selectedApplication.status)}
                      <span className="ml-1 capitalize">{selectedApplication.status}</span>
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Applicant Information</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm">{selectedApplication.student?.email || "N/A"}</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Resume</p>
                        <Button variant="link" className="h-auto p-0">
                          <FileText className="mr-2 h-4 w-4" /> View Resume
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Application Timeline</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </div>
                        <div>
                          <p className="font-medium">Application Submitted</p>
                          <p className="text-sm text-muted-foreground">{formatDate(selectedApplication.createdAt)}</p>
                        </div>
                      </div>
                      
                      {selectedApplication.status !== "pending" && (
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                          </div>
                          <div>
                            <p className="font-medium">Application {selectedApplication.status === "rejected" ? "Rejected" : "Reviewed"}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(selectedApplication.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedApplication.status === "interview" && (
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                          </div>
                          <div>
                            <p className="font-medium">Interview Scheduled</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedApplication.interviewDate 
                                ? formatDate(selectedApplication.interviewDate) 
                                : "Date to be confirmed"}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {selectedApplication.status === "selected" && (
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                          </div>
                          <div>
                            <p className="font-medium">Offer Extended</p>
                            <p className="text-sm text-muted-foreground">{formatDate(selectedApplication.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Update Status</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusUpdate(selectedApplication._id, "interview")}
                        disabled={selectedApplication.status === "interview"}
                      >
                        Schedule Interview
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusUpdate(selectedApplication._id, "selected")}
                        disabled={selectedApplication.status === "selected"}
                      >
                        Select Candidate
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusUpdate(selectedApplication._id, "rejected")}
                        disabled={selectedApplication.status === "rejected"}
                      >
                        Reject Application
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              {selectedApplication && (
                <div className="flex w-full justify-between">
                  <Button variant="outline">
                    <Mail className="mr-2 h-4 w-4" /> Send Email
                  </Button>
                  <Button>
                    <FileText className="mr-2 h-4 w-4" /> View Full Profile
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </RecruiterDashboardLayout>
  )
} 