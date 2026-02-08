"use client"

export default function InquiriesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Property Inquiries</h1>
        <p className="text-muted-foreground">Track your inquiries and offers</p>
      </div>

      <div className="border border-border rounded-lg p-8 bg-card text-center">
        <p className="text-muted-foreground">
          No active inquiries. Browse properties and send an inquiry to get started!
        </p>
      </div>
    </div>
  )
}
