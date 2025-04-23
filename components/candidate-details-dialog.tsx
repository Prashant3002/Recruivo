"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Briefcase, 
  Calendar, 
  Award, 
  BookOpen, 
  FileText, 
  Star,
  CheckCircle
} from "lucide-react"

interface CandidateDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: {
    id: string
    name: string
    email: string
    jobTitle?: string
    skills: string[]
    experience?: string
    education?: string
    resumeScore: number
    matchScore: number
    appliedDate: Date
    status: string
    resume?: string
  } | null
  onViewResume?: (resumeUrl: string) => void
}

export function CandidateDetailsDialog({
  open,
  onOpenChange,
  candidate,
  onViewResume
}: CandidateDetailsDialogProps) {
  // Format date
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (!candidate) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Candidate Details</DialogTitle>
          <DialogDescription>
            Detailed profile information for this candidate
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Name</h3>
            </div>
            <p className="text-sm pl-6">{candidate.name}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Email</h3>
            </div>
            <p className="text-sm pl-6">{candidate.email}</p>
          </div>
          
          {candidate.jobTitle && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Job Title</h3>
              </div>
              <p className="text-sm pl-6">{candidate.jobTitle}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Skills</h3>
            </div>
            <div className="pl-6 flex flex-wrap gap-1">
              {candidate.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>
          
          {candidate.experience && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Experience</h3>
              </div>
              <p className="text-sm pl-6">{candidate.experience}</p>
            </div>
          )}
          
          {candidate.education && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Education</h3>
              </div>
              <p className="text-sm pl-6">{candidate.education}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Resume Score</h3>
            </div>
            <div className="pl-6">
              <Badge variant="outline" className={`${
                candidate.resumeScore >= 90 ? "text-green-500 border-green-500" : 
                candidate.resumeScore >= 75 ? "text-amber-500 border-amber-500" : 
                "text-red-500 border-red-500"
              }`}>
                {candidate.resumeScore}%
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Match Score</h3>
            </div>
            <div className="pl-6">
              <Badge variant="outline" className={`${
                candidate.matchScore >= 90 ? "text-green-500 border-green-500" : 
                candidate.matchScore >= 75 ? "text-amber-500 border-amber-500" : 
                "text-red-500 border-red-500"
              }`}>
                {candidate.matchScore}%
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Applied On</h3>
            </div>
            <p className="text-sm pl-6">{formatDate(candidate.appliedDate)}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Status</h3>
            </div>
            <div className="pl-6">
              <Badge variant="outline" className={`${
                candidate.status === "Approved" ? "text-green-500 border-green-500" :
                candidate.status === "Pending" ? "text-yellow-500 border-yellow-500" :
                candidate.status === "Rejected" ? "text-red-500 border-red-500" :
                "text-blue-500 border-blue-500"
              }`}>
                {candidate.status}
              </Badge>
            </div>
          </div>
          
          {candidate.resume && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Resume</h3>
              </div>
              <div className="pl-6">
                <div className="border rounded-md p-4 bg-muted/10">
                  <div className="flex items-center mb-4">
                    <FileText className="h-8 w-8 mr-3 text-blue-500" />
                    <div>
                      <h3 className="font-medium">Uploaded Resume</h3>
                      <p className="text-xs text-muted-foreground mt-1">Resume URL:</p>
                      <a 
                        href={candidate.resume} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 underline break-all"
                      >
                        {candidate.resume}
                      </a>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => {
                        console.log("Resume view button clicked in dialog");
                        if (candidate.resume) {
                          console.log("Opening resume URL:", candidate.resume);
                          // Open in a new tab directly
                          const newTab = window.open(candidate.resume, '_blank');
                          if (!newTab && onViewResume) {
                            // If popup blocked, try the callback
                            onViewResume(candidate.resume);
                          }
                        } else {
                          console.error("No resume URL available");
                        }
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Resume
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 