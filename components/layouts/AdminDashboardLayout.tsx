"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Building2,
  Users,
  LineChart,
  Settings,
  Menu,
  Bell,
  Search,
  LogOut,
  LayoutDashboard
} from "lucide-react"

interface AdminDashboardLayoutProps {
  children: React.ReactNode
}

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const pathname = usePathname()

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      name: "Companies",
      href: "/admin/companies",
      icon: Building2,
      active: pathname.includes("/admin/companies"),
    },
    {
      name: "Students",
      href: "/admin/students",
      icon: Users,
      active: pathname.includes("/admin/students"),
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: LineChart,
      active: pathname.includes("/admin/analytics"),
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      active: pathname.includes("/admin/settings"),
    },
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
                <span className="text-xl font-bold">Recruivo Admin</span>
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
                </Link>
              ))}
            </nav>
            <div className="pt-4 mt-6 border-t">
              <div className="flex items-center px-3">
                <div className="flex-shrink-0">
                  <Avatar>
                    <AvatarImage src="/images/avatars/man-1.svg" alt="Profile" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium">Alex Davis</div>
                  <div className="text-xs text-muted-foreground">System Administrator</div>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto">
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
              <span className="text-xl font-bold">Recruivo Admin</span>
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
              </Link>
            ))}
          </nav>
          <div className="pt-4 mt-6 border-t">
            <div className="flex items-center px-3">
              <div className="flex-shrink-0">
                <Avatar>
                  <AvatarImage src="/images/avatars/man-1.svg" alt="Profile" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium">Alex Davis</div>
                <div className="text-xs text-muted-foreground">System Administrator</div>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto">
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
                <AvatarImage src="/images/avatars/man-1.svg" alt="Profile" />
                <AvatarFallback>AD</AvatarFallback>
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