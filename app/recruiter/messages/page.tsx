"use client"

import { useState } from "react"
import { RecruiterDashboardLayout } from "@/components/recruiter-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  User,
  MessageSquare,
  Clock,
  CheckCircle,
  Calendar,
  ArrowRight,
  Plus,
  Smile,
  PhoneCall,
  Video,
  ChevronDown,
  ChevronRight,
  Filter,
  Clock3
} from "lucide-react"

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<number>(1)
  const [messageText, setMessageText] = useState("")
  
  // Mock conversation data
  const conversations = [
    {
      id: 1,
      candidate: {
        name: "Alex Johnson",
        position: "Senior Frontend Developer",
        company: "TechCorp",
        avatar: "/placeholder.svg?height=40&width=40",
        online: true,
        lastActive: "Just now",
        resumeScore: 92,
        matchScore: 95,
      },
      unread: 2,
      lastMessage: {
        text: "I'm available for an interview this Thursday at 2 PM.",
        time: "10:30 AM",
        sender: "candidate",
      },
      messages: [
        { id: 1, text: "Hello Alex, I'm Rachel, a recruiter at TechCorp. I noticed you applied for the Senior Frontend Developer position and your profile looks impressive!", time: "Yesterday, 2:30 PM", sender: "recruiter" },
        { id: 2, text: "Thank you Rachel! I'm very interested in the role and would love to discuss it further.", time: "Yesterday, 3:15 PM", sender: "candidate" },
        { id: 3, text: "Great! I'd like to schedule a technical assessment to evaluate your skills. Would you be available this week?", time: "Yesterday, 4:00 PM", sender: "recruiter" },
        { id: 4, text: "Yes, I'm available. What kind of assessment should I expect?", time: "Yesterday, 4:45 PM", sender: "candidate" },
        { id: 5, text: "It's a 1-hour coding challenge focused on React and TypeScript. How does Thursday at 2 PM sound?", time: "Today, 9:15 AM", sender: "recruiter" },
        { id: 6, text: "I'm available for an interview this Thursday at 2 PM.", time: "10:30 AM", sender: "candidate" },
      ]
    },
    {
      id: 2,
      candidate: {
        name: "Samantha Lee",
        position: "UI/UX Designer",
        company: "DesignHub",
        avatar: "/placeholder.svg?height=40&width=40",
        online: false,
        lastActive: "30 minutes ago",
        resumeScore: 88,
        matchScore: 87,
      },
      unread: 0,
      lastMessage: {
        text: "Thank you for sharing the details about the design challenge.",
        time: "Yesterday",
        sender: "candidate",
      },
      messages: [
        { id: 1, text: "Hi Samantha, I'm Rachel from DesignHub. Thanks for applying to our UI/UX Designer position.", time: "2 days ago, 11:30 AM", sender: "recruiter" },
        { id: 2, text: "Hello Rachel! Thank you for reaching out. I'm excited about the opportunity.", time: "2 days ago, 12:45 PM", sender: "candidate" },
        { id: 3, text: "We'd like to move forward with your application. The next step is a design challenge. Are you interested?", time: "2 days ago, 2:00 PM", sender: "recruiter" },
        { id: 4, text: "Absolutely! Could you provide more details about the challenge?", time: "2 days ago, 3:30 PM", sender: "candidate" },
        { id: 5, text: "The challenge involves redesigning a feature of our app. I'll email you the full brief, but you'll have 3 days to complete it.", time: "Yesterday, 10:00 AM", sender: "recruiter" },
        { id: 6, text: "Thank you for sharing the details about the design challenge.", time: "Yesterday, 11:15 AM", sender: "candidate" },
      ]
    },
    {
      id: 3,
      candidate: {
        name: "Michael Chen",
        position: "Full Stack Developer",
        company: "WebSolutions",
        avatar: "/placeholder.svg?height=40&width=40",
        online: true,
        lastActive: "Just now",
        resumeScore: 85,
        matchScore: 79,
      },
      unread: 0,
      lastMessage: {
        text: "I've just submitted my application for the Full Stack Developer position.",
        time: "2 days ago",
        sender: "candidate",
      },
      messages: [
        { id: 1, text: "I've just submitted my application for the Full Stack Developer position.", time: "2 days ago, 9:30 AM", sender: "candidate" },
      ]
    },
    {
      id: 4,
      candidate: {
        name: "Emma Wilson",
        position: "DevOps Engineer",
        company: "CloudTech",
        avatar: "/placeholder.svg?height=40&width=40",
        online: false,
        lastActive: "2 hours ago",
        resumeScore: 73,
        matchScore: 62,
      },
      unread: 0,
      lastMessage: {
        text: "I understand. Thank you for considering my application and providing feedback.",
        time: "3 days ago",
        sender: "candidate",
      },
      messages: [
        { id: 1, text: "Hello Emma, I'm Rachel from CloudTech. I'm reaching out regarding your DevOps Engineer application.", time: "3 days ago, 10:00 AM", sender: "recruiter" },
        { id: 2, text: "Hi Rachel, thank you for getting back to me! I'm looking forward to hearing more.", time: "3 days ago, 10:30 AM", sender: "candidate" },
        { id: 3, text: "After reviewing your application, we've decided to move forward with candidates who have more experience with Kubernetes and AWS. We appreciate your interest in CloudTech.", time: "3 days ago, 11:15 AM", sender: "recruiter" },
        { id: 4, text: "I understand. Thank you for considering my application and providing feedback.", time: "3 days ago, 12:00 PM", sender: "candidate" },
      ]
    },
  ]
  
  const handleSendMessage = () => {
    if (messageText.trim() === "") return
    
    // In a real app, you would send the message to the server here
    // For this demo, we'll just reset the input
    setMessageText("")
  }
  
  const getQuickReplies = (candidateName) => [
    `Hi ${candidateName}, thanks for your application. We'd like to schedule an interview.`,
    `We've reviewed your application and would like to move forward with the next steps.`,
    `Could you please provide your availability for an interview next week?`,
    `Thank you for your interest. We'll be in touch soon with more information.`,
  ]

  return (
    <RecruiterDashboardLayout>
      <div className="h-full w-full flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground">Communicate with candidates and schedule interviews</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="hidden sm:flex">
              <Filter className="h-4 w-4" />
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Message</span>
            </Button>
          </div>
        </div>
        
        <div className="relative h-[calc(100vh-12rem)] border rounded-lg overflow-hidden grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-0">
          {/* Conversation list */}
          <div className="sm:col-span-1 border-r flex flex-col">
            <div className="p-3 border-b flex items-center">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search messages..." className="pl-8" />
              </div>
            </div>
            
            <div className="p-2 border-b">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="overflow-y-auto flex-grow">
              {conversations.map((convo) => (
                <div
                  key={convo.id}
                  className={`flex items-start p-3 gap-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversation === convo.id ? "bg-muted/80 border-l-4 border-primary" : "border-l-4 border-transparent"
                  }`}
                  onClick={() => setSelectedConversation(convo.id)}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={convo.candidate.avatar} alt={convo.candidate.name} />
                      <AvatarFallback>
                        {convo.candidate?.name ? convo.candidate.name.split(" ").map(n => n[0]).join("") : "C"}
                      </AvatarFallback>
                    </Avatar>
                    {convo.candidate.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{convo.candidate.name}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{convo.lastMessage.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{convo.candidate.position}</p>
                    <p className="text-xs truncate mt-1">{convo.lastMessage.text}</p>
                    <div className="flex items-center justify-between mt-1">
                      {convo.unread > 0 && (
                        <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {convo.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Chat area */}
          <div className="sm:col-span-2 lg:col-span-3 flex flex-col h-full">
            {selectedConversation ? (
              <>
                {/* Chat header */}
                <div className="p-3 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage 
                          src={conversations.find(c => c.id === selectedConversation)?.candidate.avatar} 
                          alt={conversations.find(c => c.id === selectedConversation)?.candidate.name} 
                        />
                        <AvatarFallback>
                          {conversations.find(c => c.id === selectedConversation)?.candidate?.name ? 
                            conversations.find(c => c.id === selectedConversation)?.candidate.name.split(" ").map(n => n[0]).join("") : "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{conversations.find(c => c.id === selectedConversation)?.candidate.name}</h3>
                          {conversations.find(c => c.id === selectedConversation)?.candidate.online ? (
                            <Badge variant="outline" className="h-5 px-1.5 text-xs gap-1 border-green-500 text-green-500">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              Online
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Last active: {conversations.find(c => c.id === selectedConversation)?.candidate.lastActive}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {conversations.find(c => c.id === selectedConversation)?.candidate.position} • 
                          {conversations.find(c => c.id === selectedConversation)?.candidate.company}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-medium">
                              {conversations.find(c => c.id === selectedConversation)?.candidate.resumeScore}% Resume
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-medium">
                              {conversations.find(c => c.id === selectedConversation)?.candidate.matchScore}% Match
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <PhoneCall className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Chat messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                  {conversations
                    .find(c => c.id === selectedConversation)
                    ?.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "recruiter" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] p-3 rounded-lg ${
                            message.sender === "recruiter"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/60"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p
                            className={`text-xs mt-1 text-right ${
                              message.sender === "recruiter"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {message.time}
                          </p>
                        </div>
                      </div>
                    ))
                  }
                </div>
                
                {/* Quick replies */}
                <div className="p-2 border-t">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap pl-1">Quick replies:</span>
                    {getQuickReplies(conversations.find(c => c.id === selectedConversation)?.candidate?.name?.split(" ")?.[0] || 'candidate').map((reply, index) => (
                      <Button
                        key={index}
                        variant="secondary"
                        size="sm"
                        className="text-xs whitespace-nowrap"
                        onClick={() => setMessageText(reply)}
                      >
                        {reply.length > 35 ? `${reply.substring(0, 35)}...` : reply}
                      </Button>
                    ))}
                  </div>
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
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
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
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Select a conversation</h3>
                <p className="text-muted-foreground mt-1 text-center max-w-md">
                  Choose a candidate from the list to view your conversation history and send messages
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RecruiterDashboardLayout>
  )
} 