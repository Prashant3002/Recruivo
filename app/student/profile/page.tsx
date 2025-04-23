"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import StudentDashboardLayout from "@/components/student-dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Loader2, 
  LinkIcon, 
  FileText, 
  Upload, 
  FileUp, 
  Plus, 
  AlertCircle,
  Check,
  CheckCircle,
  Badge
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ResumeUploadDialog } from "@/components/resume-upload-dialog"

// Form validation schema
const profileSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Please enter a valid phone number").optional().or(z.literal("")),
  rollNumber: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  
  // Academic Information
  university: z.string().min(1, "University name is required"),
  degree: z.string().min(1, "Degree is required"),
  branch: z.string().optional().or(z.literal("")),
  graduationYear: z.string().min(1, "Graduation year is required"),
  cgpa: z.string().optional().or(z.literal("")),
  class10Percentage: z.string().optional().or(z.literal("")),
  class12Percentage: z.string().optional().or(z.literal("")),
  
  // Skills & Career
  skills: z.string().optional(),
  careerObjective: z.string().max(1000, "Career objective cannot exceed 1000 characters").optional().or(z.literal("")),
  
  // Social Links
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  portfolio: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false)
  const [resumeUrl, setResumeUrl] = useState("")
  const [resumeFileName, setResumeFileName] = useState("")
  const [isSocialFieldsEditable, setIsSocialFieldsEditable] = useState(true)
  const [isBasicInfoEditable, setIsBasicInfoEditable] = useState(false)
  const [signupFields, setSignupFields] = useState<string[]>([]) // Track fields from signup
  const router = useRouter()
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      rollNumber: "",
      bio: "",
      university: "",
      degree: "",
      branch: "",
      graduationYear: "",
      cgpa: "",
      class10Percentage: "",
      class12Percentage: "",
      skills: "",
      careerObjective: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
  })

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        
        // Step 1: Get user data from auth endpoint
        const userResponse = await fetch('/api/auth/me', {
          credentials: 'include',
        })
        
        if (!userResponse.ok) {
          console.error("Failed to fetch user data:", userResponse.status)
          throw new Error("Failed to fetch user data")
        }
        
        const userData = await userResponse.json()
        console.log('User data from auth:', userData)

        // Additional debug for user data
        console.log('DEBUG - User phone from auth:', userData?.user?.phone)
        
        // Track which fields came from signup
        const fieldsFromSignup: string[] = []
        
        // Pre-fill form with user data
        if (userData.user) {
          const user = userData.user
          
          // Extract firstName and lastName from name
          const nameParts = user.name ? user.name.split(' ') : ['', ''];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          // Set basic user info
          form.setValue('firstName', firstName)
          form.setValue('lastName', lastName)
          form.setValue('email', user.email || '')
          form.setValue('phone', user.phone || '')
          
          // Mark fields that came from signup
          if (user.name) fieldsFromSignup.push('name')
          if (user.email) fieldsFromSignup.push('email')
          if (user.phone) fieldsFromSignup.push('phone')
        }
        
        // Step 2: Try to get student profile data - try both endpoints
        let profileData = null;
        let profileResponse = null;
        
        // Try the singular endpoint first (newer implementation)
        try {
          profileResponse = await fetch('/api/student/profile', {
            credentials: 'include',
          })
          
          if (profileResponse.ok) {
            profileData = await profileResponse.json();
            console.log('Student profile data from singular endpoint:', profileData);
          } else {
            console.log('Singular endpoint returned status:', profileResponse.status);
          }
        } catch (error) {
          console.error("Error fetching from singular endpoint:", error);
        }
        
        // If that fails, try the plural endpoint (legacy)
        if (!profileData) {
          try {
            profileResponse = await fetch('/api/students/profile', {
              credentials: 'include',
            })
            
            if (profileResponse.ok) {
              profileData = await profileResponse.json();
              console.log('Student profile data from plural endpoint:', profileData);
            } else {
              console.log('Plural endpoint returned status:', profileResponse.status);
            }
          } catch (error) {
            console.error("Error fetching from plural endpoint:", error);
          }
        }
        
        // Process the profile data if we got it from either endpoint
        if (profileData && profileData.student) {
          const student = profileData.student
          
          // Debug log to check phone and rollNumber values
          console.log('DEBUG - Student phone and rollNumber:', {
            phone: student.phone,
            rollNumber: student.rollNumber,
            completeStudent: student
          });
          
          // Set student data - prioritize student data over user data
          form.setValue('rollNumber', student.rollNumber || '')
          form.setValue('bio', student.bio || '')
          form.setValue('university', student.university || '')
          form.setValue('degree', student.degree || '')
          form.setValue('branch', student.branch || '')
          form.setValue('graduationYear', student.graduationYear ? student.graduationYear.toString() : '')
          form.setValue('cgpa', student.cgpa || '')
          form.setValue('class10Percentage', student.class10Percentage || '')
          form.setValue('class12Percentage', student.class12Percentage || '')
          form.setValue('skills', student.skills && student.skills.length ? student.skills.join(', ') : '')
          form.setValue('careerObjective', student.careerObjective || '')
          form.setValue('linkedin', student.linkedin || '')
          form.setValue('github', student.github || '')
          form.setValue('portfolio', student.portfolio || '')
          
          // Ensure phone has a value (prefer student data over user data)
          if (student.phone) {
            console.log('Setting phone from student data:', student.phone)
            form.setValue('phone', student.phone)
          }
          
          // Extra check for nested user data in the student object
          if (student.user && typeof student.user === 'object') {
            console.log('Found nested user data in student:', student.user)
            if (student.user.phone) {
              console.log('Setting phone from nested user data:', student.user.phone)
              form.setValue('phone', student.user.phone)
            }
          }
          
          // Mark fields that came from student profile/signup
          if (student.rollNumber) fieldsFromSignup.push('rollNumber')
          if (student.university) fieldsFromSignup.push('university')
          if (student.degree) fieldsFromSignup.push('degree')
          if (student.branch) fieldsFromSignup.push('branch')
          
          // Set resume URL
          if (student.resumeUrl) {
            setResumeUrl(student.resumeUrl);
            
            // Extract file name from URL
            const urlParts = student.resumeUrl.split('/');
            const fileName = urlParts[urlParts.length - 2] || 'resume.pdf';
            setResumeFileName(fileName);
          }
        }
        
        // Save the signup fields to state
        setSignupFields(fieldsFromSignup)
        
        // Determine which fields should be editable based on signup data
        setIsBasicInfoEditable(!fieldsFromSignup.includes('name') && !fieldsFromSignup.includes('email'))
        
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [form])

  // Helper function to check if a field was filled during signup
  const isSignupField = (fieldName: string) => {
    return signupFields.includes(fieldName)
  }

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setSubmitting(true);
    
    try {
      // Manual refresh of roll number and phone fields to ensure they're populated
      console.log('Before submission - roll number:', data.rollNumber, 'phone:', data.phone);
      
      // If fields are empty but were entered, retrieve them from the form directly
      if (!data.phone || data.phone.trim() === '') {
        const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement;
        if (phoneInput && phoneInput.value) {
          data.phone = phoneInput.value;
          console.log('Retrieved phone from DOM:', data.phone);
        }
      }
      
      if (!data.rollNumber || data.rollNumber.trim() === '') {
        const rollInput = document.querySelector('input[name="rollNumber"]') as HTMLInputElement;
        if (rollInput && rollInput.value) {
          data.rollNumber = rollInput.value;
          console.log('Retrieved roll number from DOM:', data.rollNumber);
        }
      }
      
      // Convert skills string to array
      const skillsArray = data.skills
        ? data.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      
      // Prepare payload with all required fields
      const payload = {
        ...data,
        skills: skillsArray,
        graduationYear: Number(data.graduationYear),
        // Convert percentage strings to numbers if they exist
        cgpa: data.cgpa ? parseFloat(data.cgpa) : null,
        class10Percentage: data.class10Percentage ? parseFloat(data.class10Percentage) : null,
        class12Percentage: data.class12Percentage ? parseFloat(data.class12Percentage) : null,
        // Ensure all string fields have non-undefined values
        bio: data.bio || '',
        rollNumber: data.rollNumber || '', 
        branch: data.branch || '',
        careerObjective: data.careerObjective || '',
        phone: data.phone || '',
        linkedin: data.linkedin || '',
        github: data.github || '',
        portfolio: data.portfolio || ''
      };
      
      // Log payload for debugging
      console.log('Student Profile Form - submitting payload:', payload);
      
      // Try the singular endpoint first (main implementation)
      let response = null;
      let success = false;
      
      try {
        response = await fetch('/api/student/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        const responseData = await response.json();
        console.log('Student Profile Form - API response:', responseData);
        
        if (response.ok) {
          success = true;
          console.log('Profile updated using singular endpoint');
        } else {
          console.error('Singular endpoint failed with status:', response.status);
        }
      } catch (error) {
        console.error('Error using singular endpoint:', error);
      }
      
      // If singular endpoint fails, try the plural endpoint (fallback)
      if (!success) {
        try {
          response = await fetch('/api/students/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          
          const responseData = await response.json();
          console.log('Student Profile Form - API response (fallback):', responseData);
          
          if (response.ok) {
            success = true;
            console.log('Profile updated using plural endpoint');
          } else {
            console.error('Plural endpoint failed with status:', response.status);
          }
        } catch (error) {
          console.error('Error using plural endpoint:', error);
        }
      }
      
      if (!success) {
        throw new Error('Failed to update profile using both endpoints');
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        variant: "default",
      });
      
      router.push('/student');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle resume upload completion
  const handleResumeUploadComplete = () => {
    // Refresh the page to see the updated resume
    router.refresh();
    
    toast({
      title: "Resume uploaded",
      description: "Your resume has been uploaded successfully.",
      variant: "default",
    });
    
    // Close the dialog
    setResumeDialogOpen(false);
  };

  // Function to open the resume
  const openResume = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    } else {
      toast({
        title: "No resume",
        description: "You haven't uploaded a resume yet.",
        variant: "destructive",
      });
    }
  };

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-muted-foreground">
              Update your personal information, skills and academic details
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setResumeDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <FileUp className="h-4 w-4" />
              {resumeUrl ? "Update Resume" : "Upload Resume"}
            </Button>
            {resumeUrl && (
              <Button 
                variant="ghost" 
                onClick={openResume}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                View Resume
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading profile data...</span>
          </div>
        ) : (
          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList className="grid grid-cols-4 md:w-fit">
              <TabsTrigger value="personal"><User className="h-4 w-4 mr-2" /> Personal</TabsTrigger>
              <TabsTrigger value="academic"><GraduationCap className="h-4 w-4 mr-2" /> Academic</TabsTrigger>
              <TabsTrigger value="skills"><Briefcase className="h-4 w-4 mr-2" /> Skills & Career</TabsTrigger>
              <TabsTrigger value="social"><LinkIcon className="h-4 w-4 mr-2" /> Links</TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information Tab */}
                <TabsContent value="personal">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Your basic personal details used across the platform
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input placeholder="First Name" {...field} disabled={!isBasicInfoEditable} />
                                      {isSignupField('name') && (
                                        <Badge className="absolute right-2 top-2 bg-blue-100 text-blue-800 text-xs">Signup</Badge>
                                      )}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input placeholder="Last Name" {...field} disabled={!isBasicInfoEditable} />
                                      {isSignupField('name') && (
                                        <Badge className="absolute right-2 top-2 bg-blue-100 text-blue-800 text-xs">Signup</Badge>
                                      )}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input placeholder="Email" {...field} disabled={isSignupField('email')} />
                                      {isSignupField('email') && (
                                        <Badge className="absolute right-2 top-2 bg-blue-100 text-blue-800 text-xs">Signup</Badge>
                                      )}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input placeholder="Phone" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value)} />
                                      {isSignupField('phone') && (
                                        <Badge className="absolute right-2 top-2 bg-blue-100 text-blue-800 text-xs">Signup</Badge>
                                      )}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="rollNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Roll Number</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input placeholder="Roll Number" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value)} />
                                      {isSignupField('rollNumber') && (
                                        <Badge className="absolute right-2 top-2 bg-blue-100 text-blue-800 text-xs">Signup</Badge>
                                      )}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="bio"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bio</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Tell us about yourself" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Academic Information Tab */}
                <TabsContent value="academic">
                  <Card>
                    <CardHeader>
                      <CardTitle>Academic Information</CardTitle>
                      <CardDescription>
                        Your educational background and academic achievements
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="university"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>University/College</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input placeholder="University/College" {...field} />
                                      {isSignupField('university') && (
                                        <Badge className="absolute right-2 top-2 bg-blue-100 text-blue-800 text-xs">Signup</Badge>
                                      )}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="degree"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Degree</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input placeholder="Degree" {...field} />
                                      {isSignupField('degree') && (
                                        <Badge className="absolute right-2 top-2 bg-blue-100 text-blue-800 text-xs">Signup</Badge>
                                      )}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="branch"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Branch/Specialization</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input placeholder="Branch/Specialization" {...field} />
                                      {isSignupField('branch') && (
                                        <Badge className="absolute right-2 top-2 bg-blue-100 text-blue-800 text-xs">Signup</Badge>
                                      )}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="graduationYear"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Year of Graduation</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Year of Graduation" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="cgpa"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current CGPA / Percentage</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Your current CGPA or percentage" disabled={submitting} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="class12Percentage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Class 12th Percentage</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Your 12th class percentage" disabled={submitting} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="class10Percentage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Class 10th Percentage</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Your 10th class percentage" disabled={submitting} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Skills & Career Tab */}
                <TabsContent value="skills">
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills & Career Objective</CardTitle>
                      <CardDescription>
                        Your skills and career goals help us match you with the right opportunities
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills (comma separated)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="E.g., JavaScript, React, Node.js, Communication" disabled={submitting} />
                            </FormControl>
                            <FormDescription>
                              Separate skills with commas (e.g., JavaScript, React, Python). Include both technical and soft skills.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="careerObjective"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Career Objective</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Describe your career goals and aspirations" 
                                className="min-h-[150px]" 
                                disabled={submitting} 
                              />
                            </FormControl>
                            <FormDescription>
                              A clear statement about your career goals and what you're looking for in your next opportunity
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Resume Section */}
                      <div className="border rounded-md p-4">
                        <h3 className="text-md font-medium mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Resume
                        </h3>
                        
                        {resumeUrl ? (
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                                <div>
                                  <p className="text-sm font-medium">{resumeFileName || "Resume.pdf"}</p>
                                  <p className="text-xs text-muted-foreground">Uploaded resume</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={openResume}>
                                  View
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setResumeDialogOpen(true)}>
                                  Update
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Your resume will be shared with recruiters when you apply for jobs
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-md">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">No resume uploaded yet</p>
                            <p className="text-xs text-muted-foreground mb-4">
                              Upload your resume to apply for jobs easily
                            </p>
                            <Button onClick={() => setResumeDialogOpen(true)}>
                              Upload Resume
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Social Links Tab */}
                <TabsContent value="social">
                  <Card>
                    <CardHeader>
                      <CardTitle>Social & Professional Links</CardTitle>
                      <CardDescription>
                        Connect your professional profiles to enhance your application
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="linkedin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>LinkedIn Profile</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="https://linkedin.com/in/yourprofile" 
                                  disabled={submitting} 
                                  className="pl-8"
                                  prefix={<LinkIcon className="h-4 w-4 text-muted-foreground" />}
                                />
                              </FormControl>
                              <FormDescription>
                                Complete LinkedIn URL, including https://
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="github"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GitHub Profile</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    {...field} 
                                    placeholder="https://github.com/yourusername" 
                                    disabled={submitting}
                                    className="pl-8"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="portfolio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Portfolio Website</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    {...field} 
                                    placeholder="https://yourportfolio.com" 
                                    disabled={submitting}
                                    className="pl-8"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="rounded-md bg-amber-50 p-4">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-amber-800 mr-2" />
                          <p className="text-sm text-amber-800">
                            <strong>ProTip:</strong> Adding professional links helps recruiters learn more about your work and increases your chances of being selected.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/student')}
                    type="button"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        )}
      </div>
      
      {/* Resume Upload Dialog */}
      <ResumeUploadDialog 
        open={resumeDialogOpen} 
        onOpenChange={setResumeDialogOpen}
        onUploadComplete={handleResumeUploadComplete}
      />
    </StudentDashboardLayout>
  )
} 