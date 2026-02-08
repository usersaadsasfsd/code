"use client"

import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { 
  MapPin, Bed, Bath, Maximize2, Heart, Search, Filter, ChevronDown, 
  ChevronUp, X, Building2, Home, CheckCircle2, SlidersHorizontal,
  ArrowUpDown, Grid3X3, List
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback, Suspense } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { cn, formatPriceToIndian, formatPriceRange, BUDGET_RANGES, parseBudgetRange } from "@/lib/utils"

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "plot", label: "Plot" },
  { value: "independent_floor", label: "Independent Floor" },
  { value: "penthouse", label: "Penthouse" },
  { value: "studio", label: "Studio" },
  { value: "sco", label: "SCO" },
  { value: "shop", label: "Shop" },
  { value: "office", label: "Office" },
  { value: "warehouse", label: "Warehouse" },
]

const LISTING_TYPES = [
  { value: "builder_project", label: "Builder Project" },
  { value: "resale", label: "Resale" },
  { value: "rental", label: "Rental" },
  { value: "new", label: "New Launch" },
]

const PROJECT_STATUS = [
  { value: "launched", label: "Launched" },
  { value: "under_construction", label: "Under Construction" },
  { value: "ready_to_move", label: "Ready to Move" },
]

const SEGMENTS = [
  { value: "luxury", label: "Luxury" },
  { value: "premium", label: "Premium" },
  { value: "mid", label: "Mid Range" },
  { value: "affordable", label: "Affordable" },
]

const FURNISHED_TYPES = [
  { value: "unfurnished", label: "Unfurnished" },
  { value: "semi_furnished", label: "Semi Furnished" },
  { value: "fully_furnished", label: "Fully Furnished" },
]

const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5+"]

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
]

interface Property {
  _id: string
  property_name: string
  slug?: string
  main_thumbnail?: string
  address?: string
  city?: string
  developer_name?: string
  bhk_configuration?: string
  bedrooms?: number
  bathrooms?: number
  carpet_area?: number
  super_area?: number
  area_sqft?: number
  lowest_price?: number
  max_price?: number
  price_range?: string
  project_status?: string
  listing_type?: string
  property_type?: string
  rera_registered?: boolean
  rera_id?: string
  rera_no?: string
  is_featured?: boolean
}

