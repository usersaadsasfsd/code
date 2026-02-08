import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import DashboardLayoutWrapper from "@/components/dashboard/dashboard-layout-wrapper"

export const metadata: Metadata = {
  title: "Agent Dashboard | CountryRoof",
  description: "Manage your property listings",
  robots: { index: false },
}

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.user_type !== "agent") {
    redirect("/dashboard")
  }

  return (
    <DashboardLayoutWrapper userRole="agent" userName={user.username}>
      {children}
    </DashboardLayoutWrapper>
  )
}
