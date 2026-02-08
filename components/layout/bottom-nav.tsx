"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Heart, Plus, MessageSquare, User } from "lucide-react"

interface CurrentUser {
  id: string
  email: string
  username: string
  user_type: "customer" | "agent" | "admin"
}

export default function BottomNav() {
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isBuilder, setIsBuilder] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" })
        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data.user)
          setIsBuilder(data.user.user_type === "agent" || data.user.user_type === "admin")
        }
      } catch {
        // User not logged in
      }
    }

    checkAuth()
  }, [])

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/")

  // Hide bottom nav on dashboard/admin pages
  if (
    pathname?.includes("/buyer") ||
    pathname?.includes("/builder") ||
    pathname?.includes("/dashboard") ||
    pathname?.includes("/admin") ||
    pathname?.includes("/agent")
  ) {
    return null
  }

  const dashboardLink = isBuilder ? "/builder" : "/buyer"

  return (
    <>
      {/* Spacer for fixed nav */}
      <div className="h-20 md:hidden" />

      <nav className="bottom-nav-container">
        <div className="bottom-nav">
          <Link href="/properties" className={`bottom-nav-item ${isActive("/properties") ? "active" : ""}`}>
            <Search size={20} />
            <span>Search</span>
          </Link>

          <Link href="/favorites" className={`bottom-nav-item ${isActive("/favorites") ? "active" : ""}`}>
            <Heart size={20} />
            <span>Saved</span>
          </Link>

          {/* Floating Action Button for Add Property */}
          {isBuilder && (
            <Link href="/builder/properties/new" className="fab" aria-label="Add property" title="Add Property">
              <Plus size={24} />
            </Link>
          )}

          <Link href="/messages" className={`bottom-nav-item ${isActive("/messages") ? "active" : ""}`}>
            <MessageSquare size={20} />
            <span>Messages</span>
          </Link>

          <Link
            href={currentUser ? dashboardLink : "/auth/login"}
            className={`bottom-nav-item ${isActive("/buyer") || isActive("/builder") ? "active" : ""}`}
          >
            <User size={20} />
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </>
  )
}
