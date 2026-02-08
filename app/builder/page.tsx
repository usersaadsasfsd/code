"use client"

import { useEffect, useState } from "react"
import { Package, Users, MessageSquare, TrendingUp } from "lucide-react"

export default function BuilderDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    activeListings: 0,
    leads: 0,
    messages: 0,
    sales: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/auth/me")
        const userData = await res.json()
        setUser(userData.user)
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const StatCard = ({ icon: Icon, label, value }: any) => (
    <div className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-primary mt-2">{value}</p>
        </div>
        <Icon className="text-muted-foreground" size={28} />
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.username}!</h1>
        <p className="text-muted-foreground">Here's your business overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Active Listings" value={stats.activeListings} />
        <StatCard icon={Users} label="New Leads" value={stats.leads} />
        <StatCard icon={MessageSquare} label="Messages" value={stats.messages} />
        <StatCard icon={TrendingUp} label="Sales This Month" value={stats.sales} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Leads</h2>
          <p className="text-sm text-muted-foreground">No new leads yet</p>
        </div>

        <div className="border border-border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/builder/properties/new" className="text-primary hover:underline">
                Add New Property
              </a>
            </li>
            <li>
              <a href="/builder/properties" className="text-primary hover:underline">
                Manage Properties
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
