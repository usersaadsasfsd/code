"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Bed, Bath, Maximize2, TrendingUp } from "lucide-react"
import { formatPriceRange } from "@/lib/utils"

export default function FeaturedListings() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/properties?limit=3&sort=featured")
        const data = await response.json()
        setProperties(data.properties || [])
      } catch (error) {
        console.error("[v0] Error fetching featured properties:", error)
        setProperties([])
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  if (loading) {
    return (
      <section className="w-full py-8 md:py-12 px-3 md:px-4 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[300px] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-8 md:py-12 px-3 md:px-4 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-1.5 mb-4 md:mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold">Featured Properties</h2>
            <TrendingUp size={16} className="text-primary" />
          </div>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">
            Handpicked premium listings · Updated daily
          </p>
        </div>

        <div className="bento-grid md:grid-cols-3 mb-4">
          {properties && properties.length > 0 ? (
            properties.map((property) => (
              <Link key={property._id} href={`/properties/${property.slug || property._id}`} className="bento-card flex flex-col">
                {/* Image container with minimal height */}
                <div className="relative h-32 md:h-40 bg-muted overflow-hidden rounded-md mb-2.5">
                  <img
                    src={property.main_thumbnail || property.images?.[0] || "/placeholder.jpg"}
                    alt={property.property_name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg"
                    }}
                  />
                  {property.is_featured && (
                    <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-bold">
                      Featured
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  {/* Title and location */}
                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-sm md:text-base text-foreground line-clamp-1">{property.property_name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin size={12} className="shrink-0" />
                      <span className="line-clamp-1">{property.neighborhood || property.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    {property.bhk_configuration && (
                      <span className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded">
                        <Bed size={12} />
                        {property.bhk_configuration}
                      </span>
                    )}
                    {property.bathrooms_min && (
                      <span className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded">
                        <Bath size={12} />
                        {property.bathrooms_min}+
                      </span>
                    )}
                    {property.carpet_area && (
                      <span className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded">
                        <Maximize2 size={12} />
                        {property.carpet_area} sqft
                      </span>
                    )}
                  </div>

                  <div className="border-t border-border/40 pt-1.5 mt-auto">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm md:text-base font-bold text-primary">
                        {property.price_range || formatPriceRange(property.lowest_price, property.max_price)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-muted-foreground">
              No featured properties available at the moment
            </div>
          )}
        </div>

        <div className="flex justify-center pt-2">
          <Button asChild variant="outline" className="bg-transparent text-xs h-8">
            <Link href="/properties">View All Properties</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
