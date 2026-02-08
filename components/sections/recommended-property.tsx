"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Bed, Bath, Maximize, TrendingUp, ArrowRight } from "lucide-react"
import { formatPriceToIndian } from "@/lib/utils"

interface Property {
  _id: string
  property_name: string
  address: string
  neighborhood: string
  lowest_price: number
  max_price: number
  property_type: string
  bedrooms_min: number
  bedrooms_max: number
  bathrooms_min: number
  area_min: number
  area_max: number
  images: string[]
  developer?: {
    name: string
  }
}

export default function RecommendedProperty() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/properties?state=Haryana&limit=4&sort=popular")
        const data = await response.json()
        setProperties(data.properties || [])
      } catch (error) {
        console.error("Error fetching recommended properties:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  if (loading) {
    return (
      <section className="w-full py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-white to-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-10 w-64 bg-muted animate-pulse rounded mx-auto mb-4" />
            <div className="h-6 w-96 bg-muted animate-pulse rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[400px] bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-white to-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#002366]/10 mb-4">
            <TrendingUp className="w-5 h-5 text-[#002366]" />
            <span className="text-sm font-semibold text-[#002366]">Most Popular</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#002366]">Recommended Properties</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover Gurugram's finest developer properties handpicked for exceptional value and quality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((property, index) => (
            <Link
              key={property._id}
              href={`/properties/${property._id}`}
              className="relative block hover:shadow-2xl transition-shadow"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-[450px] rounded-2xl overflow-hidden bg-white shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                {/* Image Container with Parallax Effect */}
                <div className="relative h-[280px] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#002366]/20 to-transparent z-10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                  <img
                    src={property.images?.[0] || "/placeholder.svg?height=280&width=400"}
                    alt={property.property_name}
                    className="w-full h-full object-cover transition-all duration-700 hover:scale-110 hover:rotate-1"
                  />

                  {/* Floating Badge with Animation */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-gradient-to-r from-[#002366] to-[#003399] text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg transform transition-all duration-500 hover:scale-110 hover:rotate-3">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      Popular
                    </div>
                  </div>

                  {/* Overlay with "View Details" Button */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 hover:opacity-100 transition-all duration-500 z-20 flex items-center justify-center">
                    <div className="transform translate-y-4 hover:translate-y-0 transition-transform duration-500">
                      <div className="bg-white text-[#002366] px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-xl">
                        View Details
                        <ArrowRight className="w-4 h-4 transform hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section with Slide-up Effect */}
                <div className="p-5 relative">
                  {/* Property Name with Gradient Underline */}
                  <div className="mb-3">
                    <h3 className="font-bold text-lg mb-1 text-gray-900 line-clamp-1 hover:text-[#002366] transition-colors duration-300">
                      {property.property_name}
                    </h3>
                    <div className="h-0.5 w-0 bg-gradient-to-r from-[#002366] to-[#003399] hover:w-full transition-all duration-500" />
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2 mb-4 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#002366]" />
                    <span className="line-clamp-2">{property.neighborhood || property.address}</span>
                  </div>

                  {/* Property Details with Icon Animation */}
                  <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex flex-col items-center gap-1">
                      <Bed className="w-4 h-4 text-[#002366] transform hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-gray-700">
                        {property.bedrooms_min}-{property.bedrooms_max} BHK
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Bath className="w-4 h-4 text-[#002366] transform hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-gray-700">{property.bathrooms_min}+ Bath</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Maximize className="w-4 h-4 text-[#002366] transform hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-gray-700">{property.area_min} sqft</span>
                    </div>
                  </div>

                  {/* Price with Sliding Background */}
                  <div className="relative overflow-hidden rounded-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#002366] to-[#003399] transform -translate-x-full hover:translate-x-0 transition-transform duration-500" />
                    <div className="relative px-3 py-2 text-center">
                      <div className="text-xs text-gray-500 hover:text-white/80 transition-colors duration-300">
                        Starting from
                      </div>
                      <div className="text-xl font-bold text-[#002366] hover:text-white transition-colors duration-300">
                        {formatPriceToIndian(property.lowest_price)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Border Animation */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#002366] via-[#003399] to-[#002366] transform scale-x-0 hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