function PropertyCard({ property }: { property: Property }) {
  const hasRera = property.rera_registered || property.rera_id || property.rera_no
  const area = property.carpet_area || property.super_area || property.area_sqft

  // Use price_range if available, otherwise format from lowest/max price
  const priceDisplay = property.price_range || formatPriceRange(property.lowest_price, property.max_price)

  return (
    <Link
      href={`/properties/${property.slug || property._id}`}
      className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300"
    >
      <div className="relative h-44 bg-muted overflow-hidden">
        <img
          src={property.main_thumbnail || "/placeholder.svg?height=176&width=300&query=property"}
          alt={property.property_name || "Property"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          {property.listing_type && (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full capitalize">
              {property.listing_type.replace(/_/g, " ")}
            </span>
          )}
          {property.project_status && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-500/90 text-white rounded-full capitalize">
              {property.project_status.replace(/_/g, " ")}
            </span>
          )}
        </div>

        {/* RERA Badge */}
        {hasRera && (
          <div className="absolute top-2 right-2">
            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-500 text-white rounded-full">
              <CheckCircle2 className="h-3 w-3" />
              RERA
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button 
          onClick={(e) => { e.preventDefault(); }}
          className="absolute bottom-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white hover:scale-110 transition-all shadow-sm"
        >
          <Heart className="h-4 w-4 text-muted-foreground hover:text-rose-500" />
        </button>
      </div>

      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {property.property_name || "Property"}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="line-clamp-1">{property.address || property.city || "Location not available"}</span>
          </div>
          {property.developer_name && (
            <p className="text-[11px] text-muted-foreground mt-0.5">By {property.developer_name}</p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          {(property.bhk_configuration || property.bedrooms) && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded">
              <Bed className="h-3 w-3" />
              <span>{property.bhk_configuration || `${property.bedrooms} BHK`}</span>
            </div>
          )}
          {area && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded">
              <Maximize2 className="h-3 w-3" />
              <span>{area} sqft</span>
            </div>
          )}
          {property.property_type && (
            <span className="px-1.5 py-0.5 bg-muted rounded capitalize text-[11px]">
              {property.property_type.replace(/_/g, " ")}
            </span>
          )}
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-sm font-bold text-primary">
            {priceDisplay || "Contact for Price"}
          </p>
        </div>
      </div>
    </Link>
  )
}

function PropertiesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  // Filter state
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    state: searchParams.get("state") || "",
    city: searchParams.get("city") || "",
    category: searchParams.get("category") || "",
    property_type: searchParams.get("property_type") || "",
    listing_type: searchParams.get("listing_type") || "",
    project_status: searchParams.get("project_status") || "",
    segment: searchParams.get("segment") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    furnished_type: searchParams.get("furnished_type") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minArea: searchParams.get("minArea") || "",
    maxArea: searchParams.get("maxArea") || "",
    rera_registered: searchParams.get("rera_registered") || "",
    sort: searchParams.get("sort") || "featured",
  })

  const page = Number(searchParams.get("page")) || 1

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    params.set("page", String(page))
    params.set("limit", "12")
    return params.toString()
  }, [filters, page])

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/properties?${buildQueryString()}`)
        const data = await res.json()
        setProperties(data.properties || [])
        setPagination(data.pagination || { page: 1, total: 0, pages: 1 })
      } catch (error) {
        console.error("[v0] Error loading properties:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [buildQueryString])

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Update URL
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    params.set("page", "1")
    router.push(`/properties?${params.toString()}`)
  }

  const clearAllFilters = () => {
    const clearedFilters = Object.fromEntries(
      Object.keys(filters).map(k => [k, k === "sort" ? "featured" : ""])
    )
    setFilters(clearedFilters as typeof filters)
    router.push("/properties")
  }

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    params.set("page", String(newPage))
    router.push(`/properties?${params.toString()}`)
  }

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== "sort"
  ).length

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/5 to-background px-4 py-8 border-b border-border">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-1">Find Properties</h1>
            <p className="text-sm text-muted-foreground">
              {pagination.total > 0 ? `${pagination.total} properties found` : "Browse our collection"}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Search & Filters */}
          <div className="bg-card border border-border rounded-xl mb-6">
            {/* Main Search Row */}
            <div className="p-4 flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, location, developer..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <select
                  value={filters.property_type}
                  onChange={(e) => updateFilter("property_type", e.target.value)}
                  className="px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                <select
                  value={filters.project_status}
                  onChange={(e) => updateFilter("project_status", e.target.value)}
                  className="px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Any Status</option>
                  {PROJECT_STATUS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                <select
                  value={filters.minPrice && filters.maxPrice ? `${filters.minPrice}-${filters.maxPrice}` : filters.minPrice ? `${filters.minPrice}-` : ""}
                  onChange={(e) => {
                    const { min, max } = parseBudgetRange(e.target.value)
                    updateFilter("minPrice", min ? String(min) : "")
                    setTimeout(() => updateFilter("maxPrice", max ? String(max) : ""), 0)
                  }}
                  className="px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Any Budget</option>
                  {BUDGET_RANGES.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>

                <Button
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={cn(
                    "bg-transparent gap-2",
                    showAdvanced && "bg-primary/5 border-primary/30"
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Advanced
                  {activeFilterCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
              <div className="px-4 pb-4 border-t border-border pt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                {/* Row 1: Location */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">State</label>
                    <input
                      type="text"
                      placeholder="Enter state"
                      value={filters.state}
                      onChange={(e) => updateFilter("state", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">City</label>
                    <input
                      type="text"
                      placeholder="Enter city"
                      value={filters.city}
                      onChange={(e) => updateFilter("city", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Listing Type</label>
                    <select
                      value={filters.listing_type}
                      onChange={(e) => updateFilter("listing_type", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    >
                      <option value="">All Listings</option>
                      {LISTING_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Segment</label>
                    <select
                      value={filters.segment}
                      onChange={(e) => updateFilter("segment", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    >
                      <option value="">All Segments</option>
                      {SEGMENTS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Price & Area */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min Price</label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter("minPrice", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Max Price</label>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter("maxPrice", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min Area (sqft)</label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minArea}
                      onChange={(e) => updateFilter("minArea", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Max Area (sqft)</label>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxArea}
                      onChange={(e) => updateFilter("maxArea", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    />
                  </div>
                </div>

                {/* Row 3: Bedrooms & Other */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bedrooms</label>
                    <div className="flex gap-1">
                      {BEDROOM_OPTIONS.map(b => (
                        <button
                          key={b}
                          onClick={() => updateFilter("bedrooms", filters.bedrooms === b ? "" : b)}
                          className={cn(
                            "flex-1 py-2 text-xs font-medium rounded-lg border transition-colors",
                            filters.bedrooms === b
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border hover:border-primary/50"
                          )}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Furnished</label>
                    <select
                      value={filters.furnished_type}
                      onChange={(e) => updateFilter("furnished_type", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    >
                      <option value="">Any</option>
                      {FURNISHED_TYPES.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.rera_registered === "true"}
                        onChange={(e) => updateFilter("rera_registered", e.target.checked ? "true" : "")}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span className="text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        RERA Registered Only
                      </span>
                    </label>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="bg-transparent text-xs gap-1"
                    >
                      <X className="h-3 w-3" />
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {properties.length} of {pagination.total} properties
            </p>
            <div className="flex items-center gap-2">
              <select
                value={filters.sort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="px-3 py-1.5 text-xs border border-border rounded-lg bg-background"
              >
                {SORT_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5",
                    viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background"
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5",
                    viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                  <div className="h-44 bg-muted" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No properties found matching your criteria</p>
              <Button variant="outline" onClick={clearAllFilters} className="bg-transparent">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={cn(
              "grid gap-4",
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            )}>
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="bg-transparent"
              >
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum: number
                  if (pagination.pages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={cn(
                        "w-8 h-8 text-xs rounded-lg font-medium transition-colors",
                        page === pageNum
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border hover:border-primary/50"
                      )}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(page + 1)}
                disabled={page === pagination.pages}
                className="bg-transparent"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={null}>
      <PropertiesContent />
    </Suspense>
  )
}
