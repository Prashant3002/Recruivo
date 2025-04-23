"use client"

import { useState } from "react"
import { RecruiterDashboardLayout } from "@/components/recruiter-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  User,
  Video,
  Phone,
  Building,
  Briefcase,
  Check
} from "lucide-react"

// Days of week
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Mock interview data
const INTERVIEWS = [
  {
    id: 1,
    candidate: {
      name: "Alex Johnson",
      position: "Senior Frontend Developer",
      company: "Previous: TechCorp",
      avatar: "/placeholder.svg?height=32&width=32",
      resumeScore: 92,
    },
    date: new Date(2023, 9, 16, 10, 30),
    endDate: new Date(2023, 9, 16, 11, 30),
    type: "video",
    status: "scheduled",
    job: "Senior Frontend Developer",
    stage: "Technical Interview"
  },
  {
    id: 2,
    candidate: {
      name: "Samantha Lee",
      position: "UX/UI Designer",
      company: "Previous: DesignHub",
      avatar: "/placeholder.svg?height=32&width=32",
      resumeScore: 88,
    },
    date: new Date(2023, 9, 16, 14, 0),
    endDate: new Date(2023, 9, 16, 15, 0),
    type: "in-person",
    status: "scheduled",
    job: "Senior UX Designer",
    stage: "Portfolio Review"
  },
  {
    id: 3,
    candidate: {
      name: "Michael Chen",
      position: "Full Stack Developer",
      company: "Previous: WebSolutions",
      avatar: "/placeholder.svg?height=32&width=32",
      resumeScore: 85,
    },
    date: new Date(2023, 9, 17, 11, 0),
    endDate: new Date(2023, 9, 17, 12, 0),
    type: "phone",
    status: "scheduled",
    job: "Full Stack Engineer",
    stage: "Initial Screening"
  },
  {
    id: 4,
    candidate: {
      name: "Emma Wilson",
      position: "DevOps Engineer",
      company: "Previous: CloudTech",
      avatar: "/placeholder.svg?height=32&width=32",
      resumeScore: 90,
    },
    date: new Date(2023, 9, 18, 13, 30),
    endDate: new Date(2023, 9, 18, 14, 30),
    type: "video",
    status: "scheduled",
    job: "Senior DevOps Engineer",
    stage: "Technical Assessment"
  },
  {
    id: 5,
    candidate: {
      name: "James Rodriguez",
      position: "Product Manager",
      company: "Previous: ProductFirm",
      avatar: "/placeholder.svg?height=32&width=32",
      resumeScore: 87,
    },
    date: new Date(2023, 9, 19, 15, 0),
    endDate: new Date(2023, 9, 19, 16, 0),
    type: "video",
    status: "scheduled",
    job: "Senior Product Manager",
    stage: "Team Interview"
  }
]

// Function to format time (e.g., "10:30 AM")
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

// Function to format date (e.g., "Oct 16, 2023")
function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Function to get interview status badge
function getStatusBadge(status) {
  switch (status) {
    case "scheduled":
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Scheduled</Badge>
    case "completed":
      return <Badge variant="outline" className="border-green-500 text-green-500">Completed</Badge>
    case "cancelled":
      return <Badge variant="outline" className="border-red-500 text-red-500">Cancelled</Badge>
    case "rescheduled":
      return <Badge variant="outline" className="border-amber-500 text-amber-500">Rescheduled</Badge>
    default:
      return null
  }
}

// Function to get interview type icon
function getTypeIcon(type) {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4" />
    case "phone":
      return <Phone className="h-4 w-4" />
    case "in-person":
      return <User className="h-4 w-4" />
    default:
      return <Video className="h-4 w-4" />
  }
}

