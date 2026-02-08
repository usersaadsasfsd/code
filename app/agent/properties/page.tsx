"use client"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Eye } from "lucide-react"
import { useEffect, useState } from "react"
import { formatPriceToIndian } from "@/lib/utils"

export default function AgentPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const res = await fetch("/api/agent/properties")
        const data = await res.json()
        setProperties(data)
      } catch (error) {
        console.error("[v0] Error loading properties:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this property?")) {
      try {
        const res = await fetch(`/api/agent/properties/${id}`, { method: "DELETE" })
        if (res.ok) {
          setProperties(properties.filter((p) => p._id !== id))
        }
      } catch (error) {
        console.error("[v0] Error deleting property:", error)
      }
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6 px-4 py-8 md:py-12">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">My Properties</h1>
              <p className="text-sm text-muted-foreground">Manage your listed properties</p>
            </div>
            <Button asChild className="text-xs h-8">
              <Link href="/agent/properties/new">Add Property</Link>
            </Button>
          </div>

          {loading ? (
            <div className="border border-border rounded-lg p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="border border-border rounded-lg p-8 text-center">
              <p className="text-sm text-muted-foreground">No properties yet</p>
              <Button asChild variant="outline" className="mt-4 text-xs h-8 bg-transparent">
                <Link href="/agent/properties/new">Create Your First Listing</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map((property) => (
                <div
                  key={property._id}
                  className="border border-border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{property.property_name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{property.address}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-muted rounded text-xs capitalize">{property.status}</span>
                      <span className="px-2 py-1 bg-muted rounded text-xs">₹{formatPriceToIndian(property.lowest_price)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                      <Link href={`/properties/${property._id}`}>
                        <Eye size={14} />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                      <Link href={`/agent/properties/${property._id}/edit`}>
                        <Edit2 size={14} />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleDelete(property._id)}
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
