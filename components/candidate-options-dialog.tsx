"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { 
  Download, 
  Calendar, 
  Mail, 
  Star, 
  XCircle, 
  FileText 
} from "lucide-react"

interface CandidateOptionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: {
    id: string
    name: string
    email: string
    resume?: string
  } | null
  onOptionSelect: (option: string) => void
}

export function CandidateOptionsDialog({
  open,
  onOpenChange,
  candidate,
  onOptionSelect
}: CandidateOptionsDialogProps) {
  if (!candidate) return null

  const options = [
    {
      id: "download-resume",
      label: "Download Resume",
      icon: <Download className="h-4 w-4 mr-2" />,
      description: "Download the candidate's resume file"
    },
    {
      id: "schedule-interview",
      label: "Schedule Interview",
      icon: <Calendar className="h-4 w-4 mr-2" />,
      description: "Set up an interview appointment with the candidate"
    },
    {
      id: "send-email",
      label: "Send Email",
      icon: <Mail className="h-4 w-4 mr-2" />,
      description: "Send a direct email to the candidate"
    },
    {
      id: "shortlist",
      label: "Add to Shortlist",
      icon: <Star className="h-4 w-4 mr-2" />,
      description: "Add this candidate to your shortlist"
    },
    {
      id: "reject",
      label: "Reject Candidate",
      icon: <XCircle className="h-4 w-4 mr-2" />,
      description: "Mark this candidate as rejected"
    },
    {
      id: "view-application",
      label: "View Application Details",
      icon: <FileText className="h-4 w-4 mr-2" />,
      description: "See complete application information"
    }
  ]

  const handleSelect = (optionId: string) => {
    onOptionSelect(optionId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Options for {candidate.name}</DialogTitle>
          <DialogDescription>
            Select an action to perform for this candidate
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {options.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className="justify-start h-auto py-3 px-4"
              onClick={() => handleSelect(option.id)}
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center">
                  {option.icon}
                  <span className="font-medium">{option.label}</span>
                </div>
                <span className="text-xs text-muted-foreground ml-6 mt-1">
                  {option.description}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
} 