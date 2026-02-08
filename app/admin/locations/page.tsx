"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import PageHeader from "@/components/dashboard/page-header"
import { Plus, Edit2, Trash2, Search, MapPin, ExternalLink, Star } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface Location {
  _id: string
  name: string
  slug: string
  type: string
  state?: string
  city?: string
  is_featured?: boolean
  created_at: string
}

export default function AdminLocationsPage() {
  const searchParams = useSearchParams()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const { toast } = useToast()

  const fetchLocations = async () => {
    try {
      const res = await fetch(`/api/admin/locations${search ? `?search=${search}` : ""}`)
      if (res.ok) {
        const data = await res.json()
        setLocations(data)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this location?")) return

    try {
      const res = await fetch(`/api/admin/locations/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast({ title: "Deleted", description: "Location deleted successfully" })
        fetchLocations()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete location", variant: "destructive" })
    }
  }

  const typeColors: Record<string, string> = {
    city: "bg-blue-100 text-blue-700",
    area: "bg-emerald-100 text-emerald-700",
    neighborhood: "bg-purple-100 text-purple-700",
    region: "bg-amber-100 text-amber-700",
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <PageHeader
          title="Locations"
          description="Manage location pages for SEO and property filtering"
          showBackButton
          backHref="/admin/dashboard"
          actions={
              <Button asChild size="sm">
                <Link href="/admin/locations/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Link>
              </Button>
          }
        />
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search locations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">State/City</TableHead>
                    <TableHead className="text-xs">Slug</TableHead>
                    <TableHead className="text-xs w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : locations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No locations found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    locations.map((location) => (
                      <TableRow key={location._id}>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            {location.is_featured && (
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            )}
                            <span className="text-sm font-medium">{location.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge variant="secondary" className={`text-[10px] ${typeColors[location.type] || ""}`}>
                            {location.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">
                          {location.city || location.state || "-"}
                        </TableCell>
                        <TableCell className="py-2">
                          <Link
                            href={`/location/${location.slug}`}
                            target="_blank"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            /{location.slug}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                              <Link href={`/admin/locations/${location._id}/edit`}>
                                <Edit2 className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(location._id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