export default function InterviewCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState("week")
  
  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Get first day of month and total days in month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  
  // Generate calendar days array
  const calendarDays = []
  const firstDayOfWeek = firstDayOfMonth.getDay()
  
  // Previous month days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate()
    calendarDays.push({
      date: new Date(currentYear, currentMonth - 1, prevMonthDays - i),
      isCurrentMonth: false
    })
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth, i),
      isCurrentMonth: true
    })
  }
  
  // Next month days
  const remainingDays = 42 - calendarDays.length // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth + 1, i),
      isCurrentMonth: false
    })
  }
  
  // Generate hours for day view
  const hours = []
  for (let i = 8; i <= 18; i++) {
    hours.push(i)
  }
  
  // Filter interviews for selected date
  const selectedDateInterviews = INTERVIEWS.filter((interview) => {
    return interview.date.toDateString() === selectedDate.toDateString()
  })
  
  // Navigate to previous month or week
  const navigatePrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    } else {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() - 7)
      setCurrentDate(newDate)
    }
  }
  
  // Navigate to next month or week
  const navigateNext = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    } else {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() + 7)
      setCurrentDate(newDate)
    }
  }
  
  // Generate week days for week view
  const generateWeekDays = () => {
    const weekDays = []
    const dayOfWeek = currentDate.getDay()
    const startDate = new Date(currentDate)
    startDate.setDate(currentDate.getDate() - dayOfWeek)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      weekDays.push(date)
    }
    
    return weekDays
  }
  
  const weekDays = generateWeekDays()
  
  // Filter interviews for week
  const weekInterviews = INTERVIEWS.filter((interview) => {
    const interviewDate = interview.date
    const weekStart = weekDays[0]
    const weekEnd = weekDays[6]
    return interviewDate >= weekStart && interviewDate <= weekEnd
  })
  
  // Get interviews for a specific day
  const getInterviewsForDay = (date) => {
    return INTERVIEWS.filter((interview) => {
      return interview.date.toDateString() === date.toDateString()
    })
  }
  
  // Format month year string
  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  
  // Format week range string
  const formatWeekRange = () => {
    const startOfWeek = weekDays[0]
    const endOfWeek = weekDays[6]
    const startMonth = startOfWeek.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short' })
    const startDay = startOfWeek.getDate()
    const endDay = endOfWeek.getDate()
    const year = endOfWeek.getFullYear()
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
    }
  }
  
  return (
    <RecruiterDashboardLayout>
      <div className="h-full w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Interview Calendar</h1>
            <p className="text-muted-foreground">Schedule and manage candidate interviews</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search interviews..." className="pl-8 w-[200px]" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Job Positions</SelectItem>
                <SelectItem value="frontend">Frontend Developer</SelectItem>
                <SelectItem value="ux">UX Designer</SelectItem>
                <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                <SelectItem value="devops">DevOps Engineer</SelectItem>
                <SelectItem value="product">Product Manager</SelectItem>
              </SelectContent>
            </Select>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule Interview</span>
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <div>
              <div className="flex items-center mb-1">
                <Button variant="ghost" size="icon" onClick={navigatePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold px-2">
                  {viewMode === "month" ? formatMonthYear() : formatWeekRange()}
                </h2>
                <Button variant="ghost" size="icon" onClick={navigateNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="ml-2" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Tabs defaultValue="week" className="w-full" onValueChange={setViewMode} value={viewMode}>
                <TabsList className="grid w-[180px] grid-cols-2">
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="h-[600px] overflow-y-auto">
              {/* Week View */}
              {viewMode === "week" && (
                <div className="flex flex-col h-full">
                  {/* Week Header */}
                  <div className="grid grid-cols-7 border-b">
                    {weekDays.map((day, index) => {
                      const isToday = day.toDateString() === new Date().toDateString()
                      const isSelected = day.toDateString() === selectedDate.toDateString()
                      
                      return (
                        <div
                          key={index}
                          className={`text-center py-2 border-r last:border-r-0 cursor-pointer
                          ${isToday ? "bg-primary/5" : ""}
                          ${isSelected ? "bg-primary/10" : ""}`}
                          onClick={() => setSelectedDate(day)}
                        >
                          <div className="text-xs text-muted-foreground">{DAYS[day.getDay()]}</div>
                          <div className="mt-1">
                            <span className={`h-8 w-8 rounded-full inline-flex items-center justify-center text-sm
                              ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
                              {day.getDate()}
                            </span>
                          </div>
                          <div className="mt-1">
                            {getInterviewsForDay(day).length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {getInterviewsForDay(day).length} interviews
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Week Content */}
                  <div className="grid grid-cols-7 h-full">
                    {weekDays.map((day, dayIndex) => {
                      const dayInterviews = getInterviewsForDay(day)
                      
                      return (
                        <div
                          key={dayIndex}
                          className="border-r last:border-r-0 h-full relative"
                        >
                          <div className="px-1 py-1">
                            {dayInterviews.map((interview, interviewIndex) => {
                              const startHour = interview.date.getHours() + interview.date.getMinutes() / 60
                              const endHour = interview.endDate.getHours() + interview.endDate.getMinutes() / 60
                              const duration = endHour - startHour
                              const top = ((startHour - 8) / 10) * 100
                              const height = (duration / 10) * 100
                              
                              return (
                                <div
                                  key={interviewIndex}
                                  className="absolute left-1 right-1 rounded-md px-2 py-1 overflow-hidden border border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                                  style={{
                                    top: `${top}%`,
                                    height: `${height}%`,
                                  }}
                                  onClick={() => {
                                    // Handle click
                                  }}
                                >
                                  <div className="flex items-center gap-1 text-xs">
                                    <div className="p-1 rounded-full bg-primary/20">
                                      {getTypeIcon(interview.type)}
                                    </div>
                                    <div className="font-medium truncate">
                                      {formatTime(interview.date)}
                                    </div>
                                  </div>
                                  <div className="mt-1 text-xs font-medium truncate">
                                    {interview.candidate?.name?.split(' ')?.[0] || 'Candidate'}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {interview.job}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          
                          {/* Hour Markers */}
                          {dayIndex === 0 && (
                            <div className="absolute inset-0 pointer-events-none">
                              {hours.map((hour, hourIndex) => (
                                <div
                                  key={hourIndex}
                                  className="absolute left-0 right-0 border-t border-dashed border-border/50 text-xs text-muted-foreground pl-1"
                                  style={{
                                    top: `${(hourIndex / hours.length) * 100}%`,
                                  }}
                                >
                                  {hour}:00
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* Month View */}
              {viewMode === "month" && (
                <div className="h-full">
                  {/* Month Header */}
                  <div className="grid grid-cols-7 border-b">
                    {DAYS.map((day) => (
                      <div key={day} className="text-center py-2 text-xs font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Month Grid */}
                  <div className="grid grid-cols-7 h-[calc(100%-2rem)]">
                    {calendarDays.map((day, index) => {
                      const isToday = day.date.toDateString() === new Date().toDateString()
                      const isSelected = day.date.toDateString() === selectedDate.toDateString()
                      const dayInterviews = getInterviewsForDay(day.date)
                      
                      return (
                        <div
                          key={index}
                          className={`h-[100px] border-r border-b p-1 ${
                            day.isCurrentMonth ? "" : "bg-muted/20"
                          } ${isToday ? "bg-primary/5" : ""} ${isSelected ? "bg-primary/10" : ""}`}
                          onClick={() => setSelectedDate(day.date)}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`text-sm inline-flex h-6 w-6 items-center justify-center rounded-full
                              ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
                              {day.date.getDate()}
                            </span>
                          </div>
                          <div className="mt-1 space-y-1 overflow-y-auto max-h-[70px]">
                            {dayInterviews.map((interview) => (
                              <div
                                key={interview.id}
                                className="text-xs p-1 rounded bg-primary/10 border border-primary/20 truncate"
                              >
                                {formatTime(interview.date)} - {interview.candidate?.name?.split(' ')?.[0] || 'Candidate'}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>Your schedule for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weekInterviews.length > 0 ? (
                  weekInterviews.sort((a, b) => a.date - b.date).map((interview) => (
                    <div key={interview.id} className="flex items-start border rounded-md p-4 gap-4">
                      <Avatar>
                        <AvatarImage src={interview.candidate.avatar} alt={interview.candidate.name} />
                        <AvatarFallback>
                          {interview.candidate?.name ? interview.candidate.name.split(" ").map(n => n[0]).join("") : "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h3 className="font-medium">{interview.candidate.name}</h3>
                          {getStatusBadge(interview.status)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            <span className="truncate">{interview.job}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="truncate">{interview.stage}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDate(interview.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(interview.date)} - {formatTime(interview.endDate)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <Button size="sm" variant="outline" className="h-8 gap-1.5">
                            {getTypeIcon(interview.type)}
                            <span>Join</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-8" asChild>
                            <span>Reschedule</span>
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 px-2">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No interviews scheduled</h3>
                    <p className="text-muted-foreground mt-1">
                      You don't have any interviews scheduled for this week
                    </p>
                    <Button className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Schedule Interview
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Selected Date</CardTitle>
              <CardDescription>{formatDate(selectedDate)}</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateInterviews.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateInterviews.map((interview) => (
                    <div key={interview.id} className="border rounded-md p-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          {getTypeIcon(interview.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {formatTime(interview.date)} - {formatTime(interview.endDate)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {interview.stage}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={interview.candidate.avatar} alt={interview.candidate.name} />
                          <AvatarFallback>
                            {interview.candidate?.name ? interview.candidate.name.split(" ").map(n => n[0]).join("") : "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{interview.candidate.name}</div>
                          <div className="text-xs text-muted-foreground">{interview.job}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 w-full">
                          <Check className="h-3 w-3" />
                          Confirm
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 w-full">
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-10 w-10 mx-auto text-muted-foreground/50" />
                  <h3 className="mt-4 text-sm font-medium">No interviews scheduled</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    No interviews scheduled for {formatDate(selectedDate)}
                  </p>
                  <Button size="sm" className="mt-4 gap-1 text-xs">
                    <Plus className="h-3 w-3" />
                    Add Interview
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RecruiterDashboardLayout>
  )
} 