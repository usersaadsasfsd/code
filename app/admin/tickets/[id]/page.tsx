"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import AdminNav from "@/components/admin/admin-nav"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminTicketDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const res = await fetch(`/api/admin/tickets/${id}`)
        const data = await res.json()
        setTicket(data)
      } catch (error) {
        console.error("[v0] Error loading ticket:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTicket()
  }, [id])

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-100 text-red-700",
      high: "bg-orange-100 text-orange-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-blue-100 text-blue-700",
    }
    return colors[priority] || "bg-gray-100 text-gray-700"
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-blue-100 text-blue-700",
      in_progress: "bg-purple-100 text-purple-700",
      resolved: "bg-green-100 text-green-700",
      closed: "bg-gray-100 text-gray-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen">
          <div className="flex flex-col md:flex-row">
            <AdminNav />
            <div className="flex-1 px-4 py-8 md:py-12">
              <p className="text-muted-foreground text-sm">Loading...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!ticket) {
    return (
      <>
        <Header />
        <main className="min-h-screen">
          <div className="flex flex-col md:flex-row">
            <AdminNav />
            <div className="flex-1 px-4 py-8 md:py-12">
              <p className="text-muted-foreground text-sm">Ticket not found</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="flex flex-col md:flex-row">
          <AdminNav />

          <div className="flex-1 px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{ticket.subject}</h1>
                  <p className="text-sm text-muted-foreground mt-1">Ticket ID: {ticket._id}</p>
                </div>
                <Button asChild variant="outline" className="text-xs h-8 bg-transparent">
                  <Link href="/admin/tickets">Back</Link>
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-xs font-medium">{new Date(ticket.created_at).toLocaleDateString()}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">User</p>
                  <p className="text-xs font-medium truncate">{ticket.user?.email || "N/A"}</p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">Description</h2>
                <p className="text-sm text-foreground leading-relaxed">{ticket.description}</p>
              </div>

              <div className="flex gap-3">
                <Button asChild className="text-xs h-8">
                  <Link href={`/admin/tickets/${id}/reply`}>Reply</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
