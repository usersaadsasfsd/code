"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Home,
  Package,
  Users,
  Grid3X3,
  MapPin,
  Zap,
  Building2,
  Hammer,
  Star,
  MessageSquare,
  BookOpen,
  LayoutGrid,
  Search,
  Upload,
  Heart,
  FileText,
  Settings,
  User,
  BarChart3,
  Menu,
  X,
  ChevronDown,
  MessageCircle,
} from "lucide-react"

type UserRole = "admin" | "agent" | "builder" | "buyer" | "customer"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

interface NavSection {
  title: string
  items: NavItem[]
  collapsible?: boolean
}

interface UnifiedSidebarProps {
  userRole: UserRole
}

const getNavConfig = (role: UserRole): NavSection[] => {
  switch (role) {
    case "admin":
      return [
        {
          title: "Main",
          items: [{ href: "/admin/dashboard", label: "Dashboard", icon: Home }],
        },
        {
          title: "Management",
          items: [
            { href: "/admin/properties", label: "Properties", icon: Package },
            { href: "/admin/users", label: "Users", icon: Users },
            { href: "/admin/reviews", label: "Reviews", icon: Star },
            { href: "/admin/tickets", label: "Support Tickets", icon: MessageSquare },
            { href: "/admin/contacts", label: "Contacts", icon: MessageCircle },
            { href: "/admin/quotes", label: "Quotes", icon: FileText },
          ],
        },
        {
          title: "Configuration",
          collapsible: true,
          items: [
            { href: "/admin/categories", label: "Categories", icon: Grid3X3 },
            { href: "/admin/states", label: "States", icon: MapPin },
            { href: "/admin/locations", label: "Locations", icon: MapPin },
            { href: "/admin/amenities", label: "Amenities", icon: Zap },
            { href: "/admin/developers", label: "Developers", icon: Building2 },
            { href: "/admin/facilities", label: "Facilities", icon: Hammer },
          ],
        },
        {
          title: "Content",
          collapsible: true,
          items: [
            { href: "/admin/blog", label: "Blog", icon: BookOpen },
            { href: "/admin/homepage-sections", label: "Homepage Sections", icon: LayoutGrid },
            { href: "/admin/seo", label: "SEO", icon: Search },
          ],
        },
        {
          title: "Tools",
          items: [{ href: "/admin/import-export", label: "Import/Export", icon: Upload }],
        },
      ]
    case "agent":
      return [
        {
          title: "Main",
          items: [
            { href: "/agent/dashboard", label: "Dashboard", icon: Home },
            { href: "/agent/properties", label: "Properties", icon: Package },
            { href: "/agent/reviews", label: "Reviews", icon: Star },
            { href: "/agent/tickets", label: "Support Tickets", icon: MessageSquare },
            { href: "/agent/profile", label: "Profile", icon: User },
          ],
        },
      ]
    case "builder":
      return [
        {
          title: "Main",
          items: [
            { href: "/builder", label: "Dashboard", icon: Home },
            { href: "/builder/properties", label: "Properties", icon: Package },
            { href: "/builder/leads", label: "Leads", icon: Users },
            { href: "/builder/messages", label: "Messages", icon: MessageSquare },
            { href: "/builder/analytics", label: "Analytics", icon: BarChart3 },
          ],
        },
        {
          title: "Account",
          items: [
            { href: "/builder/profile", label: "Profile", icon: User },
            { href: "/builder/settings", label: "Settings", icon: Settings },
          ],
        },
      ]
    case "buyer":
    case "customer":
      return [
        {
          title: "Main",
          items: [
            { href: "/buyer", label: "Dashboard", icon: Home },
            { href: "/buyer/saved-properties", label: "Saved Properties", icon: Heart },
            { href: "/buyer/inquiries", label: "Inquiries", icon: FileText },
            { href: "/buyer/messages", label: "Messages", icon: MessageSquare },
          ],
        },
        {
          title: "Account",
          items: [
            { href: "/buyer/profile", label: "Profile", icon: User },
            { href: "/buyer/settings", label: "Settings", icon: Settings },
          ],
        },
      ]
    default:
      return []
  }
}

export default function UnifiedSidebar({ userRole }: UnifiedSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  const navConfig = getNavConfig(userRole)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navConfig.map((section) => (
          <div key={section.title}>
            {section.collapsible ? (
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2 hover:text-foreground transition-colors"
              >
                {section.title}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    collapsedSections[section.title] && "-rotate-90"
                  )}
                />
              </button>
            ) : (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                {section.title}
              </p>
            )}
            {(!section.collapsible || !collapsedSections[section.title]) && (
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r border-border bg-background z-40 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
