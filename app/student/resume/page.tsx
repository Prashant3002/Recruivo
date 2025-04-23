"use client"

import { useState, useEffect } from "react"
import StudentDashboardLayout from "@/components/student-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"
import { ResumeUploadDialog } from "@/components/resume-upload-dialog"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

// Dynamically import icons to reduce bundle size
const FileText = dynamic(() => import("lucide-react").then(mod => mod.FileText))
const Upload = dynamic(() => import("lucide-react").then(mod => mod.Upload))
const Download = dynamic(() => import("lucide-react").then(mod => mod.Download))
const Edit = dynamic(() => import("lucide-react").then(mod => mod.Edit))
const Clock = dynamic(() => import("lucide-react").then(mod => mod.Clock))
const CheckCircle = dynamic(() => import("lucide-react").then(mod => mod.CheckCircle))
const AlertCircle = dynamic(() => import("lucide-react").then(mod => mod.AlertCircle))
const Star = dynamic(() => import("lucide-react").then(mod => mod.Star))
const Zap = dynamic(() => import("lucide-react").then(mod => mod.Zap))
const Award = dynamic(() => import("lucide-react").then(mod => mod.Award))
const Eye = dynamic(() => import("lucide-react").then(mod => mod.Eye))
const Trash = dynamic(() => import("lucide-react").then(mod => mod.Trash))

