"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { MapPin, Bed, Bath, Maximize2, ArrowRight, Heart, Eye } from "lucide-react"
import { cn, formatPriceToIndian } from "@/lib/utils"

interface Property {
  _id: string
  slug?: string
  property_name: string
  main_thumbnail: string
  lowest_price: number
  bedrooms: number
  bathrooms: number
  area_sqft: number
  address: string
  city: string
  is_featured?: boolean
  is_hot?: boolean
}

interface Section {
  _id: string
  title: string
  subtitle?: string
  display_limit: number
  sort_order: number
  section_type: string
  properties: Property[]
}

function PropertyCardEnhanced({ property, index }: { property: Property; index: number }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link 
      href={`/properties/${property.slug || property._id}`} 
      className={cn(
        "group relative bg-card rounded-2xl overflow-hidden",
        "border border-border/50 hover:border-primary/20",
        "shadow-sm hover:shadow-xl",
        "transition-all duration-500 ease-out",
        "hover:-translate-y-1",
        "animate-in fade-in slide-in-from-bottom-4",
      )}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-48 md:h-52 overflow-hidden">
        <img
          src={property.main_thumbnail || "/placeholder.jpg"}
          alt={property.property_name}
          className={cn(
            "w-full h-full object-cover",
            "transition-transform duration-700 ease-out",
            "group-hover:scale-110"
          )}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.jpg"
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {property.is_featured && (
            <span className="px-2.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full shadow-lg">
              Featured
            </span>
          )}
          {property.is_hot && (
            <span className="px-2.5 py-1 text-xs font-semibold bg-rose-500 text-white rounded-full shadow-lg animate-pulse">
              Hot
            </span>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className={cn(
          "absolute top-3 right-3 flex flex-col gap-2",
          "transition-all duration-300",
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        )}>
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsLiked(!isLiked)
            }}
            className={cn(
              "p-2 rounded-full backdrop-blur-md shadow-lg",
              "transition-all duration-200",
              isLiked ? "bg-rose-500 text-white" : "bg-white/90 text-foreground hover:bg-white"
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          </button>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 left-3">
          <div className="px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md shadow-lg">
            <p className="text-sm md:text-base font-bold text-primary">
              ₹{property.lowest_price ? formatPriceToIndian(property.lowest_price) : "Contact"}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {property.property_name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{property.address || property.city}</span>
          </div>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/50">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms} BHK</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.area_sqft > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Maximize2 className="h-4 w-4" />
              <span>{property.area_sqft} sqft</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function DynamicSections() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map())

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch("/api/homepage-sections-with-properties")
        if (!response.ok) throw new Error("Failed to fetch sections")
        const data = await response.json()
        setSections(data || [])
      } catch (error) {
        console.error("[v0] Error fetching sections:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSections()
  }, [])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.1, rootMargin: "50px" }
    )

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [sections])

  if (loading) {
    return (
      <div className="w-full py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-2xl h-52 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {sections.map((section, sectionIndex) => (
        <section 
          key={section._id} 
          id={`section-${section._id}`}
          ref={(el) => { if (el) sectionRefs.current.set(section._id, el) }}
          className={cn(
            "w-full py-12 md:py-16 px-4 md:px-6",
            sectionIndex % 2 === 1 && "bg-muted/30"
          )}
        >
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className={cn(
              "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8",
              "transition-all duration-700",
              visibleSections.has(`section-${section._id}`) 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-4"
            )}>
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-muted-foreground max-w-xl">
                    {section.subtitle}
                  </p>
                )}
              </div>
              
              <Link 
                href={`/properties?section=${section.section_type}`}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 rounded-full",
                  "bg-primary/5 hover:bg-primary/10 border border-primary/20",
                  "text-primary font-medium text-sm",
                  "transition-all duration-300",
                  "hover:gap-3 group"
                )}
              >
                View All
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Properties Grid */}
            {section.properties && section.properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                {section.properties.slice(0, section.display_limit).map((property, index) => (
                  <PropertyCardEnhanced 
                    key={property._id} 
                    property={property}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No properties in this section yet</p>
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
