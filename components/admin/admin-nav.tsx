"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
  LogOut,
  LayoutGrid,
  MessageCircle,
  Search,
  Upload,
} from "lucide-react"

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const navSections = [
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
      ],
    },
    {
      title: "Configuration",
      items: [
        { href: "/admin/categories", label: "Categories", icon: Grid3X3 },
        { href: "/admin/states", label: "States", icon: MapPin },
        { href: "/admin/amenities", label: "Amenities", icon: Zap },
        { href: "/admin/developers", label: "Developers", icon: Building2 },
        { href: "/admin/facilities", label: "Facilities", icon: Hammer },
      ],
    },
    {
      title: "Content",
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

  return (
    <nav className="w-full md:w-64 border-b md:border-r md:border-b-0 border-border bg-muted/30 md:fixed md:left-0 md:top-0 md:h-screen md:overflow-y-auto">
      <div className="flex flex-col gap-4 p-4">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">{section.title}</p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded transition-colors ${
                      isActive(item.href) ? "bg-accent/10 text-accent font-semibold" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-border">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="text-xs h-8 w-full bg-transparent justify-start"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
