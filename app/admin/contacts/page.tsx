import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import ContactsList from "@/components/admin/contacts-list"

export const metadata: Metadata = {
  title: "Manage Contacts | CountryRoof Admin",
  robots: { index: false },
}

export default async function ContactsPage() {
  try {
    await requireAdmin()
  } catch {
    redirect("/auth/login")
  }

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Contact Management</h1>
          <p className="text-sm text-muted-foreground">View and manage all contact form submissions</p>
        </div>

        <div className="border border-border rounded-lg">
          <ContactsList />
        </div>
      </div>
    </div>
  )
}
