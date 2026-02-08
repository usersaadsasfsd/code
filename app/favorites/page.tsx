"use client"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, MapPin, Bed, Bath } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SavedProperty {
  _id: string
  property_name: string
  main_thumbnail: string
  lowest_price: number
  bedrooms: number
  bathrooms: number
  address: string
  city: string
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<SavedProperty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const saved = localStorage.getItem("favoriteProperties")
        if (saved) {
          setFavorites(JSON.parse(saved))
        }
      } catch (error) {
        console.error("[v0] Error loading favorites:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [])

  const removeFavorite = (propertyId: string) => {
    const updated = favorites.filter((p) => p._id !== propertyId)
    setFavorites(updated)
    localStorage.setItem("favoriteProperties", JSON.stringify(updated))
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold">Saved Properties</h1>
            <p className="text-sm text-muted-foreground">{favorites.length} properties saved</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading favorites...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground mb-4">No saved properties yet</p>
              <Link href="/properties">
                <Button>Browse Properties</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((property) => (
                <div key={property._id} className="bento-card">
                  <img
                    src={property.main_thumbnail || "/placeholder.svg"}
                    alt={property.property_name || "Property"}
                    className="w-full h-40 object-cover rounded mb-2"
                  />
                  <h3 className="font-semibold text-sm line-clamp-1">{property.property_name || "Property"}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <MapPin size={14} />
                    <span className="line-clamp-1">
                      {property.address || "Location"}, {property.city || ""}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Bed size={14} />
                      <span>{property.bedrooms || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath size={14} />
                      <span>{property.bathrooms || 0}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-sm">₹{(property.lowest_price || 0).toLocaleString()}</p>
                    <div className="flex gap-2">
                      <Link href={`/properties/${property._id}`}>
                        <Button variant="outline" size="sm" className="text-xs bg-transparent">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFavorite(property._id)}
                        className="text-destructive"
                      >
                        <Heart size={14} fill="currentColor" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
