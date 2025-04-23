"use client"

import { useState } from "react"
import { RecruiterDashboardLayout } from "@/components/recruiter-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  Camera,
  Bell,
  Shield,
  Lock,
  SaveAll,
  AlertCircle,
  Upload,
  Trash2,
  LogOut,
  Settings2,
  Calendar,
  Users,
  Bookmark,
  Eye,
  EyeOff
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function RecruiterSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  
  // Form states
  const [profileInfo, setProfileInfo] = useState({
    name: "Rachel Chen",
    email: "rachel.chen@techcorp.com",
    phone: "+1 (555) 987-6543",
    location: "San Francisco, CA",
    company: "TechCorp",
    title: "Senior Technical Recruiter",
    about: "Experienced technical recruiter with 7+ years of experience in the tech industry. Specializing in engineering and product roles.",
    website: "techcorp.com",
    profilePicture: "/placeholder.svg?height=128&width=128",
  })
  
  // Mock job preferences
  const [jobPreferences, setJobPreferences] = useState({
    hiringPriorities: ["experienced", "specialists"],
    preferredSkills: ["react", "typescript", "node", "aws"],
    jobLocations: ["san-francisco", "remote", "new-york"],
    universityPreferences: ["all"],
    experienceLevels: ["mid-level", "senior"],
  })
  
  // Mock notifications settings
  const [notificationSettings, setNotificationSettings] = useState({
    newApplications: true,
    candidateMessages: true,
    interviewReminders: true,
    weeklyReports: true,
    aiRecommendations: true,
    marketingEmails: false,
    desktopNotifications: true,
    emailDigest: "daily",
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const handleProfileSave = () => {
    // In a real app, you would send this data to the server
    console.log("Profile saved", profileInfo)
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileInfo({
      ...profileInfo,
      [name]: value,
    })
  }
  
  const handleNotificationChange = (key, value) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: value,
    })
  }

  return (
    <RecruiterDashboardLayout>
      <div className="h-full w-full space-y-6 overflow-y-auto pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your profile, job preferences, and notification settings</p>
        </div>
        
        <Tabs 
          defaultValue="profile" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="w-full justify-start border-b rounded-none px-0 h-auto pb-0">
            <div className="flex w-full overflow-x-auto scrollbar-hide pb-2 gap-2">
              <TabsTrigger 
                value="profile" 
                className="rounded-md data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-b-none pb-2"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="job-preferences" 
                className="rounded-md data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-b-none pb-2"
              >
                Job Preferences
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="rounded-md data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-b-none pb-2"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="rounded-md data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-b-none pb-2"
              >
                Security
              </TabsTrigger>
            </div>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your profile details and company information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <Avatar className="h-32 w-32">
                        <AvatarImage
                          src={profileInfo.profilePicture}
                          alt={profileInfo.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-2xl">
                          {profileInfo?.name ? profileInfo.name.split(" ").map(n => n[0]).join("") : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -right-1 -bottom-1">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-background">
                          <Camera className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-2 text-xs gap-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      Upload New Photo
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 flex-1">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={profileInfo.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profileInfo.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={profileInfo.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={profileInfo.location}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          name="company"
                          value={profileInfo.company}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          name="title"
                          value={profileInfo.title}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Company Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={profileInfo.website}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="about">About Me</Label>
                      <Textarea
                        id="about"
                        name="about"
                        value={profileInfo.about}
                        onChange={handleInputChange}
                        rows={4}
                      />
                    </div>
                    
                    <div className="mt-4 border-t pt-4 flex justify-end">
                      <Button className="gap-2" onClick={handleProfileSave}>
                        <SaveAll className="h-4 w-4" />
                        Save Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Job Preferences Tab */}
          <TabsContent value="job-preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Hiring Preferences</CardTitle>
                    <CardDescription>Define your job preferences and candidate requirements</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hiring Priorities</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant={jobPreferences.hiringPriorities.includes("fresh-grads") ? "default" : "outline"} className="cursor-pointer">
                        Fresh Graduates
                      </Badge>
                      <Badge variant={jobPreferences.hiringPriorities.includes("experienced") ? "default" : "outline"} className="cursor-pointer">
                        Experienced Professionals
                      </Badge>
                      <Badge variant={jobPreferences.hiringPriorities.includes("specialists") ? "default" : "outline"} className="cursor-pointer">
                        Specialists
                      </Badge>
                      <Badge variant={jobPreferences.hiringPriorities.includes("generalists") ? "default" : "outline"} className="cursor-pointer">
                        Generalists
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <Label>Preferred Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant={jobPreferences.preferredSkills.includes("react") ? "default" : "outline"} className="cursor-pointer">
                        React
                      </Badge>
                      <Badge variant={jobPreferences.preferredSkills.includes("typescript") ? "default" : "outline"} className="cursor-pointer">
                        TypeScript
                      </Badge>
                      <Badge variant={jobPreferences.preferredSkills.includes("node") ? "default" : "outline"} className="cursor-pointer">
                        Node.js
                      </Badge>
                      <Badge variant={jobPreferences.preferredSkills.includes("aws") ? "default" : "outline"} className="cursor-pointer">
                        AWS
                      </Badge>
                      <Badge variant={jobPreferences.preferredSkills.includes("python") ? "default" : "outline"} className="cursor-pointer">
                        Python
                      </Badge>
                      <Badge variant={jobPreferences.preferredSkills.includes("java") ? "default" : "outline"} className="cursor-pointer">
                        Java
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        + Add Skill
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <Label>Job Locations</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant={jobPreferences.jobLocations.includes("san-francisco") ? "default" : "outline"} className="cursor-pointer">
                        San Francisco
                      </Badge>
                      <Badge variant={jobPreferences.jobLocations.includes("new-york") ? "default" : "outline"} className="cursor-pointer">
                        New York
                      </Badge>
                      <Badge variant={jobPreferences.jobLocations.includes("remote") ? "default" : "outline"} className="cursor-pointer">
                        Remote
                      </Badge>
                      <Badge variant={jobPreferences.jobLocations.includes("austin") ? "default" : "outline"} className="cursor-pointer">
                        Austin
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        + Add Location
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <Label htmlFor="experienceLevels">Experience Levels</Label>
                    <Select defaultValue={jobPreferences.experienceLevels.join(",")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred experience levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry-level,mid-level,senior">All Levels</SelectItem>
                        <SelectItem value="entry-level">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="mid-level">Mid Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (5+ years)</SelectItem>
                        <SelectItem value="mid-level,senior">Mid to Senior Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <Label htmlFor="universityPreferences">University Preferences</Label>
                    <Select defaultValue={jobPreferences.universityPreferences.join(",")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select university preferences" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Universities</SelectItem>
                        <SelectItem value="top-tier">Top Tier Only</SelectItem>
                        <SelectItem value="tech-focused">Tech-Focused Schools</SelectItem>
                        <SelectItem value="custom">Custom List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mt-4 border-t pt-4 flex justify-end">
                    <Button className="gap-2">
                      <SaveAll className="h-4 w-4" />
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>AI Assistance Settings</CardTitle>
                    <CardDescription>Configure how AI helps with your recruiting process</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">AI-Suggested Job Improvements</Label>
                      <p className="text-xs text-muted-foreground">Get AI suggestions to improve your job descriptions</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Candidate Auto-Ranking</Label>
                      <p className="text-xs text-muted-foreground">Let AI rank candidates based on job requirements</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Interview Question Suggestions</Label>
                      <p className="text-xs text-muted-foreground">Get AI-suggested questions based on candidate skills</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Smart Reply Suggestions</Label>
                      <p className="text-xs text-muted-foreground">Show AI-generated reply suggestions in messages</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
                
                <div className="mt-4 border-t pt-4 flex justify-end">
                  <Button className="gap-2">
                    <SaveAll className="h-4 w-4" />
                    Save AI Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Control what notifications you receive</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Email Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">New Applications</Label>
                        <p className="text-xs text-muted-foreground">Receive notifications when candidates apply to your job postings</p>
                      </div>
                      <Switch
                        checked={notificationSettings.newApplications}
                        onCheckedChange={(checked) => handleNotificationChange("newApplications", checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Candidate Messages</Label>
                        <p className="text-xs text-muted-foreground">Get notified when candidates send you messages</p>
                      </div>
                      <Switch
                        checked={notificationSettings.candidateMessages}
                        onCheckedChange={(checked) => handleNotificationChange("candidateMessages", checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Interview Reminders</Label>
                        <p className="text-xs text-muted-foreground">Get notifications about upcoming interviews</p>
                      </div>
                      <Switch
                        checked={notificationSettings.interviewReminders}
                        onCheckedChange={(checked) => handleNotificationChange("interviewReminders", checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">AI Recommendations</Label>
                        <p className="text-xs text-muted-foreground">Receive AI-powered candidate and job recommendations</p>
                      </div>
                      <Switch
                        checked={notificationSettings.aiRecommendations}
                        onCheckedChange={(checked) => handleNotificationChange("aiRecommendations", checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Weekly Reports</Label>
                        <p className="text-xs text-muted-foreground">Get weekly recruiting activity reports</p>
                      </div>
                      <Switch
                        checked={notificationSettings.weeklyReports}
                        onCheckedChange={(checked) => handleNotificationChange("weeklyReports", checked)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-medium">System Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Desktop Notifications</Label>
                        <p className="text-xs text-muted-foreground">Show notifications on your desktop</p>
                      </div>
                      <Switch
                        checked={notificationSettings.desktopNotifications}
                        onCheckedChange={(checked) => handleNotificationChange("desktopNotifications", checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="emailDigest">Email Digest Frequency</Label>
                      <Select 
                        defaultValue={notificationSettings.emailDigest}
                        onValueChange={(value) => handleNotificationChange("emailDigest", value)}
                      >
                        <SelectTrigger id="emailDigest">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="real-time">Real-time</SelectItem>
                          <SelectItem value="daily">Daily Digest</SelectItem>
                          <SelectItem value="weekly">Weekly Digest</SelectItem>
                          <SelectItem value="none">Don't send</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 border-t pt-4 flex justify-end">
                  <Button className="gap-2">
                    <SaveAll className="h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your account security settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Two-Factor Authentication</Label>
                        <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-start gap-2 mt-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        We strongly recommend enabling two-factor authentication to protect your account
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <Label>Password Management</Label>
                    <div className="mt-2">
                      <Button variant="outline" className="gap-2">
                        <Lock className="h-4 w-4" />
                        Change Password
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <Label>Session Management</Label>
                    <div className="p-3 border rounded-md mt-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Active Sessions</p>
                          <p className="text-xs text-muted-foreground">You're currently logged in on 2 devices</p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <LogOut className="h-3.5 w-3.5" />
                          Sign Out All
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <Label>Account Deletion</Label>
                    <div className="p-3 border rounded-md border-destructive/40 bg-destructive/5 mt-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Delete Account</p>
                          <p className="text-xs text-muted-foreground">Permanently delete your account and all your data</p>
                        </div>
                        <Button variant="destructive" size="sm" className="gap-1.5">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterDashboardLayout>
  )
} 