"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { ImportExportDialog } from "@/components/admin/import-export-dialog"

export default function AdminStatesPage() {
  const [states, setStates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadStates = async () => {
    try {
      const res = await fetch("/api/admin/states")
      const data = await res.json()
      setStates(data)
    } catch (error) {
      console.error("[v0] Error loading states:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStates()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this state?")) {
      try {
        const res = await fetch(`/api/admin/states/${id}`, { method: "DELETE" })
        if (res.ok) {
          setStates(states.filter((s) => s._id !== id))
        }
      } catch (error) {
        console.error("[v0] Error deleting state:", error)
      }
    }
  }

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">States Management</h1>
            <p className="text-sm text-muted-foreground">Manage property states/regions</p>
          </div>
          <Button asChild className="text-xs h-8">
            <Link href="/admin/states/new">Add State</Link>
          </Button>
        </div>

        <ImportExportDialog entityType="states" onImportSuccess={loadStates} />

        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold">Name</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Slug</th>
                <th className="px-4 py-2 text-left text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : states.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No states found
                  </td>
                </tr>
              ) : (
                states.map((state) => (
                  <tr key={state._id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2 text-xs">{state.name}</td>
                    <td className="px-4 py-2 text-xs">{state.slug}</td>
                    <td className="px-4 py-2 text-xs">
                      <div className="flex gap-2">
                        <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                          <Link href={`/admin/states/${state._id}/edit`}>
                            <Edit2 size={14} />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleDelete(state._id)}
                        >
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </div>
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
