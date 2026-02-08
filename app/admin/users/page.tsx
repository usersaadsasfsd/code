"use client"
import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/admin/users")
        const data = await res.json()
        setUsers(data)
      } catch (error) {
        console.error("[v0] Error loading users:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Users Management</h1>
          <p className="text-sm text-muted-foreground">Manage all platform users</p>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold">Username</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Email</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Type</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Joined</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2 text-xs">{user.username}</td>
                    <td className="px-4 py-2 text-xs">{user.email}</td>
                    <td className="px-4 py-2 text-xs">
                      <span className="capitalize text-xs">{user.user_type}</span>
                    </td>
                    <td className="px-4 py-2 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-xs">
                      <Button variant="ghost" size="sm" className="text-xs h-7">
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
