"use client"

import React, { useState } from "react"
import StudentDashboardLayout from "@/components/student-dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Import icons individually to avoid barrel optimization issues
import { Search } from "lucide-react"
import { Filter } from "lucide-react"
import { BookOpen } from "lucide-react"
import { CheckCircle } from "lucide-react"
import { Star } from "lucide-react"
import { Bookmark } from "lucide-react"
import { ThumbsUp } from "lucide-react"
import { MessageSquare } from "lucide-react"
import { Code } from "lucide-react"
import { PenTool } from "lucide-react"
import { Database } from "lucide-react"
import { Terminal } from "lucide-react"
import { FileText } from "lucide-react"
import { Lightbulb } from "lucide-react"
import { GraduationCap } from "lucide-react"

export default function QuestionBankPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([1, 5, 9])

  // Mock categories with icons
  const categories = [
    { id: "technical", name: "Technical", icon: Code },
    { id: "behavioral", name: "Behavioral", icon: MessageSquare },
    { id: "programming", name: "Programming", icon: Terminal },
    { id: "database", name: "Database", icon: Database },
    { id: "system-design", name: "System Design", icon: PenTool },
  ]

  // Mock interview questions data
  const interviewQuestions = [
    {
      id: 1,
      question: "What is the difference between let, const, and var in JavaScript?",
      answer: "var is function-scoped and can be redeclared/updated. let is block-scoped and can be updated but not redeclared. const is block-scoped and cannot be updated or redeclared.",
      category: "technical",
      difficulty: "medium",
      likes: 153,
      views: 1240,
      tags: ["JavaScript", "Frontend", "ES6"]
    },
    {
      id: 2,
      question: "Tell me about a time when you had to handle a difficult team situation",
      answer: "When answering behavioral questions, use the STAR method: Situation, Task, Action, Result. Describe the context, what was required, what you did, and the positive outcome.",
      category: "behavioral",
      difficulty: "hard",
      likes: 87,
      views: 956,
      tags: ["Teamwork", "Conflict Resolution", "Leadership"]
    },
    {
      id: 3,
      question: "Explain the concept of RESTful APIs and their principles",
      answer: "REST (Representational State Transfer) is an architectural style for designing networked applications. Its principles include: statelessness, client-server architecture, cacheability, layered system, uniform interface, and code on demand (optional).",
      category: "technical",
      difficulty: "medium",
      likes: 124,
      views: 1089,
      tags: ["API", "Backend", "Web Development"]
    },
    {
      id: 4,
      question: "How would you reverse a linked list?",
      answer: "To reverse a linked list: Initialize three pointers - prev as null, current as head, next as null. Iterate through the list, for each node: save next, point current to prev, move prev and current one step forward. Return prev as the new head.",
      category: "programming",
      difficulty: "hard",
      likes: 210,
      views: 1780,
      tags: ["Data Structures", "Algorithms", "Linked Lists"]
    },
    {
      id: 5, 
      question: "What is SQL injection and how can you prevent it?",
      answer: "SQL injection is a code injection technique where malicious SQL statements are inserted into entry fields. Prevention: use parameterized queries/prepared statements, input validation, ORM libraries, stored procedures, and principle of least privilege for database accounts.",
      category: "database",
      difficulty: "medium",
      likes: 167,
      views: 1342,
      tags: ["SQL", "Security", "Database"]
    },
    {
      id: 6,
      question: "Design a URL shortening service like Bit.ly",
      answer: "Components: URL storage database, shortening algorithm (hash function or counter-based encoding), API for shortening and redirection, analytics service. Consider: handling collisions, scalability, caching, analytics, and handling expired/invalid URLs.",
      category: "system-design",
      difficulty: "hard",
      likes: 234,
      views: 2105,
      tags: ["System Design", "Scalability", "Web Services"]
    },
    {
      id: 7,
      question: "What are React hooks? Explain useState and useEffect",
      answer: "Hooks are functions that let you use state and React features without writing classes. useState returns a stateful value and a function to update it. useEffect performs side effects in function components, combining componentDidMount, componentDidUpdate, and componentWillUnmount lifecycle methods.",
      category: "technical",
      difficulty: "medium",
      likes: 198,
      views: 1632,
      tags: ["React", "Frontend", "Hooks"]
    },
    {
      id: 8,
      question: "What is normalization in databases?",
      answer: "Normalization is the process of organizing data to reduce redundancy and improve data integrity. The main forms are: 1NF (atomic values), 2NF (remove partial dependencies), 3NF (remove transitive dependencies), BCNF, 4NF, and 5NF, each addressing specific types of anomalies.",
      category: "database",
      difficulty: "hard",
      likes: 142,
      views: 1089,
      tags: ["Database Design", "SQL", "Data Modeling"]
    },
    {
      id: 9,
      question: "Describe your approach to problem-solving",
      answer: "Effective answers should demonstrate a methodical approach: understanding the problem, breaking it down, considering alternatives, implementing a solution, testing/validating results, and reflecting on the outcome.",
      category: "behavioral",
      difficulty: "medium",
      likes: 76,
      views: 890,
      tags: ["Problem Solving", "Critical Thinking", "Methodology"]
    },
    {
      id: 10,
      question: "Implement a function to check if a string is a palindrome",
      answer: "```javascript\nfunction isPalindrome(str) {\n  // Remove non-alphanumeric and convert to lowercase\n  const cleaned = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();\n  // Compare with reversed\n  return cleaned === cleaned.split('').reverse().join('');\n}\n```",
      category: "programming",
      difficulty: "easy",
      likes: 118,
      views: 1450,
      tags: ["Strings", "Algorithms", "JavaScript"]
    },
    {
      id: 11,
      question: "Design a scalable notification system",
      answer: "Key components: notification service, delivery workers, user preferences DB, notification DB, queueing system. Consider: throttling, rate limiting, multiple channels (push, email, SMS), failover mechanisms, delivery tracking, and notification grouping/batching.",
      category: "system-design",
      difficulty: "hard",
      likes: 187,
      views: 1623,
      tags: ["System Design", "Distributed Systems", "Messaging"]
    },
    {
      id: 12,
      question: "What are promises in JavaScript and how do they work?",
      answer: "Promises represent eventual completion/failure of an asynchronous operation. They have states (pending, fulfilled, rejected) and methods (then(), catch(), finally()). They solve callback hell through chaining and improve error handling for asynchronous code.",
      category: "technical",
      difficulty: "medium",
      likes: 175,
      views: 1521,
      tags: ["JavaScript", "Asynchronous", "Promises"]
    }
  ]

  // Filter questions based on search, category, and difficulty
  const filteredQuestions = interviewQuestions.filter(q => {
    const matchesSearch = searchQuery === "" || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || q.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Helper function to get difficulty badge style
  const getDifficultyBadgeStyle = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "medium":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "hard":
        return "bg-destructive/10 text-destructive hover:bg-destructive/20";
      default:
        return "bg-secondary";
    }
  };

  // Toggle bookmark for a question
  const toggleBookmark = (questionId) => {
    if (bookmarkedQuestions.includes(questionId)) {
      setBookmarkedQuestions(bookmarkedQuestions.filter(id => id !== questionId));
    } else {
      setBookmarkedQuestions([...bookmarkedQuestions, questionId]);
    }
  }

  // Get CategoryIcon component
  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    const Icon = category ? category.icon : FileText;
    return Icon;
  }

  return (
    <StudentDashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Interview Question Bank</h1>
            <p className="text-muted-foreground">Prepare for interviews with our curated question database</p>
          </div>
          <Button>
            <BookOpen className="mr-2 h-4 w-4" /> Practice Mode
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search questions, topics, or tags..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="questions">All Questions</TabsTrigger>
            <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
          </TabsList>
          
          {/* All Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No questions found</h3>
                <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((question) => (
                  <Card key={question.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2 items-center">
                          {React.createElement(getCategoryIcon(question.category), {
                            className: "h-5 w-5 text-primary"
                          })}
                          <CardTitle className="text-base font-semibold">{question.question}</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleBookmark(question.id)}
                          className="shrink-0"
                        >
                          <Bookmark
                            className={`h-5 w-5 ${bookmarkedQuestions.includes(question.id) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                          />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className={getDifficultyBadgeStyle(question.difficulty)}>
                          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                        </Badge>
                        {question.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md bg-muted p-4">
                        <p className="text-sm whitespace-pre-wrap">{question.answer}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t py-3 justify-between">
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{question.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{question.views} views</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="mr-2 h-4 w-4" /> Community Answers
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Bookmarked Tab */}
          <TabsContent value="bookmarked" className="space-y-6">
            {bookmarkedQuestions.length === 0 ? (
              <div className="text-center py-8">
                <Bookmark className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No bookmarked questions</h3>
                <p className="mt-2 text-sm text-muted-foreground">Bookmark important questions to revisit them later</p>
              </div>
            ) : (
              <div className="space-y-4">
                {interviewQuestions
                  .filter(q => bookmarkedQuestions.includes(q.id))
                  .map((question) => (
                    <Card key={question.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-2 items-center">
                            {React.createElement(getCategoryIcon(question.category), {
                              className: "h-5 w-5 text-primary"
                            })}
                            <CardTitle className="text-base font-semibold">{question.question}</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleBookmark(question.id)}
                            className="shrink-0"
                          >
                            <Bookmark className="h-5 w-5 fill-primary text-primary" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge className={getDifficultyBadgeStyle(question.difficulty)}>
                            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                          </Badge>
                          {question.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md bg-muted p-4">
                          <p className="text-sm whitespace-pre-wrap">{question.answer}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t py-3 justify-between">
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{question.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{question.views} views</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="mr-2 h-4 w-4" /> Community Answers
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
          
          {/* By Category Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {React.createElement(category.icon, {
                        className: "h-5 w-5 text-primary"
                      })}
                      <CardTitle>{category.name} Questions</CardTitle>
                    </div>
                    <CardDescription>
                      {interviewQuestions.filter(q => q.category === category.id).length} questions available
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {interviewQuestions
                        .filter(q => q.category === category.id)
                        .slice(0, 3)
                        .map((question) => (
                          <div key={question.id} className="p-3 rounded-md border">
                            <p className="text-sm font-medium">{question.question}</p>
                            <div className="flex justify-between items-center mt-2">
                              <Badge className={getDifficultyBadgeStyle(question.difficulty)}>
                                {question.difficulty}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{question.views} views</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button variant="outline" className="w-full">
                      View All {category.name} Questions
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Analytics Section */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Practice Analytics</h2>
            <Button variant="outline" size="sm">View Detailed Stats</Button>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Questions Practiced</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">32</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600">+5 this week</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Knowledge Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">76%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600">+8% improvement</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Strongest Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Technical</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <span>85% accuracy rate</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Focus Area</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">System Design</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="text-amber-600">60% accuracy rate</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  )
} 