"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"
import { RecruiterDashboardLayout } from "@/components/recruiter-dashboard-layout"
import { Button } from "@/components/ui/button"
import { 
  Briefcase, 
  Plus, 
  Search,
  Filter,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Globe,
  MapPin,
  DollarSign
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger, 
  DialogClose
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuthContext } from "@/components/providers/auth-provider"

// Define Job interface
interface Job {
  _id: string;
  title: string;
  description: string;
  company: {
    _id: string;
    name: string;
    logo?: string;
  } | string;
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  postedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  status: string;
  applicants: number;
  views?: number;
  shortlisted?: number;
  skills: string[];
  experience: string;
  requirements?: string[];
  responsibilities?: string[];
  type: string;
  applicationDeadline?: string;
  applicationCount?: number;
}

// Define Company interface
interface Company {
  _id: string;
  name: string;
  logo?: string;
}

// Create a context for job actions
type JobActionsContextType = {
  handleEditJob: (job: any) => void;
  handleDuplicateJob: (job: any) => void;
};

const JobActionsContext = createContext<JobActionsContextType | undefined>(undefined);

export function useJobActionsContext() {
  const context = useContext(JobActionsContext);
  if (!context) {
    throw new Error('useJobActionsContext must be used within a JobActionsProvider');
  }
  return context;
}

// Wrap the content with the context provider
function JobActionsProvider({ children, actions }: { children: ReactNode; actions: JobActionsContextType }) {
  return (
    <JobActionsContext.Provider value={actions}>
      {children}
    </JobActionsContext.Provider>
  );
}

