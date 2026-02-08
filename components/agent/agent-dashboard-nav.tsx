"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Package, MessageSquare, Star, LogOut, User } from "lucide-react"

export default function AgentDashboardNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const navItems = [
    { href: "/agent/dashboard", label: "Dashboard", icon: Home },
    { href: "/agent/properties", label: "Properties", icon: Package },
    { href: "/agent/reviews", label: "Reviews", icon: Star },
    { href: "/agent/tickets", label: "Support Tickets", icon: MessageSquare },
    { href: "/agent/profile", label: "Profile", icon: User },
  ]

  return (
    <nav className="w-full md:w-56 border-b md:border-r md:border-b-0 border-border bg-muted/30">
      <div className="flex md:flex-col gap-1 p-4 overflow-x-auto md:overflow-x-visible">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                isActive(item.href) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          )
        })}

        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="text-xs h-8 ml-auto md:ml-0 md:mt-auto w-full md:w-auto bg-transparent justify-start"
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>
    </nav>
  )
}
