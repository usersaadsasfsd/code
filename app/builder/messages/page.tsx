"use client"

export default function BuilderMessagesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground">Communicate with buyers and leads</p>
      </div>

      <div className="border border-border rounded-lg p-8 bg-card text-center">
        <p className="text-muted-foreground">No conversations yet</p>
      </div>
    </div>
  )
}
