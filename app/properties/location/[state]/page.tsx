"use client"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"
import { MapPin, Bed, Bath, Maximize2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { formatPriceToIndian } from "@/lib/utils"

export default function LocationPage({ params }: { params: { state: string } }) {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/properties?state=${params.state}&page=${page}&limit=12`)
        const data = await res.json()
        setProperties(data.properties || [])
      } catch (error) {
        console.error("[v0] Error loading properties:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [params.state, page])

  return (
    <>
      <Header />
      <main className="min-h-screen px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="capitalize">Properties in {decodeURIComponent(params.state)}</h1>
            <p className="text-muted-foreground text-sm">
              Browse all properties available in {decodeURIComponent(params.state)}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No properties found in this location.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((property) => (
                  <Link
                    key={property._id}
                    href={`/properties/${property._id}`}
                    className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-40 bg-muted overflow-hidden">
                      <img
                        src={property.main_thumbnail || "/placeholder.svg?height=160&width=300&query=property"}
                        alt={property.property_name || "Property"}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <button className="absolute top-2 right-2 p-1.5 bg-white/90 rounded hover:bg-white transition-colors">
                        <Heart size={16} className="text-muted-foreground" />
                      </button>
                    </div>
                    <div className="p-3 space-y-2">
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-1">{property.property_name || "Property"}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin size={12} />
                          <span className="line-clamp-1">{property.city || "Location"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Bed size={14} />
                          {property.bedrooms || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath size={14} />
                          {property.bathrooms || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <Maximize2 size={14} />
                          {property.area_sqft || 0} sqft
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <p className="text-sm font-semibold text-primary">
                          ₹{formatPriceToIndian(property.lowest_price)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center text-xs text-muted-foreground">Page {page}</span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
