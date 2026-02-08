"use client"

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Track your performance and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-border rounded-lg p-6 bg-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Property Views</h3>
          <p className="text-2xl font-bold text-primary">0</p>
        </div>

        <div className="border border-border rounded-lg p-6 bg-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Inquiries</h3>
          <p className="text-2xl font-bold text-primary">0</p>
        </div>
      </div>
    </div>
  )
}
