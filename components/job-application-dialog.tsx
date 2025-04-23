"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface JobApplicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string
  jobTitle: string
  onSuccess: () => void
}

export function JobApplicationDialog({ 
  open, 
  onOpenChange, 
  jobId, 
  jobTitle,
  onSuccess 
}: JobApplicationDialogProps) {
  const [coverLetter, setCoverLetter] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasResume, setHasResume] = useState(false)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [manualEmail, setManualEmail] = useState<string>("")
  const [showManualEmailInput, setShowManualEmailInput] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { data: session, status, update } = useSession()

  // Reset state when dialog opens and fetch student resume
  useEffect(() => {
    if (open) {
      setError(null)
      setStatusMessage(null)
      
      // Check if resume is in session first
      if (session?.user?.profile?.resumeUrl) {
        setHasResume(true)
        setResumeUrl(session.user.profile.resumeUrl)
        return
      }
      
      // Fetch student profile to check for resume
      const fetchStudentProfile = async () => {
        try {
          const response = await fetch('/api/student/profile')
          if (response.ok) {
            const data = await response.json()
            if (data.student && data.student.resumeUrl) {
              console.log("Student resume found:", data.student.resumeUrl)
              setHasResume(true)
              setResumeUrl(data.student.resumeUrl)
            } else {
              setHasResume(false)
              setResumeUrl(null)
              setError("Please upload your resume before applying")
              console.log("No resume found for student")
            }
          }
        } catch (err) {
          console.error("Error fetching student profile:", err)
          setHasResume(false)
          setResumeUrl(null)
        }
      }
      
      fetchStudentProfile()
    }
  }, [open, session])
  
  // Force a session update when the dialog opens to ensure fresh session data
  useEffect(() => {
    if (open) {
      const updateSession = async () => {
        console.log("Updating session before application submission");
        try {
          await update();
          console.log("Session updated successfully");
        } catch (err) {
          console.error("Error updating session:", err);
        }
      };
      
      updateSession();
    }
  }, [open, update]);

  // Custom error logger that won't log to console during expected fallbacks
  const safeErrorLog = (message: string, error: any, isFallbackScenario = false) => {
    // Only log to console if it's not an expected fallback or if it's the final error
    if (!isFallbackScenario) {
      console.error(message, error);
    }
    
    // Always store the error message for debugging
    const errorDetails = error instanceof Error ? error.message : String(error);
    return `${message}: ${errorDetails}`;
  };

  const handleApply = async () => {
    setIsSubmitting(true);
    setError(null);
    setStatusMessage("Preparing your application...");
    
    try {
      // Log detailed session information for debugging
      console.log("Current session state:", {
        status,
        isAuthenticated: status === "authenticated",
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        profileData: !!session?.user?.profile
      });

      // BYPASS SESSION CHECKS - Instead, directly check for user information using multiple methods
      let userInfo = null;
      
      // Method 1: Use the existing session if available
      if (session?.user?.email) {
        userInfo = {
          name: session.user.name,
          email: session.user.email,
          id: session.user.id,
          profile: session.user.profile || {}
        };
        console.log("Using existing session for user info");
      } 
      // Method 2: Direct API call to get session
      else {
        try {
          setStatusMessage("Checking your account...");
          const apiSession = await fetch('/api/auth/session').then(r => r.json());
          if (apiSession?.user?.email) {
            userInfo = {
              name: apiSession.user.name,
              email: apiSession.user.email,
              id: apiSession.user.id,
              profile: apiSession.user.profile || {}
            };
            console.log("Using direct API session for user info");
          }
        } catch (e) {
          console.error("Error getting session from API:", e);
        }
      }
      
      // Method 3: Try to get user from profile API
      if (!userInfo || !userInfo.email) {
        try {
          setStatusMessage("Retrieving your profile...");
          const profileResponse = await fetch('/api/student/profile');
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.student) {
              userInfo = {
                name: profileData.student.firstName + " " + (profileData.student.lastName || ""),
                email: profileData.student.email,
                id: profileData.student._id,
                profile: {
                  university: profileData.student.university,
                  degree: profileData.student.degree,
                  skills: profileData.student.skills || [],
                  resumeUrl: profileData.student.resumeUrl
                }
              };
              console.log("Using profile API for user info");
            }
          }
        } catch (profileError) {
          console.error("Error getting user from profile API:", profileError);
        }
      }
      
      // Final check - if we still don't have user info, let user manually provide email
      if (!userInfo || !userInfo.email) {
        // If the manual email input is already shown and has a value, use it
        if (showManualEmailInput && manualEmail && manualEmail.includes('@')) {
          userInfo = {
            name: "Applicant",
            email: manualEmail,
            id: null,
            profile: {}
          };
          console.log("Using manually entered email:", manualEmail);
        } else {
          // Show the manual email input and let the user try again
          setShowManualEmailInput(true);
          setStatusMessage(null);
          setIsSubmitting(false);
          throw new Error("We couldn't identify your account automatically. Please enter your email below and try again.");
        }
      }
      
      console.log("Successfully identified user:", userInfo.email);
      
      // Get resume URL either from state or from user info
      let finalResumeUrl = resumeUrl || userInfo.profile?.resumeUrl;
      
      // If still no resume, try the profile API specifically for resume
      if (!finalResumeUrl && userInfo.email) {
        try {
          setStatusMessage("Retrieving your resume...");
          // First try the direct resume API with the email
          const resumeResponse = await fetch(`/api/student/resume?email=${encodeURIComponent(userInfo.email)}`);
          if (resumeResponse.ok) {
            const resumeData = await resumeResponse.json();
            if (resumeData.success && resumeData.resumeUrl) {
              finalResumeUrl = resumeData.resumeUrl;
              console.log("Retrieved resume URL from resume API:", finalResumeUrl);
              
              // If we got the resume but didn't have the name, use the one from the API
              if (!userInfo.name && resumeData.studentName) {
                userInfo.name = resumeData.studentName;
              }
            }
          } else {
            // If the GET request fails, try a POST request with the email in the body
            const postResponse = await fetch('/api/student/resume', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email: userInfo.email })
            });
            
            if (postResponse.ok) {
              const postData = await postResponse.json();
              if (postData.success && postData.resumeUrl) {
                finalResumeUrl = postData.resumeUrl;
                console.log("Retrieved resume URL from POST resume API:", finalResumeUrl);
                
                // If we got the resume but didn't have the name, use the one from the API
                if (!userInfo.name && postData.studentName) {
                  userInfo.name = postData.studentName;
                }
              }
            }
          }
        } catch (resumeError) {
          console.error("Error fetching resume:", resumeError);
        }
      }

      // Check if we have a resume URL after all attempts
      if (!finalResumeUrl) {
        setError("Please upload your resume before applying");
        setStatusMessage(null);
        toast({
          title: "Resume Required",
          description: "Please upload your resume before applying for this job",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Submitting application for job:", jobId);
      console.log("Using resume URL:", finalResumeUrl);
      
      // Gather student data from our verified user info
      const studentData = {
        jobId: jobId,
        coverLetter: coverLetter,
        resumeUrl: finalResumeUrl,
        studentName: userInfo.name || "",
        studentEmail: userInfo.email || "",
        userId: userInfo.id || null
      };
      
      console.log("Application data being sent:", studentData);
      
      // Use our new simplified API endpoint
      const endpoint = '/api/applications/apply';
      
      // Add timeout to handle unresponsive API
      const controller = new AbortController();
      let timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      // Log session state for debugging authentication issues
      console.log("Session state before applying:", 
        status, 
        session ? "session exists" : "no session", 
        session?.user?.email ? `user: ${session.user.email}` : "no user email"
      );

      try {
        // Reset timeout for each attempt
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => controller.abort(), 15000);
        
        setStatusMessage("Submitting your application...");
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(studentData),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Handle specific error status codes
        if (response.status === 503) {
          // Don't log to console for expected fallback
          const logMessage = safeErrorLog(`Server unavailable (503) for ${endpoint}`, 
            { message: "Service unavailable" }, false);
          
          throw new Error("The server is currently unavailable. Please try again in a few minutes.");
        } else if (response.status === 401) {
          // Authentication error - try to get more details
          let errorDetails = "Authentication required";
          try {
            const errorResponse = await response.json();
            errorDetails = errorResponse.error || errorDetails;
            console.log(`Authentication error details:`, errorResponse);
          } catch (e) {
            console.log(`Unable to parse authentication error details`);
          }
          
          // Try to update the session one more time
          try {
            setStatusMessage("Trying to refresh your session...");
            await update();
            console.log("Session refreshed after 401 error");
            
            // If we're still here, throw a more specific error
            throw new Error(`Authentication failed after session refresh. Please try signing out and back in.`);
          } catch (refreshError) {
            console.error("Failed to refresh session after 401:", refreshError);
            throw new Error(`Authentication error: ${errorDetails}. Please sign out and sign in again.`);
          }
        }
        
        if (!response.ok && !response.status.toString().startsWith('2')) {
          let errorMessage = `Server responded with status: ${response.status}`;
          
          // Try to get more detailed error information
          try {
            const errorResponse = await response.clone().json();
            if (errorResponse.error) {
              errorMessage = `${errorMessage} - ${errorResponse.error}`;
            }
          } catch (parseError) {
            // Could not parse JSON, continue with basic error message
          }
          
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log(`Application response:`, result);
        
        if (result.success) {
          console.log(`Application submitted successfully`);
          
          if (result.duplicate) {
            toast({
              title: "Already Applied",
              description: "You have already applied for this job.",
              variant: "default",
            });
          } else {
            toast({
              title: "Application Submitted",
              description: "Your application has been submitted successfully!",
              variant: "default",
            });
          }
          onOpenChange(false);
          onSuccess();
          return; // Exit the function on success
        } else {
          // Handle application error
          const error = new Error(result.error || "Failed to submit application");
          safeErrorLog(`Application error:`, error, false);
          throw error;
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          safeErrorLog(`Request timed out`, error, false);
          throw new Error("The request timed out. Please check your connection and try again.");
        } else if (error.message.includes("503") || error.message.includes("unavailable")) {
          throw new Error("The server is currently unavailable. This might be due to high traffic or database maintenance. Please try again in a few minutes.");
        } else {
          safeErrorLog(`Error submitting application`, error, false);
          throw error; // Re-throw for the outer catch block
        }
      }
    } catch (err: any) {
      // This is the final error, so always log it
      console.error("Error applying for job:", err);
      
      // Provide more specific error messages based on the error
      if (err.message.includes("503") || err.message.includes("unavailable") || err.message.includes("database issues")) {
        setError("The server is currently unavailable. This might be due to high traffic or database maintenance. Please try again in a few minutes.");
        toast({
          title: "Server Unavailable",
          description: "Our servers are experiencing high traffic. Please try again in a few minutes.",
          variant: "destructive",
        });
      } else if (err.message.includes("401") || err.message.includes("Authentication")) {
        setError("You need to be signed in to apply for this job. Your session may have expired.");
        toast({
          title: "Authentication Required",
          description: "Please sign out and sign in again to restore your session.",
          variant: "destructive",
        });
        
        // Attempt to update the session
        try {
          await update();
          console.log("Session updated after authentication error");
        } catch (sessionError) {
          console.error("Failed to update session:", sessionError);
        }
      } else {
        setError(err.message || "An unexpected error occurred");
        toast({
          title: "Application Error",
          description: "There was a problem submitting your application. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
      setStatusMessage(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Submit your application with an optional cover letter. Your resume will be attached automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {hasResume ? (
            <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Resume ready to be attached
            </div>
          ) : (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
              <p className="font-medium">Resume Required</p>
              <p className="text-xs mt-1">Please upload your resume in your profile before applying.</p>
              <Button 
                variant="link" 
                className="text-xs p-0 h-auto mt-1"
                onClick={() => router.push('/student/resume')}
              >
                Go to Resume Page
              </Button>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
            <Textarea
              id="coverLetter"
              placeholder="Write a brief cover letter explaining why you're a good fit for this position..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-[150px]"
            />
            <p className="text-xs text-muted-foreground">
              Your resume will be attached automatically from your profile.
            </p>
          </div>
          
          {statusMessage && (
            <div className="text-sm text-blue-600 flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
              <Loader2 className="h-4 w-4 animate-spin" />
              {statusMessage}
            </div>
          )}
          
          {showManualEmailInput && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
              <Label htmlFor="manualEmail" className="text-sm font-medium mb-2 block text-yellow-800">
                Enter your email address
              </Label>
              <div className="flex gap-2 items-center">
                <input
                  id="manualEmail"
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="your.email@example.com"
                  disabled={isSubmitting}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (manualEmail && manualEmail.includes('@')) {
                      setShowManualEmailInput(false);
                      handleApply();
                    } else {
                      toast({
                        title: "Valid Email Required",
                        description: "Please enter a valid email address",
                        variant: "destructive"
                      });
                    }
                  }}
                  disabled={!manualEmail || !manualEmail.includes('@') || isSubmitting}
                >
                  Use Email
                </Button>
              </div>
              <p className="text-xs mt-2 text-yellow-700">
                This will be used to identify your application. Make sure it matches the email you used to sign up.
              </p>
            </div>
          )}
          
          {error && (
            <div className="text-sm text-destructive bg-red-50 p-2 rounded border border-red-200">
              {error}
              {(error.includes("Authentication") || error.includes("signed in") || error.includes("sign in") || error.includes("identify")) ? (
                <div className="mt-2 space-y-2">
                  <p className="text-xs font-medium">Try these options:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-7"
                      onClick={async () => {
                        try {
                          setStatusMessage("Refreshing session...");
                          await update();
                          setError(null);
                          toast({ 
                            title: "Session Refreshed", 
                            description: "Please try applying again." 
                          });
                        } catch (e) {
                          console.error("Failed to refresh session:", e);
                          toast({ 
                            title: "Session Refresh Failed", 
                            description: "Please try signing out and back in.",
                            variant: "destructive"
                          });
                        } finally {
                          setStatusMessage(null);
                        }
                      }}
                    >
                      Refresh Session
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="text-xs h-7"
                      onClick={() => {
                        // Redirect to sign-in page, which will then redirect back to current page
                        const currentPath = window.location.pathname + window.location.search;
                        router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`);
                      }}
                    >
                      Sign In
                    </Button>
                    {!showManualEmailInput && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="text-xs h-7"
                        onClick={() => {
                          setShowManualEmailInput(true);
                          setError(null);
                        }}
                      >
                        Enter Email Manually
                      </Button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApply}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                "Applying..."
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 