"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  ArrowLeft,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Globe,
  Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatPriceRange } from "@/lib/utils"


interface Developer {
  _id: string
  name: string
  slug: string
  logo_url: string
  about_developer?: string
  description?: string
  website?: string
  project_count: number
}

interface Property {
  _id: string
  slug?: string
  property_name: string
  main_thumbnail: string
  lowest_price: number
  max_price?: number
  bedrooms: number
  bathrooms: number
  area_sqft: number
  address: string
  city: string
  property_type: string
  listing_type: string
  project_status?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function DeveloperDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = params.slug as string
  const currentPage = parseInt(searchParams.get("page") || "1")

  const [developer, setDeveloper] = useState<Developer | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDeveloper = async () => {
      if (!slug) return
      
      setLoading(true)
      try {
        const res = await fetch(`/api/developers/${slug}?page=${currentPage}&limit=10`)
        const data = await res.json()

        if (res.ok) {
          setDeveloper(data.developer)
          setProperties(data.properties)
          setPagination(data.pagination)
          setError(null)
        } else {
          setError(data.error || "Developer not found")
        }
      } catch (err) {
        setError("Failed to load developer")
      } finally {
        setLoading(false)
      }
    }

    fetchDeveloper()
  }, [slug, currentPage])

  const handlePageChange = (newPage: number) => {
    router.push(`/developer/${slug}?page=${newPage}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-b from-muted/50 to-background border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <Skeleton className="h-16 w-16 rounded-lg mb-4" />
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-lg border p-3">
                <Skeleton className="h-40 w-full rounded-md mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !developer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-xl font-semibold">Developer Not Found</h1>
          <p className="text-sm text-muted-foreground">{error || "The developer you're looking for doesn't exist."}</p>
          <Button asChild variant="outline" size="sm" className="bg-transparent">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Developer Header */}
      <div className="bg-gradient-to-b from-muted/50 to-background border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Back Button */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Logo */}
            <div className="w-20 h-20 rounded-lg bg-white border shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              {developer.logo_url ? (
                <img 
                  src={developer.logo_url || "/placeholder.svg"} 
                  alt={developer.name}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                {developer.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {pagination?.total || 0} Properties
                </span>
                {developer.website && (
                  <a 
                    href={developer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {(developer.about_developer || developer.description) && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {developer.about_developer || developer.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">
            Properties by {developer.name}
          </h2>
          {pagination && pagination.total > 0 && (
            <span className="text-xs text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
          )}
        </div>

        {properties.length > 0 ? (
          <>
            {/* Properties Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property) => (
                <Link 
                  key={property._id}
                  href={`/properties/${property.slug || property._id}`}
                  className={cn(
                    "group rounded-lg border bg-card overflow-hidden",
                    "hover:shadow-md hover:border-primary/20",
                    "transition-all duration-200"
                  )}
                >
                  {/* Image */}
                  <div className="relative h-36 bg-muted overflow-hidden">
                    <img
                      src={property.main_thumbnail || "/placeholder.jpg"}
                      alt={property.property_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.jpg"
                      }}
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      {property.listing_type && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded">
                          {property.listing_type}
                        </span>
                      )}
                      {property.project_status && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-background/90 text-foreground rounded">
                          {property.project_status.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>

                    {/* Like Button */}
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors"
                    >
                      <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>

                    {/* Price */}
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-1 text-xs font-semibold bg-white/95 text-primary rounded shadow-sm">
                        {formatPriceRange(property.lowest_price, property.max_price)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                      {property.property_name}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="line-clamp-1">{property.address || property.city}</span>
                    </div>

                    {/* Specs */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
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

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="bg-transparent h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
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
                        className={cn(
                          "h-8 w-8 p-0 text-xs",
                          currentPage !== pageNum && "bg-transparent"
                        )}
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
                  className="bg-transparent h-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No properties found for this developer</p>
          </div>
        )}
      </div>
    </div>
  )
}
