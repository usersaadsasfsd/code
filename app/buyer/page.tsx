"use client"

import { useEffect, useState } from "react"
import { Heart, FileText, MessageSquare, Calendar } from "lucide-react"

export default function BuyerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    savedProperties: 0,
    activeInquiries: 0,
    messages: 0,
    scheduledTours: 0,
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
        <p className="text-muted-foreground">Here's an overview of your property search journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Heart} label="Saved Properties" value={stats.savedProperties} />
        <StatCard icon={FileText} label="Active Inquiries" value={stats.activeInquiries} />
        <StatCard icon={MessageSquare} label="Messages" value={stats.messages} />
        <StatCard icon={Calendar} label="Scheduled Tours" value={stats.scheduledTours} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Saved Properties</h2>
          <p className="text-sm text-muted-foreground">No saved properties yet. Start exploring!</p>
        </div>

        <div className="border border-border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Messages</h2>
          <p className="text-sm text-muted-foreground">No messages yet. Connect with agents to get started!</p>
        </div>
      </div>
    </div>
  )
}
