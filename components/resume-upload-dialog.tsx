"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useFileUpload } from "@/lib/hooks"
import { Progress } from "@/components/ui/progress"
import { useSession } from "next-auth/react"

// Dynamically import icons to reduce bundle size
const FileText = dynamic(() => import("lucide-react").then(mod => mod.FileText))
const Upload = dynamic(() => import("lucide-react").then(mod => mod.Upload))
const AlertCircle = dynamic(() => import("lucide-react").then(mod => mod.AlertCircle))

interface ResumeUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete?: () => void
}

export function ResumeUploadDialog({ open, onOpenChange, onUploadComplete }: ResumeUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { data: session, status } = useSession()
  
  const { isUploading, error, progress, validateFile, uploadFile } = useFileUpload({
    acceptedFileTypes: ['application/pdf'],
    maxSizeMB: 5
  })

  // Debug log when dialog opens/closes
  useEffect(() => {
    if (open) {
      console.log("Resume upload dialog opened");
      console.log("Session status:", status);
      console.log("Session user:", session?.user?.email);
    }
  }, [open, session, status]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedFile(file)
      console.log("File selected:", file.name, file.type, file.size);
      
      // Validate file immediately upon selection
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error || "Invalid file");
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload")
      return
    }

    console.log("Starting upload process");
    console.log("Session status:", status);
    console.log("File details:", selectedFile.name, selectedFile.type, selectedFile.size);
    
    try {
      // Create form data to include the actual file
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileName', selectedFile.name);
      formData.append('fileSize', selectedFile.size.toString());
      formData.append('contentType', selectedFile.type);
      
      console.log("Form data prepared with file");
      
      // Use the existing uploadFile function to manage the upload state
      // This will handle isUploading state internally
      await uploadFile(selectedFile); // Just to set progress indicators
      
      // Send the actual file to the API
      console.log("Uploading file to /api/resume/upload endpoint");
      const response = await fetch(`/api/resume/upload`, {
        method: "POST",
        body: formData,
        credentials: "include" // Include cookies for authentication
      });

      console.log("API response status:", response.status);
      console.log("API response headers:", Object.fromEntries([...response.headers.entries()]));
      
      // Check if the response is OK
      if (!response.ok) {
        // Try to parse the error as JSON, but handle gracefully if it's not JSON
        let errorMessage = "Failed to upload resume";
        try {
          const contentType = response.headers.get("content-type");
          console.log("Response content-type:", contentType);
          
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            console.log("Error data from API:", errorData);
            errorMessage = errorData.error || errorMessage;
          } else {
            // If not JSON, just get text
            const errorText = await response.text();
            console.error("Non-JSON error response:", errorText);
            errorMessage = `Server error (${response.status}): ${errorText.substring(0, 100)}...`;
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
        }
        throw new Error(errorMessage);
      }

      try {
        // Parse the successful response
        const result = await response.json();
        console.log("API success response:", result);
        
        toast.success("Resume uploaded successfully")
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        router.refresh()
        onOpenChange(false)
        if (onUploadComplete) {
          onUploadComplete()
        }
      } catch (jsonError) {
        console.error("Error parsing success response:", jsonError);
        throw new Error("Error processing server response");
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload resume")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Resume</DialogTitle>
          <DialogDescription>
            Upload your resume in PDF format. This will be used for job applications.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {selectedFile ? (
            <div className="flex items-center p-4 border rounded-md">
              <FileText className="h-6 w-6 mr-2 text-blue-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}
              >
                Change
              </Button>
            </div>
          ) : (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="resume">Resume</Label>
              <Input
                id="resume"
                type="file"
                ref={fileInputRef}
                accept="application/pdf"
                onChange={handleFileSelect}
              />
              <p className="text-xs text-muted-foreground">
                Accepted format: PDF (max 5MB)
              </p>
            </div>
          )}

          {!selectedFile && !isUploading && (
            <div className="flex items-center p-4 border border-dashed rounded-md bg-muted/50 justify-center">
              <div className="flex flex-col items-center space-y-2 text-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Drag and drop your file</p>
                  <p className="text-xs text-muted-foreground">
                    or click the input above to select a file
                  </p>
                </div>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          <div className="rounded-md bg-amber-50 p-4">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-amber-800 mr-2" />
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Files are stored in Google Drive for this demo application.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? `Uploading (${Math.round(progress)}%)` : "Upload Resume"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 