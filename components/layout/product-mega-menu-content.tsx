"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { MapPin, Building2, Home, ShoppingCart, Zap, Award, ArrowRight } from "lucide-react"

interface MenuCategory {
  title: string
  icon: React.ReactNode
  description: string
  image: string
  items: Array<{
    name: string
    href: string
    icon: React.ReactNode
    badge?: string
  }>
}

const locationCategories: MenuCategory[] = [
  {
    title: "Dwarka Expressway",
    icon: <MapPin className="w-6 h-6" />,
    description: "Prime NH-8 corridor development",
    image: "/dwarka-expressway-gurugram-modern-properties.jpg",
    items: [
      { name: "All Properties", href: "/properties?location=Dwarka%20Expressway", icon: <Home className="w-4 h-4" /> },
      {
        name: "Luxury Apartments",
        href: "/properties?location=Dwarka%20Expressway&type=Apartment",
        icon: <Building2 className="w-4 h-4" />,
      },
      {
        name: "SCO Plots",
        href: "/properties?location=Dwarka%20Expressway&type=SCO",
        icon: <ShoppingCart className="w-4 h-4" />,
      },
      {
        name: "Commercial",
        href: "/properties?location=Dwarka%20Expressway&type=Commercial",
        icon: <Award className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "Golf Course Road",
    icon: <MapPin className="w-6 h-6" />,
    description: "Gurugram's most exclusive enclave",
    image: "/golf-course-road-gurugram-luxury-properties.jpg",
    items: [
      { name: "All Properties", href: "/properties?location=Golf%20Course%20Road", icon: <Home className="w-4 h-4" /> },
      {
        name: "Premium Apartments",
        href: "/properties?location=Golf%20Course%20Road&type=Apartment",
        icon: <Building2 className="w-4 h-4" />,
      },
      {
        name: "Independent Floors",
        href: "/properties?location=Golf%20Course%20Road&type=Floor",
        icon: <Zap className="w-4 h-4" />,
      },
      {
        name: "Villas",
        href: "/properties?location=Golf%20Course%20Road&type=Villa",
        icon: <Award className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "Sohna Road",
    icon: <MapPin className="w-6 h-6" />,
    description: "Emerging hotspot for investors",
    image: "/sohna-road-gurugram-properties.jpg",
    items: [
      { name: "All Properties", href: "/properties?location=Sohna%20Road", icon: <Home className="w-4 h-4" /> },
      {
        name: "Luxury Plots",
        href: "/properties?location=Sohna%20Road&type=Plot",
        icon: <ShoppingCart className="w-4 h-4" />,
      },
      {
        name: "Residential",
        href: "/properties?location=Sohna%20Road&type=Residential",
        icon: <Building2 className="w-4 h-4" />,
      },
      {
        name: "New Launch",
        href: "/properties?location=Sohna%20Road&status=New%20Launch",
        icon: <Zap className="w-4 h-4" />,
      },
    ],
  },
]

const projectCategories: MenuCategory[] = [
  {
    title: "By Status",
    icon: <Zap className="w-6 h-6" />,
    description: "Filter by project completion",
    image: "/modern-luxury-property-exterior-sunset.jpg",
    items: [
      { name: "Ready To Move", href: "/properties?status=Ready%20To%20Move", icon: <Home className="w-4 h-4" /> },
      { name: "New Launch", href: "/properties?status=New%20Launch", icon: <Award className="w-4 h-4" /> },
      { name: "Upcoming", href: "/properties?status=Upcoming", icon: <Building2 className="w-4 h-4" /> },
    ],
  },
  {
    title: "By Type",
    icon: <Building2 className="w-6 h-6" />,
    description: "Browse by property category",
    image: "/luxury-penthouse-interior-modern-design.jpg",
    items: [
      { name: "Luxury Apartments", href: "/properties?type=Apartment", icon: <Building2 className="w-4 h-4" /> },
      { name: "Plots & Land", href: "/properties?type=Plot", icon: <ShoppingCart className="w-4 h-4" /> },
      { name: "Commercial", href: "/properties?type=Commercial", icon: <Award className="w-4 h-4" /> },
    ],
  },
]

export function LocationMegaMenu() {
  return (
    <div className="bg-white border-t border-b border-gray-200 shadow-2xl overflow-hidden w-screen relative left-1/2 -translate-x-1/2">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {locationCategories.map((category) => (
            <div
              key={category.title}
              className="bg-white hover:bg-gradient-to-br hover:from-white hover:to-[#002366]/2 transition-all duration-300 rounded-lg overflow-hidden border border-gray-100 hover:border-[#002366]/20"
            >
              {/* Image Section with Enhanced Multi-layer Overlay */}
              <div className="relative h-40 md:h-48 overflow-hidden bg-gray-100">
                <Image
                  src={category.image || "/placeholder.svg?height=224&width=400&query=luxury real estate"}
                  alt={category.title}
                  fill
                  className="object-cover w-full h-full hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#002366]/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

                {/* Category Header Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-white/25 backdrop-blur-md rounded-lg text-white shadow-lg">
                      {category.icon}
                    </div>
                  </div>
                  <h3 className="text-sm md:text-base font-bold mb-0.5">{category.title}</h3>
                  <p className="text-xs text-gray-100 line-clamp-1">{category.description}</p>
                </div>
              </div>

              {/* Menu Items with Enhanced Visual Design */}
              <div className="p-3 md:p-4 space-y-2">
                {category.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center justify-between p-2 md:p-2.5 rounded-lg text-gray-700 hover:bg-[#002366]/10 hover:text-[#002366] transition-all duration-200 border border-transparent hover:border-[#002366]/20"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="text-[#002366] flex-shrink-0 hover:scale-125 transition-transform duration-200">
                        {item.icon}
                      </div>
                      <span className="text-xs md:text-sm font-medium truncate">{item.name}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-0 hover:opacity-100 transition-all duration-200 ml-2 flex-shrink-0 text-[#002366]" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProjectMegaMenu() {
  return (
    <div className="bg-white border-t border-b border-gray-200 shadow-2xl overflow-hidden w-screen relative left-1/2 -translate-x-1/2">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {projectCategories.map((category) => (
            <div
              key={category.title}
              className="bg-white hover:bg-gradient-to-br hover:from-white hover:to-[#002366]/2 transition-all duration-300 rounded-lg overflow-hidden border border-gray-100 hover:border-[#002366]/20"
            >
              {/* Image Section with Enhanced Multi-layer Overlay */}
              <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
                <Image
                  src={category.image || "/placeholder.svg?height=256&width=600&query=luxury property"}
                  alt={category.title}
                  fill
                  className="object-cover w-full h-full hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#002366]/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

                {/* Category Header Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-white/25 backdrop-blur-md rounded-lg text-white shadow-lg">
                      {category.icon}
                    </div>
                  </div>
                  <h3 className="text-base md:text-lg font-bold mb-1">{category.title}</h3>
                  <p className="text-xs md:text-sm text-gray-100 line-clamp-1">{category.description}</p>
                </div>
              </div>

              {/* Menu Items with Enhanced Visual Design */}
              <div className="p-4 md:p-5 space-y-2.5">
                {category.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center justify-between p-2.5 md:p-3 rounded-lg text-gray-700 hover:bg-[#002366]/10 hover:text-[#002366] transition-all duration-200 border border-transparent hover:border-[#002366]/20"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-[#002366] flex-shrink-0 hover:scale-125 transition-transform duration-200">
                        {item.icon}
                      </div>
                      <span className="text-sm md:text-base font-medium truncate">{item.name}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-0 hover:opacity-100 transition-all duration-200 ml-2 flex-shrink-0 text-[#002366]" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