export default function JobPostingsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [companies, setCompanies] = useState<Company[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<any>(null)
  const { toast } = useToast()
  const { user } = useAuthContext()
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    companyName: "",
    description: "",
    requirements: [""],
    responsibilities: [""],
    location: "",
    salaryMin: "",
    salaryMax: "",
    type: "full-time",
    experience: "",
    skills: "",
    applicationDeadline: ""
  })

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Handle select input changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Handle array input changes (requirements, responsibilities)
  const handleArrayChange = (index: number, value: string, field: "requirements" | "responsibilities") => {
    const updatedArray = [...formData[field]]
    updatedArray[index] = value
    setFormData({
      ...formData,
      [field]: updatedArray
    })
  }

  // Add new item to array fields
  const addArrayItem = (field: "requirements" | "responsibilities") => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ""]
    })
  }

  // Remove item from array fields
  const removeArrayItem = (index: number, field: "requirements" | "responsibilities") => {
    if (formData[field].length > 1) {
      const updatedArray = formData[field].filter((_, i) => i !== index)
      setFormData({
        ...formData,
        [field]: updatedArray
      })
    }
  }

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/jobs')
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }
      const data = await response.json()
      console.log("Jobs fetched from API:", data.jobs);
      setJobs(data.jobs || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast({
        title: "Error",
        description: "Failed to load job postings",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch companies for the dropdown
  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      if (!response.ok) {
        throw new Error('Failed to fetch companies')
      }
      const data = await response.json()
      setCompanies(data.companies || [])
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  // Function to handle editing a job
  const handleEditJob = async (job: any) => {
    try {
      setIsLoading(true)
      
      // Fetch full job details
      const response = await fetch(`/api/jobs/${job.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch job details')
      }
      
      const data = await response.json()
      const jobDetail = data.job
      
      // Format the data for the form
      setFormData({
        title: jobDetail.title,
        company: typeof jobDetail.company === 'object' ? jobDetail.company._id : jobDetail.company,
        companyName: "",
        description: jobDetail.description,
        requirements: jobDetail.requirements || [""],
        responsibilities: jobDetail.responsibilities || [""],
        location: jobDetail.location,
        salaryMin: jobDetail.salary?.min?.toString() || "",
        salaryMax: jobDetail.salary?.max?.toString() || "",
        type: jobDetail.type || "full-time",
        experience: jobDetail.experience,
        skills: Array.isArray(jobDetail.skills) ? jobDetail.skills.join(", ") : "",
        applicationDeadline: jobDetail.applicationDeadline ? 
          new Date(jobDetail.applicationDeadline).toISOString().split('T')[0] : ""
      })
      
      // Save reference to the job being edited
      setEditingJob(jobDetail)
      
      // Open the dialog
      setOpen(true)
    } catch (error) {
      console.error('Error fetching job details:', error)
      toast({
        title: "Error",
        description: "Failed to load job details for editing",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Function to handle duplicating a job
  const handleDuplicateJob = async (job: any) => {
    try {
      setIsLoading(true)
      
      // Fetch full job details
      const response = await fetch(`/api/jobs/${job.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch job details')
      }
      
      const data = await response.json()
      const jobDetail = data.job
      
      // Format the data for the form, with a "(Copy)" suffix for the title
      setFormData({
        title: `${jobDetail.title} (Copy)`,
        company: typeof jobDetail.company === 'object' ? jobDetail.company._id : jobDetail.company,
        companyName: "",
        description: jobDetail.description,
        requirements: jobDetail.requirements || [""],
        responsibilities: jobDetail.responsibilities || [""],
        location: jobDetail.location,
        salaryMin: jobDetail.salary?.min?.toString() || "",
        salaryMax: jobDetail.salary?.max?.toString() || "",
        type: jobDetail.type || "full-time",
        experience: jobDetail.experience,
        skills: Array.isArray(jobDetail.skills) ? jobDetail.skills.join(", ") : "",
        applicationDeadline: "" // Reset deadline for the duplicate
      })
      
      // No need to set editingJob since we're creating a new one
      setEditingJob(null)
      
      // Open the dialog
      setOpen(true)
    } catch (error) {
      console.error('Error fetching job details:', error)
      toast({
        title: "Error",
        description: "Failed to load job details for duplication",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Update the handleSubmit function to support editing
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validate form data
      if (!formData.title || (!formData.company && !formData.companyName) || !formData.description || 
          !formData.location || !formData.experience || !formData.applicationDeadline) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }

      // Check if company is 'other' but no company name is provided
      if (formData.company === "other" && !formData.companyName) {
        toast({
          title: "Validation Error",
          description: "Please enter a company name",
          variant: "destructive"
        })
        return
      }

      // Format data for API
      const jobData: any = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements.filter(req => req.trim() !== ""),
        responsibilities: formData.responsibilities.filter(resp => resp.trim() !== ""),
        location: formData.location,
        salary: {
          min: parseInt(formData.salaryMin) || 0,
          max: parseInt(formData.salaryMax) || 0,
          currency: "INR"
        },
        type: formData.type,
        experience: formData.experience,
        skills: formData.skills.split(",").map(skill => skill.trim()),
        status: editingJob ? editingJob.status : "open",
        applicationDeadline: new Date(formData.applicationDeadline).toISOString()
      }

      // Only set company ID if it's not 'other' and valid
      if (formData.company && formData.company !== "other" && formData.company !== "placeholder") {
        jobData.company = formData.company;
      } else if (formData.companyName) {
        // If using "other" with companyName, we need to create a company first
        try {
          const companyResponse = await fetch('/api/companies', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: formData.companyName,
              industry: "Technology", // Default value
              description: `${formData.companyName} - Created via job posting`,
              location: formData.location,
            })
          });

          if (!companyResponse.ok) {
            const errorData = await companyResponse.json();
            
            // Check if it's because the company already exists
            if (companyResponse.status === 409) {
              // Try to fetch the existing company by name
              const searchResponse = await fetch(`/api/companies?search=${encodeURIComponent(formData.companyName)}`);
              const searchData = await searchResponse.json();
              
              if (searchResponse.ok && searchData.companies && searchData.companies.length > 0) {
                // Use the existing company
                const existingCompany = searchData.companies.find(c => 
                  c.name.toLowerCase() === formData.companyName.toLowerCase()
                );
                
                if (existingCompany) {
                  jobData.company = existingCompany._id;
                  toast({
                    title: "Note",
                    description: `Using existing company "${existingCompany.name}"`,
                  });
                } else {
                  throw new Error("Couldn't find matching company");
                }
              } else {
                throw new Error("Company name already exists but couldn't be retrieved");
              }
            } else {
              throw new Error(errorData.error || "Failed to create company");
            }
          } else {
            const companyData = await companyResponse.json();
            jobData.company = companyData.company._id;
          }
        } catch (error: any) {
          console.error("Error creating/finding company:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to process company information. Please try again.",
            variant: "destructive"
          });
          return;
        }
      } else {
        toast({
          title: "Validation Error",
          description: "Please select a company or enter a company name",
          variant: "destructive"
        });
        return;
      }

      // Determine if we're editing or creating
      const isEditing = !!editingJob
      const url = isEditing ? `/api/jobs/${editingJob._id}` : '/api/jobs'
      const method = isEditing ? 'PUT' : 'POST'

      // Call API
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} job posting`)
      }

      // Success
      toast({
        title: "Success",
        description: `Job posting ${isEditing ? 'updated' : 'created'} successfully`,
      })

      // Reset form and dialog state
      setFormData({
        title: "",
        company: "",
        companyName: "",
        description: "",
        requirements: [""],
        responsibilities: [""],
        location: "",
        salaryMin: "",
        salaryMax: "",
        type: "full-time",
        experience: "",
        skills: "",
        applicationDeadline: ""
      })
      setEditingJob(null)
      setOpen(false)

      // Refresh job listings
      fetchJobs()
    } catch (error: any) {
      console.error(`Error ${editingJob ? 'updating' : 'creating'} job posting:`, error)
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingJob ? 'update' : 'create'} job posting`,
        variant: "destructive"
      })
    }
  }

  // Search jobs based on query
  const searchJobs = () => {
    if (!searchQuery.trim()) {
      return jobs
    }
    
    return jobs.filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof job.company === 'object' && job.company.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Function to handle job deletion
  const handleDeleteJob = async (jobId: string) => {
    try {
      if (!confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
        return;
      }
      
      setIsLoading(true);
      console.log("Deleting job with ID:", jobId);
      
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Delete response status:", response.status);
      
      // Handle non-JSON and JSON responses
      let errorMessage = 'Failed to delete job posting';
      
      if (!response.ok) {
        try {
          // Try to parse JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            console.error("Delete job response error:", response.status, errorData);
            errorMessage = errorData.error || errorMessage;
          } else {
            const textError = await response.text();
            console.error("Delete job non-JSON error:", response.status, textError);
          }
          throw new Error(errorMessage);
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          throw new Error(errorMessage);
        }
      }
      
      toast({
        title: "Success",
        description: "Job posting deleted successfully",
      });
      
      // Refresh job listings
      fetchJobs();
    } catch (error: any) {
      console.error('Error deleting job posting:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete job posting",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs()
    fetchCompanies()
  }, [])

  // Filter jobs by status for tabs
  const filteredJobs = searchJobs()
  const activeJobs = filteredJobs.filter(job => job.status === "open")
  const closedJobs = filteredJobs.filter(job => job.status === "closed")

  // Format job data for display
  const formatJobForDisplay = (job: Job) => {
    // Safely format the date
    let formattedDate = "";
    try {
      if (job.createdAt) {
        formattedDate = new Date(job.createdAt).toISOString().split('T')[0];
      } else if (job.postedDate) {
        // Make sure it's a valid date before converting
        const dateObj = new Date(job.postedDate);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toISOString().split('T')[0];
        } else {
          formattedDate = "Date unavailable";
        }
      } else {
        formattedDate = "Date unavailable";
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      formattedDate = "Date unavailable";
    }

    // Ensure job ID is correct
    const jobId = job._id;
    console.log("Original job from API:", job);
    
    return {
      id: jobId,
      title: job.title,
      description: job.description,
      company: typeof job.company === 'object' ? job.company.name : job.company.toString(),
      location: job.location,
      salary: job.salary ? `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()} /year` : "",
      postedDate: formattedDate,
      status: job.status,
      applicants: job.applicationCount || 0,
      views: job.views || 0,
      shortlisted: job.shortlisted || 0,
      skills: job.skills,
      experience: job.experience
    }
  }

  // Use only real data from API, no mock data
  const displayJobs = jobs.map(formatJobForDisplay)
  
  return (
    <RecruiterDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Job Postings</h1>
            <p className="text-muted-foreground">Manage and track your job listings</p>
          </div>
          <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) {
              // Reset form when closing
              setFormData({
                title: "",
                company: "",
                companyName: "",
                description: "",
                requirements: [""],
                responsibilities: [""],
                location: "",
                salaryMin: "",
                salaryMax: "",
                type: "full-time",
                experience: "",
                skills: "",
                applicationDeadline: ""
              })
              setEditingJob(null)
            }
            setOpen(isOpen)
          }}>
            <DialogTrigger asChild>
              <Button className="sm:w-auto gap-2">
                <Plus className="h-4 w-4" />
                Create Job Posting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}</DialogTitle>
                <DialogDescription>
                  {editingJob 
                    ? 'Update the details of this job posting' 
                    : 'Fill in the details to create a new job posting'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Senior Frontend Developer" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <div className="flex gap-2">
                      <Select 
                        name="company" 
                        value={formData.company}
                        onValueChange={(value) => {
                          handleSelectChange("company", value)
                          setFormData(prev => ({ ...prev, companyName: "" }))
                        }}
                      >
                        <SelectTrigger className={formData.companyName ? "opacity-50" : ""}>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="placeholder" disabled>Select a company</SelectItem>
                          {companies.map((company) => (
                            <SelectItem key={company._id} value={company._id}>
                              {company.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="other">Add New Company</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {formData.company === "other" && (
                      <div className="mt-2">
                        <Label htmlFor="companyName" className="text-sm font-medium">
                          New Company Name <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="companyName"
                          placeholder="Enter company name"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className="mt-1"
                          required={formData.company === "other"}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          New company will be created with this name and job location
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of the job" 
                    className="min-h-[100px]" 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Job Requirements</Label>
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex gap-2">
                      <Input 
                        value={req}
                        onChange={(e) => handleArrayChange(index, e.target.value, "requirements")}
                        placeholder={`Requirement ${index + 1}`} 
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => removeArrayItem(index, "requirements")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => addArrayItem("requirements")}
                    className="mt-2"
                  >
                    Add Requirement
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Job Responsibilities</Label>
                  {formData.responsibilities.map((resp, index) => (
                    <div key={index} className="flex gap-2">
                      <Input 
                        value={resp}
                        onChange={(e) => handleArrayChange(index, e.target.value, "responsibilities")}
                        placeholder={`Responsibility ${index + 1}`} 
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => removeArrayItem(index, "responsibilities")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => addArrayItem("responsibilities")}
                    className="mt-2"
                  >
                    Add Responsibility
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      name="location" 
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Mumbai, India (Remote)" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Job Type</Label>
                    <Select 
                      name="type" 
                      value={formData.type}
                      onValueChange={(value) => handleSelectChange("type", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Salary Range (Min)</Label>
                    <Input 
                      id="salaryMin" 
                      name="salaryMin" 
                      value={formData.salaryMin}
                      onChange={handleInputChange}
                      type="number" 
                      placeholder="e.g. 1200000" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Salary Range (Max)</Label>
                    <Input 
                      id="salaryMax" 
                      name="salaryMax" 
                      value={formData.salaryMax}
                      onChange={handleInputChange}
                      type="number" 
                      placeholder="e.g. 1800000" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Required</Label>
                    <Input 
                      id="experience" 
                      name="experience" 
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="e.g. 3+ years" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applicationDeadline">Application Deadline</Label>
                    <Input 
                      id="applicationDeadline" 
                      name="applicationDeadline" 
                      value={formData.applicationDeadline}
                      onChange={handleInputChange}
                      type="date" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Required Skills</Label>
                  <Input 
                    id="skills" 
                    name="skills" 
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="Comma-separated list of skills, e.g. React, Node.js, TypeScript" 
                    required 
                  />
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Create Job Posting</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search job postings..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="hidden sm:flex gap-2">
            <BarChart3 className="h-4 w-4" />
            Job Analytics
          </Button>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : displayJobs.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-card/50">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/60" />
                <h3 className="text-lg font-medium mt-4">No job postings found</h3>
                <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                  Create your first job posting to start receiving applications from qualified candidates
                </p>
                <Button 
                  onClick={() => setOpen(true)}
                  className="mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Job Posting
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayJobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onEdit={handleEditJob} 
                    onDuplicate={handleDuplicateJob} 
                    onDelete={handleDeleteJob}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : displayJobs.filter(job => job.status === "active" || job.status === "open").length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-card/50">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/60" />
                <h3 className="text-lg font-medium mt-4">No active job postings</h3>
                <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                  Active job postings appear here and are visible to candidates
                </p>
                <Button 
                  onClick={() => setOpen(true)}
                  className="mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Job Posting
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayJobs
                  .filter((job) => job.status === "active" || job.status === "open")
                  .map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onEdit={handleEditJob} 
                      onDuplicate={handleDuplicateJob} 
                      onDelete={handleDeleteJob}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="closed" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : displayJobs.filter(job => job.status === "closed").length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-card/50">
                <XCircle className="h-12 w-12 mx-auto text-muted-foreground/60" />
                <h3 className="text-lg font-medium mt-4">No closed job postings</h3>
                <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                  When you close a job posting, it will appear here for your records
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayJobs
                  .filter((job) => job.status === "closed")
                  .map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onEdit={handleEditJob} 
                      onDuplicate={handleDuplicateJob} 
                      onDelete={handleDeleteJob}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterDashboardLayout>
  )
}

interface JobCardProps {
  job: any;
  onEdit: (job: any) => void;
  onDuplicate: (job: any) => void;
  onDelete: (jobId: string) => void;
}

function JobCard({ job, onEdit, onDuplicate, onDelete }: JobCardProps) {
  const { toast } = useToast();
  
  return (
    <Card className={`overflow-hidden ${job.status === "closed" ? "opacity-75" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </CardDescription>
          </div>
          <Badge variant={job.status === "active" || job.status === "open" ? "default" : "secondary"}>
            {job.status === "active" || job.status === "open" ? (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                <span>Closed</span>
              </div>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{job.experience}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>
                {job.salary.replace("₹", "").replace(" - ", "-").replace(",", "")}
              </span>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.slice(0, 3).map((skill: string, index: number) => (
                <Badge key={index} variant="outline" className="font-normal">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 3 && (
                <Badge variant="outline" className="font-normal">
                  +{job.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Applicants</span>
              <span className="font-medium">{job.applicants}</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ 
                  width: `${Math.min(100, (job.shortlisted / job.applicants) * 100)}%`
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {job.shortlisted} shortlisted
              </span>
              <span className="text-muted-foreground">
                {new Date(job.postedDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => onEdit(job)}
        >
          <Edit className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => onDuplicate(job)}
        >
          <Copy className="h-3.5 w-3.5" />
          Duplicate
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-destructive hover:text-destructive gap-1"
          onClick={() => {
            // Make sure we're using the correct ID
            console.log("Delete button clicked for job:", job);
            const jobId = job.id;
            if (!jobId) {
              console.error("Missing job ID:", job);
              toast({
                title: "Error",
                description: "Cannot delete job: Missing ID",
                variant: "destructive"
              });
              return;
            }
            onDelete(jobId);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
} 