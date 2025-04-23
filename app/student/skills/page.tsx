"use client"

import { useState } from "react"
import StudentDashboardLayout from "@/components/student-dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Import each icon individually to avoid barrel optimization issues
import { Award } from "lucide-react"
import { Book } from "lucide-react"
import { BookOpen } from "lucide-react"
import { Brain } from "lucide-react"
import { Clock } from "lucide-react"
import { Code2 } from "lucide-react"
import { FileCode } from "lucide-react"
import { Gauge } from "lucide-react"
import { Bolt } from "lucide-react"
import { LineChart } from "lucide-react"
import { Plus } from "lucide-react"
import { Star } from "lucide-react"
import { TerminalSquare } from "lucide-react"
import { Trophy } from "lucide-react"
import { Zap } from "lucide-react"

export default function SkillsPage() {
  const [activeTab, setActiveTab] = useState("current")

  // Helper function for score color
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-amber-600"
    return "text-red-600"
  }

  // Helper function for badge background and text color
  const getBadgeStyles = (category) => {
    switch (category) {
      case "Programming":
        return "bg-primary/10 text-primary hover:bg-primary/20"
      case "Framework":
        return "bg-primary/10 text-primary hover:bg-primary/20"
      case "Database":
        return "bg-primary/10 text-primary hover:bg-primary/20"
      case "Tools":
        return "bg-primary/10 text-primary hover:bg-primary/20"
      default:
        return "bg-primary/10 text-primary hover:bg-primary/20"
    }
  }

  // Mock data for skills
  const skills = [
    {
      id: 1,
      name: "JavaScript",
      category: "Programming",
      proficiency: 85,
      certified: true,
      lastPracticed: "2 days ago",
    },
    {
      id: 2,
      name: "React",
      category: "Framework",
      proficiency: 78,
      certified: false,
      lastPracticed: "1 week ago",
    },
    {
      id: 3,
      name: "TypeScript",
      category: "Programming",
      proficiency: 70,
      certified: false,
      lastPracticed: "3 days ago",
    },
    {
      id: 4,
      name: "Node.js",
      category: "Framework",
      proficiency: 65,
      certified: false,
      lastPracticed: "2 weeks ago",
    },
    {
      id: 5,
      name: "SQL",
      category: "Database",
      proficiency: 80,
      certified: true,
      lastPracticed: "1 month ago",
    },
    {
      id: 6,
      name: "Git",
      category: "Tools",
      proficiency: 90,
      certified: true,
      lastPracticed: "Yesterday",
    },
  ]

  // Mock data for recommended skills
  const recommendedSkills = [
    {
      id: 1,
      name: "Docker",
      category: "Tools",
      relevance: 95,
      difficulty: "Medium",
      timeToMaster: "2-4 weeks",
    },
    {
      id: 2,
      name: "GraphQL",
      category: "Framework",
      relevance: 88,
      difficulty: "Medium",
      timeToMaster: "3-5 weeks",
    },
    {
      id: 3,
      name: "AWS",
      category: "Tools",
      relevance: 92,
      difficulty: "High",
      timeToMaster: "4-8 weeks",
    },
    {
      id: 4,
      name: "Python",
      category: "Programming",
      relevance: 85,
      difficulty: "Low",
      timeToMaster: "2-3 weeks",
    },
  ]

  return (
    <StudentDashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Skills Assessment</h1>
            <p className="text-muted-foreground">Track, assess, and enhance your technical skills for job success</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Skill
          </Button>
        </div>

        {/* Skills Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Skill Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Advanced</div>
              <Progress value={75} className="mt-2" />
              <div className="mt-2 text-xs text-muted-foreground">
                <span>+5% from last assessment</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Skills Mastered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <div className="mt-2 text-xs text-muted-foreground">
                <span>3 skills pending certification</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Skill Gaps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <div className="mt-2 text-xs text-muted-foreground">
                <span>Based on your job preferences</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Job Match Factor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">72%</div>
              <div className="mt-2 text-xs text-muted-foreground">
                <span>15% increase with recommended skills</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Current Skills and Recommended Skills */}
        <Tabs defaultValue="current" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="current">My Skills</TabsTrigger>
            <TabsTrigger value="recommended">Recommended Skills</TabsTrigger>
          </TabsList>

          {/* Current Skills Tab */}
          <TabsContent value="current" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => (
                <Card key={skill.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-md font-medium">{skill.name}</CardTitle>
                      {skill.certified && (
                        <Trophy className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getBadgeStyles(skill.category)}>{skill.category}</Badge>
                      <div className="text-xs text-muted-foreground">Last practiced: {skill.lastPracticed}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">Proficiency</div>
                        <div className={`text-sm font-medium ${getScoreColor(skill.proficiency)}`}>
                          {skill.proficiency}%
                        </div>
                      </div>
                      <Progress value={skill.proficiency} className="h-2" />
                      <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1">
                        <Gauge className="h-3 w-3 mt-0.5" />
                        <span>
                          {skill.proficiency < 60
                            ? "Beginner"
                            : skill.proficiency < 80
                            ? "Intermediate"
                            : "Advanced"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-6">
                    <Button variant="outline" className="w-full">
                      <Book className="mr-2 h-4 w-4" /> Practice Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Skills Progress</CardTitle>
                    <CardDescription>Your skill development over time</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] rounded-md border bg-muted/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <LineChart className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">Skill Progress Chart</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Shows your skill development over the past 6 months
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button className="w-full">
                  <Bolt className="mr-2 h-4 w-4" /> Take Assessment
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Recommended Skills Tab */}
          <TabsContent value="recommended" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedSkills.map((skill) => (
                <Card key={skill.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-md font-medium">{skill.name}</CardTitle>
                      <div className="text-sm font-medium text-primary">{skill.relevance}%</div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getBadgeStyles(skill.category)}>{skill.category}</Badge>
                      <div className="text-xs text-muted-foreground">Difficulty: {skill.difficulty}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="text-sm">
                          <div>Time to Master</div>
                          <div className="text-sm text-muted-foreground">{skill.timeToMaster}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <TerminalSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="text-sm">
                          <div>Resources Available</div>
                          <div className="text-sm text-muted-foreground">12 courses, 5 projects</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Brain className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="text-sm">
                          <div>Required for</div>
                          <div className="text-sm text-muted-foreground">15 open jobs in your field</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-6">
                    <Button variant="outline" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" /> Learn This Skill
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>AI-Powered Insights</CardTitle>
                    <CardDescription>Personalized recommendations based on industry trends</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium flex items-center">
                      <FileCode className="h-4 w-4 mr-2 text-primary" /> Focus on Full-Stack Skills
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Employers in your target industry value candidates with both frontend and backend expertise. Grow your Node.js skills to complement your React knowledge.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium flex items-center">
                      <Code2 className="h-4 w-4 mr-2 text-primary" /> Add Cloud Certifications
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cloud skills are in high demand. AWS or Azure certifications would significantly increase your employability for 65% of your target jobs.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium flex items-center">
                      <Star className="h-4 w-4 mr-2 text-amber-500" /> Highlight Git in Interviews
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your Git proficiency is in the top 10% of candidates. Make sure to highlight your version control expertise during technical interviews.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button className="w-full">
                  <Award className="mr-2 h-4 w-4" /> Get Personalized Learning Plan
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentDashboardLayout>
  )
} 