"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface DashboardNavProps {
  role: "customer" | "admin"
}

export default function DashboardNav({ role }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const isActive = (href: string) => pathname === href

  return (
    <nav className="w-full md:w-48 border-b md:border-r md:border-b-0 border-border bg-muted/30">
      <div className="flex md:flex-col gap-1 p-4 overflow-x-auto md:overflow-x-visible">
        <Link
          href="/dashboard"
          className={`px-3 py-2 text-xs font-medium rounded whitespace-nowrap transition-colors ${
            isActive("/dashboard") ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
          }`}
        >
          Dashboard
        </Link>

        <Link
          href="/dashboard/quotes"
          className={`px-3 py-2 text-xs font-medium rounded whitespace-nowrap transition-colors ${
            isActive("/dashboard/quotes") ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
          }`}
        >
          My Quotes
        </Link>

        <Link
          href="/dashboard/projects"
          className={`px-3 py-2 text-xs font-medium rounded whitespace-nowrap transition-colors ${
            isActive("/dashboard/projects") ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
          }`}
        >
          Projects
        </Link>

        <Link
          href="/dashboard/profile"
          className={`px-3 py-2 text-xs font-medium rounded whitespace-nowrap transition-colors ${
            isActive("/dashboard/profile") ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
          }`}
        >
          Profile
        </Link>

        {role === "admin" && (
          <Link
            href="/admin"
            className={`px-3 py-2 text-xs font-medium rounded whitespace-nowrap transition-colors text-orange-600 hover:bg-orange-50 ${
              isActive("/admin") ? "bg-orange-100" : ""
            }`}
          >
            Admin Panel
          </Link>
        )}

        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="text-xs h-8 ml-auto md:ml-0 md:mt-auto w-full md:w-auto bg-transparent"
        >
          Logout
        </Button>
      </div>
    </nav>
  )
}
