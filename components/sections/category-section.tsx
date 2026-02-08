"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import PropertyCard from "@/components/property/property-card"
import { PropertySkeleton } from "@/components/property/property-skeleton"
import { Sparkles } from "lucide-react"

interface CategorySectionProps {
  title: string
  category: string
  icon?: React.ReactNode
  limit?: number
  description?: string
}

export default function CategorySection({ title, category, icon, limit = 4, description }: CategorySectionProps) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`/api/properties?category=${category}&limit=${limit}`)
        const data = await response.json()
        setProperties(data.properties || [])
      } catch (error) {
        console.error("[v0] Error fetching properties:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [category, limit])

  return (
    <section className="w-full py-8 md:py-12 px-3 md:px-4 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-1.5 mb-4 md:mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
            {icon || <Sparkles size={16} className="text-primary" />}
          </div>
          {description && <p className="text-xs md:text-sm text-muted-foreground font-medium">{description}</p>}
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
            <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
              No {title.toLowerCase()} available
            </div>
          )}
        </div>

        {properties.length > 0 && (
          <div className="flex justify-center pt-2">
            <Button asChild variant="outline" className="bg-transparent text-xs h-8">
              <Link href={`/properties/category/${category}`}>View All {title}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
