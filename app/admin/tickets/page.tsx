"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const res = await fetch("/api/admin/tickets")
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

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-sm text-muted-foreground">Manage customer support tickets</p>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold">Ticket ID</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Subject</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Customer</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Priority</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Status</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Created</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No tickets found
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket._id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2 text-xs font-mono">{ticket._id.slice(0, 8)}</td>
                    <td className="px-4 py-2 text-xs line-clamp-1">{ticket.subject}</td>
                    <td className="px-4 py-2 text-xs">{ticket.customer_name}</td>
                    <td className="px-4 py-2 text-xs">
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs">{new Date(ticket.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-xs">
                      <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                        <Link href={`/admin/tickets/${ticket._id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
