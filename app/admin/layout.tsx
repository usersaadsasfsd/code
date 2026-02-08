import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import DashboardLayoutWrapper from "@/components/dashboard/dashboard-layout-wrapper"

export const metadata: Metadata = {
  title: "Admin Panel | CountryRoof",
  description: "Admin dashboard for managing platform",
  robots: { index: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.user_type !== "admin") {
    redirect("/dashboard")
  }

  return (
    <DashboardLayoutWrapper userRole="admin" userName={user.username}>
      {children}
    </DashboardLayoutWrapper>
  )
}
