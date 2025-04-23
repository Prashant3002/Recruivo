"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuthContext } from "@/components/providers/auth-provider"
import { toast } from "@/components/ui/use-toast"
import {
  LayoutDashboard,
  Search,
  FileText,
  Briefcase,
  MessageSquare,
  Settings,
  GraduationCap,
  Menu,
  Bell,
  LogOut,
  Zap,
  Building2
} from "lucide-react"

interface StudentDashboardLayoutProps {
  children: React.ReactNode
}

export default function StudentDashboardLayout({ children }: StudentDashboardLayoutProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuthContext();
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/student",
      icon: LayoutDashboard,
      active: pathname === "/student",
    },
    {
      name: "Find Jobs",
      href: "/student/jobs",
      icon: Briefcase,
      active: pathname.includes("/student/jobs"),
    },
    {
      name: "My Resume",
      href: "/student/resume",
      icon: FileText,
      active: pathname.includes("/student/resume"),
    },
    {
      name: "Applications",
      href: "/student/applications",
      icon: Search,
      active: pathname.includes("/student/applications"),
    },
    {
      name: "Skill Assessment",
      href: "/student/skills",
      icon: Zap,
      active: pathname.includes("/student/skills"),
    },
    {
      name: "Question Bank",
      href: "/student/question-bank",
      icon: GraduationCap,
      active: pathname.includes("/student/question-bank"),
    }
  ]

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Mobile navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden absolute left-4 top-3 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex flex-col h-full py-4 px-3 bg-card border-r">
            <div className="flex items-center mb-10 pl-3">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded mr-3 bg-primary text-primary-foreground grid place-items-center text-lg font-semibold">
                  R
                </div>
                <span className="text-xl font-bold">Recruivo</span>
              </div>
            </div>
            <nav className="space-y-1 flex-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors relative ${
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${item.active ? "text-primary" : ""}`} />
                  {item.name}
                  {item.notificationCount && (
                    <Badge className="ml-auto bg-primary text-xs">{item.notificationCount}</Badge>
                  )}
                </Link>
              ))}
            </nav>
            <div className="pt-4 mt-6 border-t">
              <div className="flex items-center pl-3 mb-3">
                <div className="flex-shrink-0">
                  <Avatar>
                    <AvatarImage src="/images/avatars/man-2.svg" alt="Profile" />
                    <AvatarFallback>
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium">{user?.name || 'User'}</div>
                  <div className="text-xs text-muted-foreground">
                    {user?.role === 'student' ? 'Student' : user?.role || 'User'}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0">
        <div className="flex flex-col h-full py-4 px-3 bg-card border-r">
          <div className="flex items-center mb-10 pl-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded mr-3 bg-primary text-primary-foreground grid place-items-center text-lg font-semibold">
                R
              </div>
              <span className="text-xl font-bold">Recruivo</span>
            </div>
          </div>
          <nav className="space-y-1 flex-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors relative ${
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${item.active ? "text-primary" : ""}`} />
                {item.name}
                {item.notificationCount && (
                  <Badge className="ml-auto bg-primary text-xs">{item.notificationCount}</Badge>
                )}
              </Link>
            ))}
          </nav>
          <div className="pt-4 mt-6 border-t">
            <div className="flex items-center pl-3 mb-3">
              <div className="flex-shrink-0">
                <Avatar>
                  <AvatarImage src="/images/avatars/man-2.svg" alt="Profile" />
                  <AvatarFallback>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium">{user?.name || 'User'}</div>
                <div className="text-xs text-muted-foreground">
                  {user?.role === 'student' ? 'Student' : user?.role || 'User'}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <div className="w-full flex items-center justify-between">
            {/* Search */}
            <div className="hidden md:block relative md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="pl-8" />
            </div>
            
            {/* Right side of header */}
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute h-2 w-2 bg-red-500 rounded-full top-2 right-2"></span>
              </Button>
              <Avatar className="h-9 w-9 md:hidden">
                <AvatarImage src="/images/avatars/man-2.svg" alt="Profile" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  )
} 