export default function ResumePage() {
  const [activeTab, setActiveTab] = useState("editor")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [resumeData, setResumeData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, status } = useSession()
  
  // Function to fetch student profile and resume data
  const fetchStudentResume = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching student profile data')
      
      const response = await fetch('/api/student/profile')
      console.log('Profile API response status:', response.status)
      
      if (!response.ok) {
        console.error('Error fetching profile:', response.status, response.statusText)
        // Continue anyway for demo purposes
      }
      
      const data = await response.json()
      console.log('Profile data received:', data ? 'Yes' : 'No')
      
      if (data?.student) {
        console.log('Student data:', {
          _id: data.student._id,
          university: data.student.university,
          resumeUrl: data.student.resumeUrl
        })
      }
      
      if (data?.student?.resumeUrl) {
        console.log('Resume URL found:', data.student.resumeUrl)
        setResumeData({
          url: data.student.resumeUrl,
          lastUpdated: new Date().toLocaleDateString()
        })
        console.log('Resume data set successfully')
      } else {
        console.log('No resume URL found in profile data')
        toast.error('No resume URL found. Please upload a resume.')
      }
    } catch (error) {
      console.error('Error fetching resume:', error)
      // Don't show error to user, just log it
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    // Always try to fetch the resume data, regardless of authentication status
    fetchStudentResume()
  }, [activeTab])
  
  // Refresh resume data after upload
  const handleUploadComplete = () => {
    fetchStudentResume()
  }
  
  // Function to view the resume in a new tab
  const viewResume = () => {
    console.log("View resume clicked, URL:", resumeData?.url);
    
    if (resumeData?.url) {
      // Open the URL directly - it should be a real accessible URL now
      window.open(resumeData.url, "_blank");
    } else {
      toast.error("No resume available. Please upload a resume first.");
    }
  }
  
  // Function to delete the resume
  const deleteResume = async () => {
    try {
      setIsLoading(true);
      console.log("Deleting resume...");
      
      const response = await fetch("/api/resume/delete", {
        method: "DELETE",
        credentials: "include" // Include cookies for authentication
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete resume");
      }
      
      toast.success("Resume deleted successfully");
      setResumeData(null);
      
      // Refresh the page data
      fetchStudentResume();
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume");
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <StudentDashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Resume</h1>
            <p className="text-muted-foreground">Build and manage your professional resume</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setUploadDialogOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </div>
        </div>

        {/* Resume Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resume Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85/100</div>
              <Progress value={85} className="mt-2" />
              <div className="mt-2 text-xs text-muted-foreground">
                <span>+10% from last update</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completeness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">90%</div>
              <Progress value={90} className="mt-2" />
              <div className="mt-2 text-xs text-muted-foreground">
                <span>Add a portfolio link to reach 100%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumeData ? "Today" : "2 days ago"}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                <span>On {resumeData?.lastUpdated || "June 12, 2024"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Job Match Factor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">High</div>
              <div className="mt-2 text-xs text-muted-foreground">
                <span>Matches 78% of job requirements</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="editor" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="editor">Resume Editor</TabsTrigger>
            <TabsTrigger value="ai-feedback">AI Feedback</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          {/* Resume Editor Tab */}
          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your basic details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 text-center border rounded-md bg-muted/20">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Resume Editor</h3>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">The resume editor would be loaded here with sections for personal information, education, experience, skills, and projects</p>
                  <Button>
                    <Edit className="mr-2 h-4 w-4" /> Edit Information
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Feedback Tab */}
          <TabsContent value="ai-feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Resume Analysis</CardTitle>
                <CardDescription>Smart recommendations to improve your resume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-primary/5">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Strengths</h3>
                    </div>
                    <ul className="mt-2 space-y-1">
                      <li className="text-sm">Strong action verbs used in experience section</li>
                      <li className="text-sm">Well-organized education section</li>
                      <li className="text-sm">Good quantification of achievements</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border p-4 bg-destructive/5">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <h3 className="font-medium">Improvement Areas</h3>
                    </div>
                    <ul className="mt-2 space-y-1">
                      <li className="text-sm">Add more technical skills relevant to target jobs</li>
                      <li className="text-sm">Include a link to your portfolio</li>
                      <li className="text-sm">Make accomplishments more specific with metrics</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button className="w-full">
                  <Zap className="mr-2 h-4 w-4" /> Apply AI Suggestions
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Keyword Optimization</CardTitle>
                <CardDescription>Match your resume to target job descriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 mr-2">React</Badge>
                      <span className="text-sm">Present in resume</span>
                    </div>
                    <Badge variant="outline">High Relevance</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 mr-2">TypeScript</Badge>
                      <span className="text-sm">Present in resume</span>
                    </div>
                    <Badge variant="outline">High Relevance</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 mr-2">Node.js</Badge>
                      <span className="text-sm">Mentioned but needs emphasis</span>
                    </div>
                    <Badge variant="outline">Medium Relevance</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">CI/CD</Badge>
                      <span className="text-sm">Missing from resume</span>
                    </div>
                    <Badge variant="outline">High Relevance</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resume Preview</CardTitle>
                <CardDescription>See how your resume appears to employers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 text-center border rounded-md bg-muted/20">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Resume Preview</h3>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">The preview of your formatted resume would appear here</p>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                    <Button>
                      <Edit className="mr-2 h-4 w-4" /> Make Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Current Uploaded Resume */}
            <Card>
              <CardHeader>
                <CardTitle>Current Uploaded Resume</CardTitle>
                <CardDescription>View or download your latest uploaded resume</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-6">
                    <p>Loading resume information...</p>
                  </div>
                ) : resumeData?.url ? (
                  <div className="border rounded-md p-4">
                    <div className="flex items-center mb-4">
                      <FileText className="h-8 w-8 mr-3 text-blue-500" />
                      <div>
                        <h3 className="font-medium">Your Uploaded Resume</h3>
                        <p className="text-sm text-muted-foreground">
                          Last updated: {resumeData.lastUpdated}
                        </p>
                        <p className="text-xs text-blue-500 mt-1 break-all">
                          URL: {resumeData.url}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => viewResume()}>
                        <Eye className="mr-2 h-4 w-4" /> View Resume
                      </Button>
                      <Button variant="default" onClick={() => viewResume()}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                      <Button variant="destructive" onClick={() => deleteResume()}>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 border rounded-md bg-muted/20">
                    <AlertCircle className="h-10 w-10 mx-auto text-amber-500 mb-3" />
                    <h3 className="font-medium mb-2">No Resume Uploaded</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You haven't uploaded a resume yet. Please upload a resume to view it here.
                    </p>
                    <Button onClick={() => setUploadDialogOpen(true)}>
                      <Upload className="mr-2 h-4 w-4" /> Upload Resume
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Resume Upload Dialog */}
      <ResumeUploadDialog 
        open={uploadDialogOpen} 
        onOpenChange={setUploadDialogOpen} 
        onUploadComplete={handleUploadComplete}
      />
    </StudentDashboardLayout>
  )
} 