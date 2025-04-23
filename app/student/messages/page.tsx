"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  User,
  Building2,
  MessageSquare,
  Clock,
  CheckCircle,
  Image,
  Link2,
  Plus,
  ArrowRight,
  Bell,
  Smile,
  PhoneCall,
  Video
} from "lucide-react"

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<number>(1)
  const [messageText, setMessageText] = useState("")
  
  // Mock data for chats
  const chats = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Technical Recruiter",
      company: "TechCorp",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Thank you for your interest in the Software Engineer position.",
      time: "10:30 AM",
      unread: 2,
      online: true,
      isRecruiter: true,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "HR Manager",
      company: "InnovateTech",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Your application for Frontend Developer has been received.",
      time: "Yesterday",
      unread: 0,
      online: false,
      isRecruiter: true,
    },
    {
      id: 3,
      name: "Recruivo Assistant",
      role: "AI Assistance",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Here's a list of jobs matching your profile this week.",
      time: "2 days ago",
      unread: 0,
      online: true,
      isRecruiter: false,
    },
    {
      id: 4,
      name: "Robert Wilson",
      role: "Senior Technical Recruiter",
      company: "CloudNine",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Congratulations! We're excited to offer you the DevOps position.",
      time: "3 days ago",
      unread: 0,
      online: false,
      isRecruiter: true,
    },
  ]
  
  // Mock message data
  const conversations = {
    1: [
      { id: 1, sender: "recruiter", text: "Hi there! I noticed your application for the Software Engineer Intern position at TechCorp. Your profile looks impressive!", time: "10:15 AM" },
      { id: 2, sender: "recruiter", text: "I'd like to schedule a quick technical assessment to evaluate your skills. Would you be available this week?", time: "10:16 AM" },
      { id: 3, sender: "user", text: "Hello Sarah! Thank you for reaching out. Yes, I'm very interested in the position and would be happy to complete the technical assessment.", time: "10:20 AM" },
      { id: 4, sender: "user", text: "I'm available any day this week after 2 PM EST. Could you please provide more details about the assessment?", time: "10:21 AM" },
      { id: 5, sender: "recruiter", text: "Great! The assessment will take approximately 1 hour and covers fundamental programming concepts, data structures, and a small coding challenge.", time: "10:25 AM" },
      { id: 6, sender: "recruiter", text: "How about Thursday at 3 PM EST? I'll send you the assessment link once confirmed.", time: "10:26 AM" },
      { id: 7, sender: "user", text: "Thursday at 3 PM EST works perfectly for me! I'll block that time on my calendar.", time: "10:28 AM" },
      { id: 8, sender: "recruiter", text: "Perfect! I've scheduled you for the assessment. You'll receive an email with instructions shortly. Let me know if you have any questions before then. Good luck!", time: "10:30 AM" },
    ],
    2: [
      { id: 1, sender: "recruiter", text: "Hello! Thank you for applying to the Frontend Developer position at InnovateTech.", time: "Yesterday" },
      { id: 2, sender: "recruiter", text: "We've received your application and are currently reviewing it. We'll be in touch soon with next steps.", time: "Yesterday" },
      { id: 3, sender: "user", text: "Thank you for confirming receipt of my application. I'm looking forward to hearing more about the position and potentially discussing my qualifications further.", time: "Yesterday" },
      { id: 4, sender: "recruiter", text: "You're welcome! We appreciate your interest in joining InnovateTech. Our team will carefully review your application and get back to you within the next 5-7 business days.", time: "Yesterday" },
    ],
    3: [
      { id: 1, sender: "recruiter", text: "Hello! I'm your AI assistant at Recruivo. I'll help you find job opportunities, prepare for interviews, and optimize your resume.", time: "2 days ago" },
      { id: 2, sender: "recruiter", text: "Based on your profile, I've found several job openings that match your skills and preferences.", time: "2 days ago" },
      { id: 3, sender: "recruiter", text: "Here's a list of top matches this week:", time: "2 days ago" },
      { id: 4, sender: "recruiter", type: "job-matches", jobs: [
        { title: "Software Engineer", company: "TechCorp", match: "92%" },
        { title: "Frontend Developer", company: "InnovateTech", match: "87%" },
        { title: "Full Stack Developer", company: "WebSolutions", match: "85%" },
      ], time: "2 days ago" },
      { id: 5, sender: "user", text: "Thanks! Can you tell me more about the Frontend Developer position at InnovateTech?", time: "2 days ago" },
      { id: 6, sender: "recruiter", text: "The Frontend Developer position at InnovateTech requires 2+ years of experience with React, TypeScript, and modern CSS frameworks. They offer remote work, competitive salary, and great benefits. Would you like me to help you prepare your application?", time: "2 days ago" },
    ],
    4: [
      { id: 1, sender: "recruiter", text: "Hello! I'm pleased to inform you that after careful consideration, we would like to offer you the DevOps Engineer position at CloudNine!", time: "3 days ago" },
      { id: 2, sender: "recruiter", text: "Your technical skills and cultural fit impressed our entire team. We believe you would be a valuable addition to CloudNine.", time: "3 days ago" },
      { id: 3, sender: "recruiter", text: "The formal offer letter will be sent to your email shortly. Please let me know if you have any questions about the offer or the role.", time: "3 days ago" },
      { id: 4, sender: "user", text: "Thank you so much for the wonderful news! I'm thrilled to receive this offer and very excited about joining the CloudNine team.", time: "3 days ago" },
      { id: 5, sender: "user", text: "I'll review the offer details once I receive the email and get back to you with any questions. Thanks again for this opportunity!", time: "3 days ago" },
      { id: 6, sender: "recruiter", text: "You're welcome! We're equally excited to have you join our team. Take your time reviewing the offer, and feel free to reach out with any questions or concerns. We look forward to welcoming you to CloudNine!", time: "3 days ago" },
    ],
  }
  
  const handleSendMessage = () => {
    if (messageText.trim() === "") return
    
    // In a real application, you would send the message to the server here
    // For this demo, we'll just reset the input
    setMessageText("")
  }
  
  const formatMessageTime = (time) => {
    return time
  }
  
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  return (
    <DashboardLayout userType="student">
      <div className="h-full w-full flex flex-col overflow-hidden">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground">Connect with recruiters and get job updates</p>
          </div>
          <div className="flex gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search messages..." className="pl-8" />
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Message</span>
            </Button>
          </div>
        </div>
        
        <div className="grid flex-1 overflow-hidden grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-0 border rounded-lg">
          {/* Chat list */}
          <div className="sm:col-span-1 border-r">
            <div className="p-3 border-b">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="recruiters">Recruiters</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="overflow-y-auto h-[calc(100%-53px)]">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedChat === chat.id ? "bg-muted/80 border-l-4 border-primary" : "border-l-4 border-transparent"
                  }`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={chat.avatar} alt={chat.name} />
                      <AvatarFallback>{getInitials(chat.name)}</AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
                    )}
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background shadow-sm">
                      {chat.isRecruiter ? (
                        <User className="h-3 w-3 text-primary" />
                      ) : (
                        <MessageSquare className="h-3 w-3 text-primary" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{chat.name}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{chat.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{chat.role}</p>
                    {chat.company && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground truncate">{chat.company}</p>
                      </div>
                    )}
                    <p className="text-xs truncate mt-1">{chat.lastMessage}</p>
                    <div className="flex items-center justify-between mt-1">
                      {chat.unread > 0 && (
                        <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {chat.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Chat content */}
          <div className="sm:col-span-2 lg:col-span-3 flex flex-col h-full">
            {selectedChat && (
              <>
                {/* Chat header */}
                <div className="p-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={chats.find(c => c.id === selectedChat)?.avatar} 
                          alt={chats.find(c => c.id === selectedChat)?.name} 
                        />
                        <AvatarFallback>
                          {getInitials(chats.find(c => c.id === selectedChat)?.name || "")}
                        </AvatarFallback>
                      </Avatar>
                      {chats.find(c => c.id === selectedChat)?.online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{chats.find(c => c.id === selectedChat)?.name}</h3>
                        {chats.find(c => c.id === selectedChat)?.online && (
                          <Badge variant="outline" className="h-5 px-1.5 text-xs gap-1 border-green-500 text-green-500">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Online
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {chats.find(c => c.id === selectedChat)?.role}
                        {chats.find(c => c.id === selectedChat)?.company && (
                          <> · {chats.find(c => c.id === selectedChat)?.company}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <PhoneCall className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conversations[selectedChat]?.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                      {message.type === "job-matches" ? (
                        <div className="max-w-[85%] bg-muted/50 rounded-lg p-3 space-y-2">
                          <div className="space-y-2">
                            {message.jobs.map((job, index) => (
                              <div key={index} className="flex items-start gap-3 p-2 bg-background rounded-md">
                                <div className="h-8 w-8 bg-primary/10 rounded-md flex items-center justify-center">
                                  <Building2 className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">{job.title}</h4>
                                  <p className="text-xs text-muted-foreground">{job.company}</p>
                                </div>
                                <Badge className="ml-auto shrink-0 bg-primary/10 hover:bg-primary/20 text-primary border-0">
                                  {job.match}
                                </Badge>
                              </div>
                            ))}
                          </div>
                          <Button variant="outline" size="sm" className="gap-1 text-xs w-full">
                            <ArrowRight className="h-3.5 w-3.5" />
                            View All Matches
                          </Button>
                          <p className="text-xs text-muted-foreground text-right">{message.time}</p>
                        </div>
                      ) : (
                        <div 
                          className={`max-w-[85%] p-3 rounded-lg ${
                            message.sender === "user" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted/50"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === "user" 
                              ? "text-primary-foreground/70" 
                              : "text-muted-foreground"
                          } text-right`}>
                            {formatMessageTime(message.time)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Message input */}
                <div className="p-3 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Smile className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder="Type a message..."
                        className="pr-10"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSendMessage()
                          }
                        }}
                      />
                    </div>
                    <Button 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={handleSendMessage}
                      disabled={messageText.trim() === ""}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 