"use client"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        const userData = await res.json()
        setUser(userData)
      } catch (error) {
        console.error("[v0] Error loading user:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {user?.username || "User"}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground">Active Quotes</p>
          <p className="text-2xl font-bold text-primary mt-2">0</p>
        </div>
        <div className="p-4 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground">Completed Projects</p>
          <p className="text-2xl font-bold text-primary mt-2">0</p>
        </div>
        <div className="p-4 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground">Member Since</p>
          <p className="text-sm text-primary mt-2">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="border border-border rounded-lg p-4 text-center text-sm text-muted-foreground">
          No recent activity
        </div>
      </div>
    </div>
  )
}
