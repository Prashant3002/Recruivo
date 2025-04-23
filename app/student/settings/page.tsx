"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
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
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Camera,
  Bell,
  Shield,
  Lock,
  LogOut,
  Trash2,
  Save,
  AlertCircle,
  Upload
} from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  
  // Form states
  const [userInfo, setUserInfo] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "alexjohnson.dev",
    about: "Computer Science student with a passion for web development and artificial intelligence. Looking for internship opportunities in software engineering.",
    university: "Stanford University",
    degree: "Bachelor of Science in Computer Science",
    graduation: "2025",
    profilePicture: "/placeholder.svg?height=128&width=128",
  })
  
  // Mock notifications settings
  const [notificationSettings, setNotificationSettings] = useState({
    newMessages: true,
    applicationUpdates: true,
    jobRecommendations: true,
    newOpportunities: false,
    marketingEmails: false,
    weeklyDigest: true,
    desktopNotifications: true,
    soundAlerts: false,
  })
  
  // Mock privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "verified-recruiters",
    showContactInfo: "recruiters-only",
    allowMessaging: "anyone",
    dataSharing: true,
    activityTracking: true,
    twoFactorAuth: false,
  })
  
  const handleProfileSave = () => {
    // In a real app, you would send this data to the server
    console.log("Profile saved", userInfo)
  }
  
  const handleNotificationChange = (key, value) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: value,
    })
  }
  
  const handlePrivacyChange = (key, value) => {
    setPrivacySettings({
      ...privacySettings,
      [key]: value,
    })
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserInfo({
      ...userInfo,
      [name]: value,
    })
  }

  return (
    <DashboardLayout userType="student">
      <div className="h-full w-full space-y-6 overflow-y-auto pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
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
                value="notifications" 
                className="rounded-md data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-b-none pb-2"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="rounded-md data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-b-none pb-2"
              >
                Privacy & Security
              </TabsTrigger>
              <TabsTrigger 
                value="account" 
                className="rounded-md data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-b-none pb-2"
              >
                Account
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
                    <CardDescription>Update your personal details and profile image</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <Avatar className="h-32 w-32">
                        <AvatarImage
                          src={userInfo.profilePicture}
                          alt={userInfo.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-2xl">
                          {userInfo?.name ? userInfo.name.split(" ").map(n => n[0]).join("") : "U"}
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
                          value={userInfo.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={userInfo.email}
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
                          value={userInfo.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={userInfo.location}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Personal Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={userInfo.website}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="about">About Me</Label>
                      <Textarea
                        id="about"
                        name="about"
                        value={userInfo.about}
                        onChange={handleInputChange}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Education</CardTitle>
                    <CardDescription>Your academic background</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="university">University/College</Label>
                    <Input
                      id="university"
                      name="university"
                      value={userInfo.university}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="degree">Degree</Label>
                    <Input
                      id="degree"
                      name="degree"
                      value={userInfo.degree}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="graduation">Expected Graduation Year</Label>
                    <Input
                      id="graduation"
                      name="graduation"
                      value={userInfo.graduation}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="mt-4 border-t pt-4 flex justify-end">
                  <Button className="gap-2" onClick={handleProfileSave}>
                    <Save className="h-4 w-4" />
                    Save Profile
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
                        <Label className="text-sm">New Messages</Label>
                        <p className="text-xs text-muted-foreground">Get notified when a recruiter sends you a message</p>
                      </div>
                      <Switch
                        checked={notificationSettings.newMessages}
                        onCheckedChange={(checked) => handleNotificationChange("newMessages", checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Application Updates</Label>
                        <p className="text-xs text-muted-foreground">Notifications about your job application status</p>
                      </div>
                      <Switch
                        checked={notificationSettings.applicationUpdates}
                        onCheckedChange={(checked) => handleNotificationChange("applicationUpdates", checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Job Recommendations</Label>
                        <p className="text-xs text-muted-foreground">AI-powered job matches based on your profile</p>
                      </div>
                      <Switch
                        checked={notificationSettings.jobRecommendations}
                        onCheckedChange={(checked) => handleNotificationChange("jobRecommendations", checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">New Opportunities</Label>
                        <p className="text-xs text-muted-foreground">Get notified about new jobs in your field</p>
                      </div>
                      <Switch
                        checked={notificationSettings.newOpportunities}
                        onCheckedChange={(checked) => handleNotificationChange("newOpportunities", checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Marketing Emails</Label>
                        <p className="text-xs text-muted-foreground">Promotional emails and special offers</p>
                      </div>
                      <Switch
                        checked={notificationSettings.marketingEmails}
                        onCheckedChange={(checked) => handleNotificationChange("marketingEmails", checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Weekly Digest</Label>
                        <p className="text-xs text-muted-foreground">Summary of your activity and new opportunities</p>
                      </div>
                      <Switch
                        checked={notificationSettings.weeklyDigest}
                        onCheckedChange={(checked) => handleNotificationChange("weeklyDigest", checked)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-medium">Application Notifications</h3>
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
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Sound Alerts</Label>
                        <p className="text-xs text-muted-foreground">Play a sound for new notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.soundAlerts}
                        onCheckedChange={(checked) => handleNotificationChange("soundAlerts", checked)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 border-t pt-4 flex justify-end">
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Control your profile visibility and data sharing preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profileVisibility">Profile Visibility</Label>
                    <Select 
                      value={privacySettings.profileVisibility}
                      onValueChange={(value) => handlePrivacyChange("profileVisibility", value)}
                    >
                      <SelectTrigger id="profileVisibility">
                        <SelectValue placeholder="Who can see your profile" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Anyone</SelectItem>
                        <SelectItem value="verified-recruiters">Verified Recruiters Only</SelectItem>
                        <SelectItem value="connections">Only My Connections</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Controls who can view your full profile details and resume
                    </p>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="showContactInfo">Contact Information</Label>
                    <Select
                      value={privacySettings.showContactInfo}
                      onValueChange={(value) => handlePrivacyChange("showContactInfo", value)}
                    >
                      <SelectTrigger id="showContactInfo">
                        <SelectValue placeholder="Who can see your contact information" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anyone">Anyone viewing my profile</SelectItem>
                        <SelectItem value="recruiters-only">Recruiters Only</SelectItem>
                        <SelectItem value="connections">Only My Connections</SelectItem>
                        <SelectItem value="nobody">Nobody</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Controls who can see your email and phone number
                    </p>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="allowMessaging">Messaging</Label>
                    <Select
                      value={privacySettings.allowMessaging}
                      onValueChange={(value) => handlePrivacyChange("allowMessaging", value)}
                    >
                      <SelectTrigger id="allowMessaging">
                        <SelectValue placeholder="Who can message you" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anyone">Anyone</SelectItem>
                        <SelectItem value="verified-recruiters">Verified Recruiters Only</SelectItem>
                        <SelectItem value="connections">Only My Connections</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Controls who can send you messages
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Data Sharing with Partners</Label>
                        <p className="text-xs text-muted-foreground">Allow sharing your basic profile with partner companies</p>
                      </div>
                      <Switch
                        checked={privacySettings.dataSharing}
                        onCheckedChange={(checked) => handlePrivacyChange("dataSharing", checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Activity Tracking</Label>
                        <p className="text-xs text-muted-foreground">Allow tracking of your activity to personalize recommendations</p>
                      </div>
                      <Switch
                        checked={privacySettings.activityTracking}
                        onCheckedChange={(checked) => handlePrivacyChange("activityTracking", checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Security</CardTitle>
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
                      <Switch
                        checked={privacySettings.twoFactorAuth}
                        onCheckedChange={(checked) => handlePrivacyChange("twoFactorAuth", checked)}
                      />
                    </div>
                    
                    {!privacySettings.twoFactorAuth && (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-start gap-2 mt-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                          We strongly recommend enabling two-factor authentication to protect your account
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Change Password
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 border-t pt-4 flex justify-end">
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Account Management</CardTitle>
                    <CardDescription>Manage your account settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center p-3 border rounded-md">
                    <div>
                      <h3 className="text-sm font-medium">Account Type</h3>
                      <p className="text-xs text-muted-foreground">You're currently on the Student plan</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Plans
                    </Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center p-3 border rounded-md">
                    <div>
                      <h3 className="text-sm font-medium">Data Export</h3>
                      <p className="text-xs text-muted-foreground">Download a copy of your data</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Export Data
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center p-3 border border-destructive/20 bg-destructive/5 rounded-md">
                    <div>
                      <h3 className="text-sm font-medium">Sign Out from All Devices</h3>
                      <p className="text-xs text-muted-foreground">
                        Log out from all devices where you're currently signed in
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="border-destructive/30 text-destructive gap-1.5">
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out All
                    </Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center p-3 border border-destructive/20 bg-destructive/5 rounded-md">
                    <div>
                      <h3 className="text-sm font-medium">Delete Account</h3>
                      <p className="text-xs text-muted-foreground">
                        Permanently delete your account and all your data
                      </p>
                    </div>
                    <Button variant="destructive" size="sm" className="gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
} 