"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import AdminNav from "@/components/admin/admin-nav"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminTicketReplyPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [ticket, setTicket] = useState<any>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    reply_message: "",
    status: "in_progress",
  })

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const res = await fetch(`/api/admin/tickets/${id}`)
        const data = await res.json()
        setTicket(data)
        setFormData((prev) => ({ ...prev, status: data.status }))
      } catch (error) {
        console.error("[v0] Error loading ticket:", error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadTicket()
  }, [id])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/tickets/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        router.push(`/admin/tickets/${id}`)
      }
    } catch (error) {
      console.error("[v0] Error replying to ticket:", error)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
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

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="flex flex-col md:flex-row">
          <AdminNav />

          <div className="flex-1 px-4 py-8 md:py-12">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Reply to Ticket</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Subject: <span className="font-medium">{ticket?.subject}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Reply Message</label>
                  <textarea
                    name="reply_message"
                    value={formData.reply_message}
                    onChange={handleChange}
                    required
                    placeholder="Type your reply here..."
                    rows={6}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading} className="text-xs h-8">
                    {loading ? "Sending..." : "Send Reply"}
                  </Button>
                  <Button asChild variant="outline" className="text-xs h-8 bg-transparent">
                    <Link href={`/admin/tickets/${id}`}>Cancel</Link>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
