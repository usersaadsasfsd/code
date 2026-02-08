"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Home,
  Heart,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Package,
  Users,
  FileText,
} from "lucide-react"

interface DashboardSidebarProps {
  userRole: "buyer" | "builder" | "agent"
  userName?: string
}

export default function DashboardSidebar({ userRole, userName }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const navItems =
    userRole === "buyer"
      ? [
          { href: "/buyer", label: "Dashboard", icon: Home },
          { href: "/buyer/saved-properties", label: "Saved Properties", icon: Heart },
          { href: "/buyer/inquiries", label: "Inquiries", icon: FileText },
          { href: "/buyer/messages", label: "Messages", icon: MessageSquare },
          { href: "/buyer/profile", label: "Profile", icon: User },
          { href: "/buyer/settings", label: "Settings", icon: Settings },
        ]
      : [
          { href: "/builder", label: "Dashboard", icon: Home },
          { href: "/builder/properties", label: "Properties", icon: Package },
          { href: "/builder/leads", label: "Leads", icon: Users },
          { href: "/builder/messages", label: "Messages", icon: MessageSquare },
          { href: "/builder/analytics", label: "Analytics", icon: BarChart3 },
          { href: "/builder/profile", label: "Profile", icon: User },
          { href: "/builder/settings", label: "Settings", icon: Settings },
        ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-16 left-4 z-40 p-2 rounded-lg bg-primary text-primary-foreground"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <nav
        className={`${
          mobileOpen ? "block" : "hidden"
        } md:block w-full md:w-56 border-b md:border-r md:border-b-0 border-border bg-muted/30 md:fixed md:left-0 md:top-0 md:h-screen md:overflow-y-auto pt-16 md:pt-0`}
      >
        <div className="flex flex-col h-full p-4">
          {/* User Info */}
          <div className="mb-6 pb-4 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase">User Profile</p>
            <p className="text-sm font-medium text-foreground mt-2">{userName || "User"}</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs h-9 bg-transparent"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </nav>
    </>
  )
}
