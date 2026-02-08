"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Package, Users, Star, MessageSquare, Building2, MapPin, Zap, ArrowRight } from "lucide-react"
import PageHeader from "@/components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    properties: 0,
    users: 0,
    reviews: 0,
    tickets: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [propsRes, usersRes] = await Promise.all([fetch("/api/properties?limit=1"), fetch("/api/admin/users")])

        const propsData = await propsRes.json()
        const usersData = await usersRes.json()

        setStats({
          properties: propsData.pagination?.total || 0,
          users: Array.isArray(usersData) ? usersData.length : 0,
          reviews: 0,
          tickets: 0,
        })
      } catch (error) {
        console.error("[v0] Error loading stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const statCards = [
    { label: "Total Properties", value: stats.properties, icon: Package, href: "/admin/properties" },
    { label: "Active Users", value: stats.users, icon: Users, href: "/admin/users" },
    { label: "Pending Reviews", value: stats.reviews, icon: Star, href: "/admin/reviews" },
    { label: "Open Tickets", value: stats.tickets, icon: MessageSquare, href: "/admin/tickets" },
  ]

  const quickActions = [
    { label: "Manage Properties", href: "/admin/properties", icon: Package },
    { label: "Manage Users", href: "/admin/users", icon: Users },
    { label: "Homepage Sections", href: "/admin/homepage-sections", icon: Building2 },
  ]

  const configurations = [
    { label: "States/Regions", href: "/admin/states", icon: MapPin },
    { label: "Amenities", href: "/admin/amenities", icon: Zap },
    { label: "Facilities", href: "/admin/facilities", icon: Building2 },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and management"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {loading ? "-" : stat.value}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions and Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{action.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {configurations.map((config) => {
              const Icon = config.icon
              return (
                <Link
                  key={config.href}
                  href={config.href}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{config.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
