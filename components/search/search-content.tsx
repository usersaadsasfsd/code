"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"
import { MapPin, Bed, Bath, Maximize2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPriceRange, BUDGET_RANGES, parseBudgetRange } from "@/lib/utils"

export default function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    state: searchParams.get("state") || "",
    category: searchParams.get("category") || "",
    developer_id: searchParams.get("developer_id") || "", // Add developer filter
  })
  const [states, setStates] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [developers, setDevelopers] = useState<any[]>([]) // Add developers state
  const [page, setPage] = useState(1)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const queryString = new URLSearchParams({
          search: query,
          page: page.toString(),
          limit: "12",
          ...(filters.minPrice && { minPrice: filters.minPrice }),
          ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
          ...(filters.state && { state: filters.state }),
          ...(filters.category && { category: filters.category }),
          ...(filters.developer_id && { developer_id: filters.developer_id }), // Add to query
        }).toString()

        const [propsRes, statesRes, categoriesRes, developersRes] = await Promise.all([
          fetch(`/api/properties?${queryString}`),
          fetch("/api/states"),
          fetch("/api/categories"),
          fetch("/api/admin/developers"), // Fetch developers
        ])

        const propsData = await propsRes.json()
        setProperties(propsData.properties || [])
        setStates(await statesRes.json())
        setCategories(await categoriesRes.json())
        setDevelopers(await developersRes.json()) // Set developers
      } catch (error) {
        console.error("[v0] Error loading search results:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [query, filters, page])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1>Search Results</h1>
            <p className="text-muted-foreground text-sm">
              {query && `Results for "${query}"`}
              {!query && "Enter a search query"}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">State</label>
                <select
                  value={filters.state}
                  onChange={(e) => handleFilterChange("state", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">All States</option>
                  {states.map((state) => (
                    <option key={state._id} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Developer</label>
                <select
                  value={filters.developer_id}
                  onChange={(e) => handleFilterChange("developer_id", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">All Developers</option>
                  {developers.map((developer) => (
                    <option key={developer._id} value={developer._id}>
                      {developer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Budget</label>
                <select
                  value={filters.minPrice && filters.maxPrice ? `${filters.minPrice}-${filters.maxPrice}` : filters.minPrice ? `${filters.minPrice}-` : ""}
                  onChange={(e) => {
                    const { min, max } = parseBudgetRange(e.target.value)
                    handleFilterChange("minPrice", min ? String(min) : "")
                    setTimeout(() => handleFilterChange("maxPrice", max ? String(max) : ""), 0)
                  }}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Any Budget</option>
                  {BUDGET_RANGES.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Min Price</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Max Price</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">Loading results...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No properties found. Try different search criteria.</p>
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
                          <span className="line-clamp-1">{property.address || "Location"}</span>
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
                          {formatPriceRange(property.lowest_price, property.max_price)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

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
