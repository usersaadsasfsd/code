"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import PropertyCard from "@/components/property/property-card"
import { PropertySkeleton } from "@/components/property/property-skeleton"
import { Star } from "lucide-react"

interface HandpickedSelectionsProps {
  limit?: number
}

export default function HandpickedSelections({ limit = 4 }: HandpickedSelectionsProps) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`/api/properties?is_featured=true&limit=${limit}`)
        const data = await response.json()
        setProperties(data.properties || [])
      } catch (error) {
        console.error("[v0] Error fetching properties:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [limit])

  return (
    <section className="w-full py-8 md:py-12 px-3 md:px-4 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-1.5 mb-4 md:mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold">Countryroof's Handpicked Selections</h2>
            <Star size={16} className="text-primary fill-primary" />
          </div>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Expertly curated premium properties</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
          {loading ? (
            <>
              {Array.from({ length: limit }).map((_, i) => (
                <PropertySkeleton key={i} />
              ))}
            </>
          ) : properties.length ? (
            properties.map((property) => <PropertyCard key={property._id} property={property} />)
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground text-sm">No properties available</div>
          )}
        </div>

        {properties.length > 0 && (
          <div className="flex justify-center pt-2">
            <Button asChild variant="outline" className="bg-transparent text-xs h-8">
              <Link href="/properties?is_featured=true">View All Handpicked</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
