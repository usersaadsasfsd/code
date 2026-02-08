"use client"

import type React from "react"
import DashboardHeader from "./dashboard-header"
import UnifiedSidebar from "./unified-sidebar"
import { Toaster } from "@/components/ui/toaster"

type UserRole = "admin" | "agent" | "builder" | "buyer" | "customer"

interface DashboardLayoutWrapperProps {
  children: React.ReactNode
  userRole: UserRole
  userName?: string
}

export default function DashboardLayoutWrapper({
  children,
  userRole,
  userName,
}: DashboardLayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Dashboard Header - Fixed at top */}
      <DashboardHeader userName={userName} userRole={userRole} />

      {/* Sidebar - Fixed on left */}
      <UnifiedSidebar userRole={userRole} />

      {/* Main Content Area */}
      <main className="md:ml-64 min-h-[calc(100vh-3.5rem)]">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}
