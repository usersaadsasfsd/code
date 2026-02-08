"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Quote {
  _id: string
  name: string
  email: string
  serviceType: string
  propertyType: string
  urgency: string
  timestamp: string
  status: string
}

export default function QuotesList() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch("/api/admin/quotes")
        if (response.ok) {
          const data = await response.json()
          setQuotes(data.quotes || [])
        }
      } catch (error) {
        console.error("Failed to fetch quotes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuotes()
  }, [])

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>
  }

  if (quotes.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground text-center">No quotes yet</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-xs">Name</TableHead>
            <TableHead className="text-xs">Service</TableHead>
            <TableHead className="text-xs">Property Type</TableHead>
            <TableHead className="text-xs">Urgency</TableHead>
            <TableHead className="text-xs">Date</TableHead>
            <TableHead className="text-xs">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => (
            <TableRow key={quote._id} className="border-border">
              <TableCell className="text-xs font-medium">{quote.name}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{quote.serviceType}</TableCell>
              <TableCell className="text-xs">{quote.propertyType}</TableCell>
              <TableCell className="text-xs">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    quote.urgency === "emergency"
                      ? "bg-red-50 text-red-700"
                      : quote.urgency === "urgent"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {quote.urgency}
                </span>
              </TableCell>
              <TableCell className="text-xs">{new Date(quote.timestamp).toLocaleDateString()}</TableCell>
              <TableCell className="text-xs">
                <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs">{quote.status}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
