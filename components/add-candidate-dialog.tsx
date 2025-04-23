"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UserPlus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Job {
  _id: string;
  title: string;
  company?: string;
  location?: string;
}

interface AddCandidateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (candidateData: {
    name: string
    email: string
    jobTitle: string
    skills: string[]
    jobId?: string
  }) => void
}

export function AddCandidateDialog({
  open,
  onOpenChange,
  onAdd
}: AddCandidateDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [skills, setSkills] = useState("")
  const [jobId, setJobId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
  }>({})

  useEffect(() => {
    // Fetch jobs when the dialog is opened
    if (open) {
      fetchJobs()
    }
  }, [open])

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true)
      const response = await fetch('/api/jobs?filter=my-jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      }
    } catch (err) {
      console.error('Error fetching jobs:', err)
    } finally {
      setLoadingJobs(false)
    }
  }

  const validateForm = () => {
    const newErrors: {name?: string; email?: string} = {}
    
    if (!name.trim()) {
      newErrors.name = "Name is required"
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Call the API to add a candidate
      const response = await fetch('/api/recruiter/candidates/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          jobTitle,
          skills: skills.split(',').map(skill => skill.trim()).filter(Boolean),
          jobId: jobId === 'no-job' ? undefined : jobId
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        // Call the onAdd callback to update the UI
        onAdd({
          name,
          email,
          jobTitle,
          skills: skills.split(',').map(skill => skill.trim()).filter(Boolean),
          jobId: jobId === 'no-job' ? undefined : jobId
        })
        
        // Reset form
        setName("")
        setEmail("")
        setJobTitle("")
        setSkills("")
        setJobId("")
        setErrors({})
        
        onOpenChange(false)
      } else {
        console.error('Error adding candidate:', data.error)
        setErrors({ name: data.error || 'Failed to add candidate' })
      }
    } catch (error) {
      console.error('Error adding candidate:', error);
      
      // Provide more user-friendly error messages
      let errorMessage = 'An unexpected error occurred';
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        // Check for specific validation error messages
        if (error.message.includes('resume')) {
          errorMessage = 'Resume is required. A default resume will be used temporarily.';
        } else {
          errorMessage = error.message || 'Failed to add candidate';
        }
      }
      
      setErrors({ name: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Candidate</DialogTitle>
          <DialogDescription>
            Enter candidate information to add them to your list
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              placeholder="Frontend Developer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="job">Job Posting</Label>
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger id="job">
                <SelectValue placeholder="Select a job posting" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-job">None</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job._id} value={job._id}>
                    {job.title} {job.company ? `at ${job.company}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select a job posting to automatically create an application
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input
              id="skills"
              placeholder="React, TypeScript, JavaScript"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separate skills with commas, e.g., "React, JavaScript, CSS"
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setErrors({})
              onOpenChange(false)
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Candidate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 