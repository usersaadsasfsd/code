"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, ChevronDown, Home, LogOut, Settings, User } from "lucide-react"

interface DashboardHeaderProps {
  userName?: string
  userRole: "admin" | "agent" | "builder" | "buyer" | "customer"
}

export default function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case "admin":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      case "agent":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "builder":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      default:
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    }
  }

  const getDashboardPath = () => {
    switch (userRole) {
      case "admin":
        return "/admin/dashboard"
      case "agent":
        return "/agent/dashboard"
      case "builder":
        return "/builder"
      case "buyer":
      case "customer":
        return "/buyer"
      default:
        return "/dashboard"
    }
  }

  const getProfilePath = () => {
    switch (userRole) {
      case "admin":
        return "/admin/dashboard"
      case "agent":
        return "/agent/profile"
      case "builder":
        return "/builder/profile"
      case "buyer":
      case "customer":
        return "/buyer/profile"
      default:
        return "/dashboard/profile"
    }
  }

  const getSettingsPath = () => {
    switch (userRole) {
      case "builder":
        return "/builder/settings"
      case "buyer":
      case "customer":
        return "/buyer/settings"
      default:
        return getDashboardPath()
    }
  }

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CR</span>
            </div>
            <span className="hidden sm:inline-block font-semibold text-foreground">CountryRoof</span>
          </Link>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getRoleBadgeColor()}`}>
            {userRole === "customer" ? "Buyer" : userRole}
          </span>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Home Link */}
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Main Site
            </Link>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {userName ? getInitials(userName) : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block text-sm font-medium max-w-[100px] truncate">
                  {userName || "User"}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userName || "User"}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userRole === "customer" ? "Buyer" : userRole} Account
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={getDashboardPath()} className="cursor-pointer">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={getProfilePath()} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              {(userRole === "builder" || userRole === "buyer" || userRole === "customer") && (
                <DropdownMenuItem asChild>
                  <Link href={getSettingsPath()} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
