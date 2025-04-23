"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, Search, Briefcase, FileText, MessageSquare, Bell, Settings, User } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  userType?: "student" | "recruiter" | "admin"
}

export function DashboardLayout({ children, userType = "student" }: DashboardLayoutProps) {
  const pathname = usePathname()

  const studentNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/student" },
    { icon: Search, label: "Find Jobs", href: "/student/jobs" },
    { icon: FileText, label: "My Resume", href: "/student/resume" },
    { icon: Briefcase, label: "Applications", href: "/student/applications" },
    { icon: MessageSquare, label: "Messages", href: "/student/messages" },
    { icon: Settings, label: "Settings", href: "/student/settings" },
  ]

  const recruiterNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/recruiter" },
    { icon: Briefcase, label: "Job Postings", href: "/recruiter/jobs" },
    { icon: Search, label: "Candidates", href: "/recruiter/candidates" },
    { icon: MessageSquare, label: "Messages", href: "/recruiter/messages" },
    { icon: Settings, label: "Settings", href: "/recruiter/settings" },
  ]

  const adminNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Briefcase, label: "Companies", href: "/admin/companies" },
    { icon: FileText, label: "Students", href: "/admin/students" },
    { icon: Search, label: "Analytics", href: "/admin/analytics" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ]

  const navItems =
    userType === "student" ? studentNavItems : userType === "recruiter" ? recruiterNavItems : adminNavItems

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar className="border-r shadow-sm">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-white">R</span>
              </div>
              <span className="text-xl font-bold">Recruivo</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/images/avatars/man-1.svg" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary shadow-sm">
                    <User className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">John Doe</span>
                  <span className="text-xs text-muted-foreground">Student</span>
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary"></span>
              </Button>
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/avatars/man-1.svg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary shadow-sm">
                  <User className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

