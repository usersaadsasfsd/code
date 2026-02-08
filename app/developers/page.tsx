"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Building2, ArrowRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"

interface Developer {
  _id: string
  name: string
  slug: string
  logo_url: string
  about_developer?: string
  property_count: number
}

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const res = await fetch("/api/developers")
        if (res.ok) {
          const data = await res.json()
          setDevelopers(data)
        }
      } catch (error) {
        console.error("Error fetching developers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDevelopers()
  }, [])

  const filteredDevelopers = developers.filter((dev) =>
    dev.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-lg border p-4">
                <Skeleton className="h-12 w-12 rounded-lg mb-3" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Real Estate Developers</h1>
          <p className="text-sm text-muted-foreground">
            Browse properties from {developers.length} trusted developers
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search developers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Developers Grid */}
        {filteredDevelopers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredDevelopers.map((developer) => (
              <Link
                key={developer._id}
                href={`/developer/${developer.slug}`}
                className={cn(
                  "group p-4 rounded-lg border bg-card",
                  "hover:shadow-md hover:border-primary/20",
                  "transition-all duration-200 text-center"
                )}
              >
                {/* Logo */}
                <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden border">
                  {developer.logo_url ? (
                    <img
                      src={developer.logo_url || "/placeholder.svg"}
                      alt={developer.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                {/* Name */}
                <h3 className="text-sm font-medium text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                  {developer.name}
                </h3>

                {/* Property Count */}
                <p className="text-xs text-muted-foreground">
                  {developer.property_count} {developer.property_count === 1 ? "Property" : "Properties"}
                </p>

                {/* Arrow */}
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-4 w-4 mx-auto text-primary" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "No developers found matching your search" : "No developers available"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
