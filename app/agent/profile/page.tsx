"use client"
import Header from "@/components/layout/header"
import type React from "react"

import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

export default function AgentProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ username: "", email: "", phone_number: "" })

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        setUser(data)
        setFormData({
          username: data.username,
          email: data.email,
          phone_number: data.phone_number || "",
        })
      } catch (error) {
        console.error("[v0] Error loading user:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/agent/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        alert("Profile updated successfully")
      }
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-2xl mx-auto space-y-6 px-4 py-8 md:py-12">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Agent Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your profile information</p>
          </div>

          <form onSubmit={handleSubmit} className="border border-border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Username</label>
              <Input
                type="text"
                placeholder="Your username"
                value={formData.username}
                className="h-8 text-xs"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                className="h-8 text-xs"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Phone Number</label>
              <Input
                type="tel"
                placeholder="+91 (555) 000-0000"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            <Button type="submit" className="text-xs h-8 w-full md:w-auto">
              Save Changes
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
