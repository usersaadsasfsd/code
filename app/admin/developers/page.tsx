"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { ImportExportDialog } from "@/components/admin/import-export-dialog"

export default function AdminDevelopersPage() {
  const [developers, setDevelopers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadDevelopers = async () => {
    try {
      const res = await fetch("/api/admin/developers")
      const data = await res.json()
      setDevelopers(data)
    } catch (error) {
      console.error("[v0] Error loading developers:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDevelopers()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this developer?")) {
      try {
        const res = await fetch(`/api/admin/developers/${id}`, { method: "DELETE" })
        if (res.ok) {
          setDevelopers(developers.filter((d) => d._id !== id))
        }
      } catch (error) {
        console.error("[v0] Error deleting developer:", error)
      }
    }
  }

  return (
    <>
      <main className="min-h-screen">
        <div className="flex flex-col md:flex-row">

          <div className="flex-1 px-4 py-8 md:py-12">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-foreground">Developers/Builders</h1>
                  <p className="text-sm text-muted-foreground">Manage property developers and builders</p>
                </div>
                <Button asChild className="text-xs h-8">
                  <Link href="/admin/developers/new">Add Developer</Link>
                </Button>
              </div>

              <ImportExportDialog entityType="developers" onImportSuccess={loadDevelopers} />

              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold">Logo</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold">About</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-xs text-muted-foreground">
                          Loading...
                        </td>
                      </tr>
                    ) : developers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-xs text-muted-foreground">
                          No developers found
                        </td>
                      </tr>
                    ) : (
                      developers.map((developer) => (
                        <tr key={developer._id} className="border-t border-border hover:bg-muted/30">
                          <td className="px-4 py-2 text-xs">
                            {developer.logo_url && (
                              <img
                                src={developer.logo_url || "/placeholder.svg"}
                                alt={developer.name}
                                className="h-8 w-8 object-cover rounded"
                              />
                            )}
                          </td>
                          <td className="px-4 py-2 text-xs font-medium">{developer.name}</td>
                          <td className="px-4 py-2 text-xs text-muted-foreground line-clamp-1">
                            {developer.about_developer || "-"}
                          </td>
                          <td className="px-4 py-2 text-xs">
                            <div className="flex gap-2">
                              <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                                <Link href={`/admin/developers/${developer._id}/edit`}>
                                  <Edit2 size={14} />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7"
                                onClick={() => handleDelete(developer._id)}
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
        </div>
      </main>
    </>
  )
}
