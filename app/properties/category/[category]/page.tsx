"use client"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"
import { MapPin, Bed, Bath, Maximize2, Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { formatPriceToIndian } from "@/lib/utils"

export default function CategoryPage({ params }: { params: { category: string } }) {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const res = await fetch(`/api/properties?category=${params.category}`)
        const data = await res.json()
        setProperties(data.properties || [])
      } catch (error) {
        console.error("[v0] Error loading properties:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [params.category])

  return (
    <>
      <Header />
      <main className="min-h-screen px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="capitalize">{params.category} Properties</h1>
            <p className="text-muted-foreground text-sm">Browse {params.category} listings</p>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No properties found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((prop) => (
                <Link
                  key={prop._id}
                  href={`/properties/${prop._id}`}
                  className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40 bg-muted overflow-hidden">
                    <img
                      src={prop.main_thumbnail || "/placeholder.svg?height=160&width=300&query=property"}
                      alt={prop.property_name || "Property"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                    <button className="absolute top-2 right-2 p-1.5 bg-white/90 rounded hover:bg-white">
                      <Heart size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-1">{prop.property_name || "Property"}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin size={12} />
                      <span className="line-clamp-1">{prop.address || "Location"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Bed size={14} />
                        {prop.bedrooms || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath size={14} />
                        {prop.bathrooms || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize2 size={14} />
                        {prop.area_sqft || 0} sqft
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm font-semibold text-primary">
                        ₹{formatPriceToIndian(prop.lowest_price)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
