"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Contact {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  timestamp: string
  status: string
}

export default function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch("/api/admin/contacts")
        if (response.ok) {
          const data = await response.json()
          setContacts(data.contacts || [])
        }
      } catch (error) {
        console.error("Failed to fetch contacts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>
  }

  if (contacts.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground text-center">No contacts yet</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-xs">Name</TableHead>
            <TableHead className="text-xs">Email</TableHead>
            <TableHead className="text-xs">Subject</TableHead>
            <TableHead className="text-xs">Date</TableHead>
            <TableHead className="text-xs">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact._id} className="border-border">
              <TableCell className="text-xs font-medium">{contact.name}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{contact.email}</TableCell>
              <TableCell className="text-xs max-w-xs truncate">{contact.subject}</TableCell>
              <TableCell className="text-xs">{new Date(contact.timestamp).toLocaleDateString()}</TableCell>
              <TableCell className="text-xs">
                <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs">{contact.status}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
