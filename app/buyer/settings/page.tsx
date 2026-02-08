"use client"

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and notifications</p>
      </div>

      <div className="border border-border rounded-lg p-6 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Email Notifications</p>
            <p className="text-xs text-muted-foreground">Receive updates about new properties</p>
          </div>
          <input type="checkbox" defaultChecked className="rounded" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Property Alerts</p>
            <p className="text-xs text-muted-foreground">Get notified about matching properties</p>
          </div>
          <input type="checkbox" defaultChecked className="rounded" />
        </div>
      </div>
    </div>
  )
}
