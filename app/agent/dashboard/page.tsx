"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function AgentDashboardPage() {
  const [stats, setStats] = useState({
    active: 0,
    sold: 0,
    reviews: 0,
    rating: 0,
  })
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await fetch("/api/auth/me")
        const userData = await userRes.json()
        setUser(userData)

        const propsRes = await fetch("/api/agent/properties")
        const propsData = await propsRes.json()

        setStats({
          active: propsData.filter((p: any) => p.status === "active").length,
          sold: propsData.filter((p: any) => p.status === "sold").length,
          reviews: 0,
          rating: 4.5,
        })
      } catch (error) {
        console.error("[v0] Error loading agent data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Agent Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {user?.username}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground">Active Listings</p>
          <p className="text-2xl font-bold text-primary mt-2">{stats.active}</p>
        </div>
        <div className="p-4 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground">Properties Sold</p>
          <p className="text-2xl font-bold text-primary mt-2">{stats.sold}</p>
        </div>
        <div className="p-4 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground">Reviews</p>
          <p className="text-2xl font-bold text-primary mt-2">{stats.reviews}</p>
        </div>
        <div className="p-4 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground">Rating</p>
          <p className="text-2xl font-bold text-primary mt-2">{stats.rating.toFixed(1)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/agent/properties/new"
            className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <p className="text-sm font-semibold text-foreground">Add New Property</p>
            <p className="text-xs text-muted-foreground mt-1">List a new property on marketplace</p>
          </Link>
          <Link
            href="/agent/properties"
            className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <p className="text-sm font-semibold text-foreground">Manage Properties</p>
            <p className="text-xs text-muted-foreground mt-1">View and edit your listings</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
