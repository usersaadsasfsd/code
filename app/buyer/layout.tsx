import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import DashboardLayoutWrapper from "@/components/dashboard/dashboard-layout-wrapper"

export const metadata: Metadata = {
  title: "Buyer Dashboard | CountryRoof",
  description: "Manage your properties and inquiries",
  robots: { index: false },
}

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.user_type !== "customer") {
    redirect("/")
  }

  return (
    <DashboardLayoutWrapper userRole="buyer" userName={user.username}>
      {children}
    </DashboardLayoutWrapper>
  )
}
