"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, IndianRupee, Bed, Bath, Square, ArrowRight } from "lucide-react"
import { formatPriceToIndian } from "@/lib/utils"

interface Property {
  _id: string
  slug?: string
  property_name: string
  image_url: string
  address: string
  lowest_price: number
  bhk_count?: number
  bathroom_count?: number
  area?: number
  developer_name?: string
}

export default function RecommendedProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/properties?limit=6&state=Haryana")
        const data = await response.json()
        setProperties(data.properties || [])
      } catch (error) {
        console.error("[v0] Error fetching properties:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  if (loading) {
    return (
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[#002366] mb-3">Recommended Properties in Gurugram</h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Discover the most popular developer properties with premium locations, exceptional design, and unmatched
            amenities
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.slice(0, 6).map((property) => (
            <Link key={property._id} href={`/properties/${property.slug || property._id}`}>
              <div className="h-full rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer">
                {/* Image Container */}
                <div className="relative h-56 md:h-64 overflow-hidden bg-gray-200">
                  <img
                    src={property.image_url || "/placeholder.jpg"}
                    alt={property.property_name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg"
                    }}
                  />
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 w-full">
                      <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-300">
                        View Details
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Title & Location */}
                  <div>
                    <h3 className="text-lg font-bold text-[#002366] hover:text-red-500 transition-colors duration-300 line-clamp-1">
                      {property.property_name}
                    </h3>
                    <div className="flex items-start gap-1 mt-2 text-gray-600">
                      <MapPin size={14} className="flex-shrink-0 mt-0.5 text-red-500" />
                      <p className="text-xs text-gray-600 line-clamp-1">{property.address}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-gradient-to-r from-[#002366]/5 to-red-500/5 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Starting From</p>
                    <div className="flex items-center gap-1">
                      <IndianRupee size={16} className="text-red-500" />
                      <p className="text-lg font-bold text-[#002366]">
                        {property.lowest_price
                          ? `₹${formatPriceToIndian(property.lowest_price)}`
                          : "Contact for price"}
                      </p>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                    {property.bhk_count && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                          <Bed size={14} className="text-[#002366]" />
                        </div>
                        <p className="text-xs font-semibold text-[#002366]">{property.bhk_count} BHK</p>
                      </div>
                    )}
                    {property.bathroom_count && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                          <Bath size={14} className="text-[#002366]" />
                        </div>
                        <p className="text-xs font-semibold text-[#002366]">{property.bathroom_count} Bath</p>
                      </div>
                    )}
                    {property.area && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                          <Square size={14} className="text-[#002366]" />
                        </div>
                        <p className="text-xs font-semibold text-[#002366]">
                          {(property.area / 1000).toFixed(1)}K sqft
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Developer Tag */}
                  {property.developer_name && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        By: <span className="font-semibold text-[#002366]">{property.developer_name}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <Link href="/properties">
            <button className="bg-[#002366] hover:bg-[#001a4d] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 mx-auto">
              Explore All Properties
              <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
