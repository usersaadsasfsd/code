"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, LogOut, User, ChevronDown, IndianRupee } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { LocationMegaMenu, ProjectMegaMenu } from "./product-mega-menu-content"
import { BUDGET_RANGES } from "@/lib/utils"

interface CurrentUser {
  id: string
  email: string
  username: string
  user_type: "customer" | "agent" | "admin"
}

const locations = ["Dwarka Expressway", "Golf Course Road", "Sohna Road", "Sushant Lok", "New Gurgaon"]

const projectStatus = ["Upcoming Projects", "New Launch Projects", "Under Construction", "Ready To Move"]

const projectTypes = [
  "SCO Plots",
  "Plots In Gurugram",
  "Luxury Appartment",
  "Residential Projects",
  "Commercial Projects",
  "Independent Floors",
]

export default function MegaMenuHeader() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const locationMenuRef = useRef<HTMLDivElement>(null)
  const projectMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" })
        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data.user)
        }
      } catch {
        // User not logged in
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveMenu(null)
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    setCurrentUser(null)
    window.location.href = "/"
  }

  const getDashboardLink = () => {
    if (!currentUser) return "/dashboard"
    if (currentUser.user_type === "agent") return "/builder/dashboard"
    if (currentUser.user_type === "admin") return "/admin/dashboard"
    return "/buyer"
  }

  const getDashboardLabel = () => {
    if (!currentUser) return "My Dashboard"
    if (currentUser.user_type === "agent") return "Builder Dashboard"
    if (currentUser.user_type === "admin") return "Admin Dashboard"
    return "Buyer Dashboard"
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
        <nav className="flex items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/images/logo.png"
              alt="Country Roof Logo"
              width={200}
              height={50}
              className="h-10 w-full md:h-12"
            />
          </Link>

          {/* Desktop Mega Menu Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#002366] transition-colors"
            >
              Home
            </Link>

            {/* Locations Mega Menu */}
            <div
              ref={locationMenuRef}
              className=""
              onMouseEnter={() => setActiveMenu("locations")}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#002366] transition-colors flex items-center gap-1">
                Locations{" "}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${activeMenu === "locations" ? "rotate-180" : ""}`}
                />
              </button>
              {activeMenu === "locations" && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                  <div className="absolute left-0 right-0 top-full pt-0 z-50 w-screen origin-top-left">
                    <div className="ml-0 mr-auto" style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}>
                      <LocationMegaMenu />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Projects Mega Menu */}
            <div
              ref={projectMenuRef}
              className=""
              onMouseEnter={() => setActiveMenu("projects")}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#002366] transition-colors flex items-center gap-1">
                Projects{" "}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${activeMenu === "projects" ? "rotate-180" : ""}`}
                />
              </button>
              {activeMenu === "projects" && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                  <div className="absolute left-0 right-0 top-full pt-0 z-50 w-screen origin-top-left">
                    <div className="ml-0 mr-auto" style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}>
                      <ProjectMegaMenu />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Budget Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#002366] transition-colors flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  Budget
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {BUDGET_RANGES.map((range) => (
                  <DropdownMenuItem key={range.value} asChild>
                    <Link 
                      href={`/properties?minPrice=${range.min}${range.max ? `&maxPrice=${range.max}` : ''}`}
                      className="w-full"
                    >
                      {range.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/about"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#002366] transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#002366] transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-2">
            {mounted ? (
              currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-sm h-9 border-[#002366] text-[#002366] bg-transparent"
                    >
                      <User size={16} className="mr-2" />
                      {currentUser.username}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()}>{getDashboardLabel()}</Link>
                    </DropdownMenuItem>
                    {currentUser.user_type === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard">Admin Settings</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-sm h-9 border-[#002366] text-[#002366] bg-transparent hover:bg-[#002366]/5"
                  >
                    <Link href="/auth/login">Post Property</Link>
                  </Button>
                  <Button asChild size="sm" className="text-sm h-9 bg-[#002366] hover:bg-[#001a4d]">
                    <Link href="/auth/register">Sign Up</Link>
                  </Button>
                </>
              )
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-[#002366] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white fixed top-16 left-0 right-0 bottom-0 z-40 overflow-y-auto">
          <div className="flex flex-col gap-1 px-4 py-3">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#002366] hover:bg-gray-50 rounded transition-colors"
            >
              Home
            </Link>

            <div className="border-t border-gray-100 my-2" />
            <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Locations</p>
            {locations.map((location) => (
              <Link
                key={location}
                href={`/properties?search=${encodeURIComponent(location)}`}
                className="px-3 py-2 text-sm text-gray-600 hover:text-[#002366] hover:bg-gray-50 rounded transition-colors"
              >
                {location}
              </Link>
            ))}

            <div className="border-t border-gray-100 my-2" />
            <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Project Status</p>
            {projectStatus.map((status) => (
              <Link
                key={status}
                href={`/properties?search=${encodeURIComponent(status)}`}
                className="px-3 py-2 text-sm text-gray-600 hover:text-[#002366] hover:bg-gray-50 rounded transition-colors"
              >
                {status}
              </Link>
            ))}

            <div className="border-t border-gray-100 my-2" />
            <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Project Type</p>
            {projectTypes.map((type) => (
              <Link
                key={type}
                href={`/properties?search=${encodeURIComponent(type)}`}
                className="px-3 py-2 text-sm text-gray-600 hover:text-[#002366] hover:bg-gray-50 rounded transition-colors"
              >
                {type}
              </Link>
            ))}

            <div className="border-t border-gray-100 my-2" />
            <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Budget</p>
            {BUDGET_RANGES.map((range) => (
              <Link
                key={range.value}
                href={`/properties?minPrice=${range.min}${range.max ? `&maxPrice=${range.max}` : ''}`}
                className="px-3 py-2 text-sm text-gray-600 hover:text-[#002366] hover:bg-gray-50 rounded transition-colors"
              >
                {range.label}
              </Link>
            ))}

            <div className="border-t border-gray-100 my-2" />
            <Link
              href="/about"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#002366] hover:bg-gray-50 rounded transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#002366] hover:bg-gray-50 rounded transition-colors"
            >
              Contact
            </Link>

            <div className="border-t border-gray-100 my-2" />
            {mounted && (
              <div className="flex gap-2 mt-3">
                {currentUser ? (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-xs h-9 flex-1 border-[#002366] text-[#002366] bg-transparent"
                    >
                      <Link href={getDashboardLink()}>{getDashboardLabel()}</Link>
                    </Button>
                    <Button
                      onClick={handleLogout}
                      size="sm"
                      className="text-xs h-9 flex-1 bg-[#002366] hover:bg-[#001a4d]"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-xs h-9 flex-1 border-[#002366] text-[#002366] bg-transparent"
                    >
                      <Link href="/auth/login">Post Property</Link>
                    </Button>
                    <Button asChild size="sm" className="text-xs h-9 flex-1 bg-[#002366] hover:bg-[#001a4d]">
                      <Link href="/auth/register">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
