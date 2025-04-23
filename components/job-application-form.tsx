"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { FileText, CheckCircle, AlertCircle, Loader2, CheckCircle2, Upload } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function JobApplicationForm({
  jobId,
  jobTitle,
  open,
  onOpenChange,
  onSuccess
}: JobApplicationFormProps) {
  // Form state
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<{url: string | null, loading: boolean}>({
    url: null,
    loading: true
  });
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();

  // Add state for manual email entry
  const [manualEmail, setManualEmail] = useState<string>("");
  const [manualName, setManualName] = useState<string>("");
  const [showEmailField, setShowEmailField] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchUserProfile = async () => {
      if (!open || !session?.user?.email) return;
      
      try {
        setResumeData(prev => ({ ...prev, loading: true }));
        const response = await fetch(`/api/students/profile`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Your student profile was not found. Please complete your profile first.');
            return;
          }
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setResumeData({
            url: data.resumeUrl || null,
            loading: false
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (isMounted) {
          setError('Failed to fetch your profile. Please try again.');
          setResumeData(prev => ({ ...prev, loading: false }));
        }
      }
    };

    fetchUserProfile();
    
    return () => {
      isMounted = false;
    };
  }, [open, session?.user?.email]);

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      if (!session?.user?.email) {
        setShowEmailField(true);
      } else {
        setShowEmailField(false);
      }
    };
    
    checkSession();
  }, [session]);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      const email = session?.user?.email || manualEmail;
      const name = session?.user?.name || manualName;
      
      // Validate email if not logged in
      if (showEmailField && (!manualEmail || !manualEmail.includes('@'))) {
        setError("Please enter a valid email address");
        setIsSubmitting(false);
        return;
      }
      
      // Prepare application data with fields that match MongoDB models
      const applicationData = {
        jobId, // This will be mapped to the 'job' field in the MongoDB model
        coverLetter,
        resumeUrl: resumeData.url,
        userEmail: email,
        userName: name
      };
      
      const response = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific error codes
        if (data.code === 'MISSING_RESUME') {
          // Save current state and redirect to resume upload
          localStorage.setItem('pendingApplication', JSON.stringify({
            jobId,
            jobTitle,
            coverLetter
          }));
          
          toast({
            title: "Resume Required",
            description: "You need to upload a resume before applying. Redirecting you to upload page...",
            duration: 5000,
          });
          
          // Close dialog and redirect to profile page to upload resume
          onOpenChange(false);
          router.push('/profile?resume=missing');
          return;
        }
        
        if (data.code === 'AUTH_REQUIRED') {
          toast({
            title: "Authentication Required",
            description: "Please login to apply for jobs",
            duration: 5000,
          });
          
          onOpenChange(false);
          router.push('/login?redirect=' + encodeURIComponent(`/jobs/${jobId}`));
          return;
        }
        
        if (data.code === 'ALREADY_APPLIED') {
          toast({
            title: "Already Applied",
            description: "You have already applied for this job",
            variant: "default",
            duration: 5000,
          });
          
          onOpenChange(false);
          return;
        }
        
        throw new Error(data.error || 'Failed to apply for the job');
      }
      
      // Success
      toast({
        title: "Application Submitted!",
        description: "Your job application was successfully submitted.",
        duration: 5000,
      });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
    } catch (err: any) {
      console.error('Application error:', err);
      
      // Check if the error is related to authentication
      if (err.message?.includes('Authentication') || err.message?.includes('login')) {
        toast({
          title: "Authentication Required",
          description: "Please login to apply for jobs",
          duration: 5000,
        });
        
        onOpenChange(false);
        router.push('/login?redirect=' + encodeURIComponent(`/jobs/${jobId}`));
        return;
      }
      
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const redirectToResumeUpload = () => {
    // Save current state
    localStorage.setItem('pendingApplication', JSON.stringify({
      jobId,
      jobTitle,
      coverLetter
    }));
    
    // Close dialog and redirect
    onOpenChange(false);
    router.push('/profile?resume=upload');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Complete your application to apply for this position.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4 py-4">
          {showEmailField && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" className="font-medium">
                  Your Name
                </Label>
                <input
                  id="name"
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium required">
                  Your Email <span className="text-red-500">*</span>
                </Label>
                <input
                  id="email"
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your email address"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  We'll use this email to contact you about your application.
                </p>
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="resume" className="font-medium">
              Resume
            </Label>
            
            {resumeData.loading ? (
              <div className="text-sm text-muted-foreground">Loading your resume...</div>
            ) : resumeData.url ? (
              <Alert variant="default" className="bg-muted/50">
                <FileText className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2">
                  Resume Ready <CheckCircle2 className="h-4 w-4 text-green-500" />
                </AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground">
                  Your resume will be automatically included with this application.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive" className="bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Resume Found</AlertTitle>
                <AlertDescription className="text-xs">
                  You need to upload a resume before applying.
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={redirectToResumeUpload}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Resume
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cover-letter" className="font-medium">
              Cover Letter (Optional)
            </Label>
            <Textarea
              id="cover-letter"
              placeholder="Explain why you're a good fit for this position..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleSubmit} 
            disabled={
              isSubmitting || 
              resumeData.loading || 
              !resumeData.url || 
              (showEmailField && (!manualEmail || !manualEmail.includes('@')))
            }
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 