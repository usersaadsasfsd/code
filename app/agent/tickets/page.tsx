"use client"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import AgentDashboardNav from "@/components/agent/agent-dashboard-nav"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function AgentTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const res = await fetch("/api/agent/tickets")
        const data = await res.json()
        setTickets(data)
      } catch (error) {
        console.error("[v0] Error loading tickets:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [])

  const openCount = tickets.filter((t) => t.status === "open").length
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="flex flex-col md:flex-row">
          <AgentDashboardNav />

          <div className="flex-1 px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
                <p className="text-sm text-muted-foreground">Manage inquiries and support requests</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">Total Tickets</p>
                  <p className="text-2xl font-bold text-primary mt-2">{tickets.length}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">Open</p>
                  <p className="text-2xl font-bold text-primary mt-2">{openCount}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-primary mt-2">{resolvedCount}</p>
                </div>
              </div>

              {loading ? (
                <div className="border border-border rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="border border-border rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground">No tickets yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <Link
                      key={ticket._id}
                      href={`/agent/tickets/${ticket._id}`}
                      className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground">{ticket.subject}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ticket.description}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 bg-muted rounded text-xs capitalize">{ticket.priority}</span>
                            <span className="px-2 py-1 bg-muted rounded text-xs capitalize">{ticket.status}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
