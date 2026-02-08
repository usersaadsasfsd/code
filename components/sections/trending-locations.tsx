"use client"

import Link from "next/link"
import { MapPin, TrendingUp } from "lucide-react"

const trendingLocations = [
  {
    name: "Sohna Road",
    properties: "150+ Properties",
    image: "/sohna-road-gurugram-properties.jpg",
  },
  {
    name: "Golf Course Road",
    properties: "200+ Properties",
    image: "/golf-course-road-gurugram-luxury-properties.jpg",
  },
  {
    name: "Dwarka Expressway",
    properties: "180+ Properties",
    image: "/dwarka-expressway-gurugram-modern-properties.jpg",
  },
  {
    name: "New Gurgaon",
    properties: "120+ Properties",
    image: "/new-gurgaon-properties-development.jpg",
  },
  {
    name: "Southern Peripheral Road",
    properties: "90+ Properties",
    image: "/southern-peripheral-road-gurugram-properties.jpg",
  },
  {
    name: "Golf Course Extn Road",
    properties: "160+ Properties",
    image: "/golf-course-extension-road-properties.jpg",
  },
  {
    name: "NH-48",
    properties: "110+ Properties",
    image: "/nh-48-highway-properties-gurugram.jpg",
  },
]

export default function TrendingLocations() {
  return (
    <section className="py-16 px-4 md:px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-3">
          <TrendingUp className="h-8 w-8 text-[#002366]" />
          <h2 className="text-3xl md:text-4xl font-bold text-[#002366] text-center">Trending Locations</h2>
        </div>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Explore the most sought-after locations in Gurugram with premium properties and excellent connectivity
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trendingLocations.map((location) => (
            <Link
              key={location.name}
              href={`/properties?search=${encodeURIComponent(location.name)}`}
              className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 bg-white"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={location.image || "/placeholder.svg"}
                  alt={location.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-5 w-5 text-white" />
                  <h3 className="text-lg font-bold text-white">{location.name}</h3>
                </div>
                <p className="text-sm text-white/90">{location.properties}</p>
              </div>
              <div className="absolute top-3 right-3 bg-[#002366] text-white text-xs font-semibold px-3 py-1 rounded-full">
                Trending
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
