"use client"

import { useState } from "react"
import { Play, MapPin, Home, Sparkles, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const FEATURED_PROPERTIES = [
  {
    id: 1,
    name: "Signature Sarvam",
    tagline: "Discover Wellness at Sarvam!",
    bhk: "3BHK",
    location: "Sector 37D, Dwarka Expressway, Gurgaon",
    price: "₹2.90 Cr",
    video: "videos/signature-sarvam.mp4",
    gradient: "from-amber-500/80 to-orange-600/80",
    accent: "bg-amber-500",
    url: "signature-sarvam"
  },
  {
    id: 2,
    name: "Ashiana Aaroham",
    tagline: "Family Bliss at Aaroham!",
    bhk: "3/4 BHK",
    location: "Gurgaon",
    price: "₹2.60 Cr",
    video: "videos/ashiana-aaroham.mp4",
    gradient: "from-emerald-500/80 to-teal-600/80",
    accent: "bg-emerald-500",
    url: "ashiana-aaroham"
  },
  {
    id: 3,
    name: "GIC Manesar",
    tagline: "Luxury Redefined!",
    bhk: "3BHK",
    location: "Sector 9, Manesar",
    price: "₹2.75 Cr",
    video: "videos/gic-manesar.mp4",
    gradient: "from-violet-500/80 to-purple-600/80",
    accent: "bg-violet-500",
    url: "gic-manesar"
  },
  {
    id: 4,
    name: "Elie Saab",
    tagline: "Elie Saab Elegance Awaits!",
    bhk: "Ultra Luxury",
    location: "Sector 111, Gurgaon",
    price: "₹14.60 Cr",
    paymentPlan: "25 : 25 : 25 : 25",
    video: "videos/elie-saab.mp4",
    gradient: "from-rose-500/80 to-pink-600/80",
    accent: "bg-rose-500",
    url: "smartworld-elie-saab-residences"
  },
]

function PropertyVideoCard({ property, index }: { property: typeof FEATURED_PROPERTIES[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        "group relative rounded-2xl overflow-hidden cursor-pointer",
        "h-[380px] md:h-[420px]",
        "shadow-lg hover:shadow-2xl",
        "transition-all duration-500 ease-out",
        "hover:scale-[1.02] hover:-translate-y-1"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Background */}
      <video
        src={property.video}
        autoPlay
        loop
        muted
        playsInline
        className={cn(
          "absolute inset-0 w-full h-full object-cover",
          "transition-transform duration-700 ease-out",
          isHovered ? "scale-110" : "scale-100"
        )}
      />

      {/* Gradient Overlay - Always visible */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent",
        "transition-opacity duration-300"
      )} />

      {/* Colored Overlay on Hover */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t",
        property.gradient,
        "opacity-0 group-hover:opacity-60",
        "transition-opacity duration-500"
      )} />

      {/* Badge */}
      <div className={cn(
        "absolute top-3 left-3",
        "px-2.5 py-1 rounded-full",
        property.accent,
        "text-white text-xs font-semibold",
        "shadow-lg"
      )}>
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Featured
        </span>
      </div>

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        {/* Property Info - Always Visible at Bottom */}
        <div className={cn(
          "transform transition-all duration-500 ease-out",
          isHovered ? "translate-y-0 opacity-100" : "translate-y-0 opacity-100"
        )}>
          {/* Tagline */}
          <p className={cn(
            "text-white/80 text-xs font-medium tracking-wide uppercase mb-1",
            "transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-70"
          )}>
            {property.tagline}
          </p>

          {/* Name */}
          <h3 className="text-white text-xl font-bold mb-2">
            {property.name}
          </h3>

          {/* Details Row */}
          <div className={cn(
            "flex items-center gap-2 flex-wrap mb-2",
            "transition-all duration-300 delay-75"
          )}>
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-semibold",
              "bg-white/20 backdrop-blur-sm text-white"
            )}>
              <Home className="h-3 w-3 inline mr-1" />
              {property.bhk}
            </span>
            <span className="text-white/80 text-xs flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {property.location}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-lg font-bold">
                {property.price}
              </p>
              {property.paymentPlan && (
                <p className="text-white/70 text-xs">
                  Payment Plan: {property.paymentPlan}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Hover CTA */}
        <div className={cn(
          "mt-3 overflow-hidden transition-all duration-500",
          isHovered ? "max-h-12 opacity-100" : "max-h-0 opacity-0"
        )}>
          <Link
            href={`/properties/${property.url}`}
            className={cn(
              "inline-flex items-center gap-2 w-full justify-center",
              "py-2.5 px-4 rounded-lg",
              "bg-white text-foreground font-semibold text-sm",
              "hover:bg-white/90 transition-colors",
              "shadow-lg"
            )}
          >
            View Property
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Shine Effect on Hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100",
        "bg-gradient-to-r from-transparent via-white/10 to-transparent",
        "-translate-x-full group-hover:translate-x-full",
        "transition-all duration-1000 ease-out"
      )} />
    </div>
  )
}

export default function FeaturedVideoProperties() {
  return (
    <section className="w-full py-12 md:py-16 px-4 md:px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Handpicked Selection
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Luxury Properties
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Experience premium living with our exclusive collection of luxury residences
            </p>
          </div>
          
          <Link 
            href="/properties?listing_type=new"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full",
              "bg-primary/5 hover:bg-primary/10 border border-primary/20",
              "text-primary font-medium text-sm",
              "transition-all duration-300",
              "hover:gap-3 group"
            )}
          >
            View All Luxury
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {FEATURED_PROPERTIES.map((property, index) => (
            <PropertyVideoCard key={property.id} property={property} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
