import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import QuotesList from "@/components/admin/quotes-list"

export const metadata: Metadata = {
  title: "Manage Quotes | CountryRoof Admin",
  robots: { index: false },
}

export default async function QuotesPage() {
  try {
    await requireAdmin()
  } catch {
    redirect("/auth/login")
  }

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quote Management</h1>
          <p className="text-sm text-muted-foreground">View and manage all quote requests</p>
        </div>

        <div className="border border-border rounded-lg">
          <QuotesList />
        </div>
      </div>
    </div>
  )
}
