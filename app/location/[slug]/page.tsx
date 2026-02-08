"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { MapPin, Bed, Bath, Maximize2, ChevronLeft, ChevronRight, Building2, Home, BadgeCheck, Grid3X3, List, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatPriceToIndian } from "@/lib/utils"

interface Location {
  _id: string
  name: string
  slug: string
  type: string
  state?: string
  city?: string
  description?: string
  featured_image?: string
  meta_title?: string
  meta_description?: string
}

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
  listing_type?: string
  project_status?: string
  rera_registered?: boolean
  property_type?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function LocationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = params.slug as string
  const currentPage = parseInt(searchParams.get("page") || "1")

  const [location, setLocation] = useState<Location | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/locations/${slug}?page=${currentPage}&limit=12`)
        if (res.ok) {
          const data = await res.json()
          setLocation(data.location)
          setProperties(data.properties)
          setPagination(data.pagination)
        }
      } catch (error) {
        console.error("Error fetching location:", error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchData()
  }, [slug, currentPage])

  const handlePageChange = (page: number) => {
    router.push(`/location/${slug}?page=${page}`)
  }

  const formatPrice = (price: number) => {
    return formatPriceToIndian(price)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <Skeleton className="h-40 rounded-lg mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (!location) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-semibold">Location Not Found</h1>
          <p className="text-sm text-muted-foreground">The location you're looking for doesn't exist.</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/properties">Browse Properties</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Location Header */}
      <div className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2 text-xs">
            <Link href="/properties">
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back to Properties
            </Link>
          </Button>
          
          <div className="flex items-start gap-4">
            {location.featured_image && (
              <img 
                src={location.featured_image || "/placeholder.svg"} 
                alt={location.name}
                className="w-16 h-16 rounded-lg object-cover hidden sm:block"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground capitalize">{location.type}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Properties in {location.name}
              </h1>
              {location.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 max-w-2xl">
                  {location.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {pagination?.total || 0} properties found
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Showing {properties.length} of {pagination?.total || 0} properties
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Properties Grid/List */}
        {properties.length > 0 ? (
          <div className={cn(
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
              : "space-y-3"
          )}>
            {properties.map((property) => (
              <Link
                key={property._id}
                href={`/properties/${property.slug || property._id}`}
                className={cn(
                  "group bg-card border rounded-lg overflow-hidden hover:shadow-md transition-all",
                  viewMode === "list" && "flex"
                )}
              >
                {/* Image */}
                <div className={cn(
                  "relative bg-muted overflow-hidden",
                  viewMode === "grid" ? "h-40" : "w-40 h-28 shrink-0"
                )}>
                  <img
                    src={property.main_thumbnail || "/placeholder.jpg"}
                    alt={property.property_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.src = "/placeholder.jpg" }}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {property.listing_type && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded">
                        {property.listing_type.replace("_", " ")}
                      </span>
                    )}
                    {property.rera_registered && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-500 text-white rounded flex items-center gap-0.5">
                        <BadgeCheck className="h-2.5 w-2.5" />
                        RERA
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-1 text-xs font-bold bg-white/95 text-primary rounded shadow-sm">
                      {formatPrice(property.lowest_price)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 flex-1">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {property.property_name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{property.address || property.city}</span>
                  </div>

                  {/* Specs */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {property.bedrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        {property.bedrooms} BHK
                      </span>
                    )}
                    {property.bathrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bath className="h-3 w-3" />
                        {property.bathrooms}
                      </span>
                    )}
                    {property.area_sqft > 0 && (
                      <span className="flex items-center gap-1">
                        <Maximize2 className="h-3 w-3" />
                        {property.area_sqft} sqft
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No properties found in {location.name}</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let pageNum: number
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="h-8 w-8 p-0 text-xs"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
              className="h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
