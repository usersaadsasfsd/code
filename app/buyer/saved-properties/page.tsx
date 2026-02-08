"use client"

export default function SavedPropertiesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Saved Properties</h1>
        <p className="text-muted-foreground">Your curated collection of favorite properties</p>
      </div>

      <div className="border border-border rounded-lg p-8 bg-card text-center">
        <p className="text-muted-foreground">No saved properties yet. Start saving your favorite properties!</p>
      </div>
    </div>
  )
}
