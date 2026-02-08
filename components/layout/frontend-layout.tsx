"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import MegaMenuHeader from "./mega-menu-header"
import Footer from "./footer"
import BottomNav from "./bottom-nav"

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Check if we're on a dashboard page
  const isDashboardPage = pathname?.startsWith("/admin") || 
                         pathname?.startsWith("/builder") || 
                         pathname?.startsWith("/buyer") || 
                         pathname?.startsWith("/dashboard") ||
                         pathname?.startsWith("/agent")
  
  // Don't render the mega menu header and footer for dashboard pages
  if (isDashboardPage) {
    return <>{children}</>
  }
  
  return (
    <>
      <MegaMenuHeader />
      {children}
      <Footer />
      <BottomNav />
    </>
  )
}
