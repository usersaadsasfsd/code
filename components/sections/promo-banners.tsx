"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, Building2, TrendingUp, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const PROMO_BANNERS = [
  {
    id: 1,
    title: "New Launch Alert",
    subtitle: "Dwarka Expressway",
    description: "Premium 3 & 4 BHK apartments starting from ₹1.5 Cr",
    cta: "Explore Now",
    href: "/properties?location=dwarka-expressway&status=new-launch",
    gradient: "from-[#002366] via-[#003399] to-[#0044cc]",
    icon: Sparkles,
    badge: "Limited Units",
  },
  {
    id: 2,
    title: "Ready to Move",
    subtitle: "Golf Course Road",
    description: "Luxury villas with world-class amenities",
    cta: "Book Site Visit",
    href: "/properties?location=golf-course-road&status=ready-to-move",
    gradient: "from-emerald-600 via-emerald-500 to-teal-500",
    icon: Building2,
    badge: "Best Seller",
  },
  {
    id: 3,
    title: "Investment Hotspot",
    subtitle: "SCO Plots in Gurugram",
    description: "Guaranteed 12% ROI | Prime Commercial Spaces",
    cta: "Learn More",
    href: "/properties?category=sco",
    gradient: "from-amber-600 via-orange-500 to-rose-500",
    icon: TrendingUp,
    badge: "High Returns",
  },
]

export default function PromoBanners() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PROMO_BANNERS.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPaused])

  return (
    <section className="w-full py-8 md:py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Desktop - All Banners Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-5">
          {PROMO_BANNERS.map((banner, index) => (
            <Link
              key={banner.id}
              href={banner.href}
              className={cn(
                "group relative overflow-hidden rounded-2xl p-6",
                "bg-gradient-to-br shadow-lg",
                banner.gradient,
                "hover:shadow-2xl hover:-translate-y-1",
                "transition-all duration-500"
              )}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl translate-x-20 -translate-y-20" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl -translate-x-16 translate-y-16" />
              </div>

              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 text-xs font-bold bg-white/20 backdrop-blur-md text-white rounded-full">
                  {banner.badge}
                </span>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                <div className="p-2 w-fit rounded-xl bg-white/20 backdrop-blur-md mb-4">
                  <banner.icon className="h-6 w-6 text-white" />
                </div>
                
                <div className="space-y-1 mb-4">
                  <p className="text-white/80 text-sm font-medium">{banner.title}</p>
                  <h3 className="text-white text-xl font-bold">{banner.subtitle}</h3>
                </div>
                
                <p className="text-white/90 text-sm mb-6 flex-1">
                  {banner.description}
                </p>

                <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
                  {banner.cta}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile/Tablet - Single Banner Carousel */}
        <div className="lg:hidden">
          <div 
            className="relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {PROMO_BANNERS.map((banner, index) => (
              <Link
                key={banner.id}
                href={banner.href}
                className={cn(
                  "block relative overflow-hidden rounded-2xl p-6",
                  "bg-gradient-to-br shadow-lg",
                  banner.gradient,
                  "transition-all duration-500",
                  index === activeIndex ? "opacity-100" : "absolute inset-0 opacity-0 pointer-events-none"
                )}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl translate-x-20 -translate-y-20" />
                </div>

                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 text-xs font-bold bg-white/20 backdrop-blur-md text-white rounded-full">
                    {banner.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="p-2 w-fit rounded-xl bg-white/20 backdrop-blur-md mb-4">
                    <banner.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    <p className="text-white/80 text-sm font-medium">{banner.title}</p>
                    <h3 className="text-white text-xl font-bold">{banner.subtitle}</h3>
                  </div>
                  
                  <p className="text-white/90 text-sm mb-4">
                    {banner.description}
                  </p>

                  <div className="flex items-center gap-2 text-white font-semibold">
                    {banner.cta}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {PROMO_BANNERS.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === activeIndex ? "w-6 bg-primary" : "w-2 bg-primary/30"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
