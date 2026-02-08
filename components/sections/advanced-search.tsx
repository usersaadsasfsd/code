"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Building2, Home, MapPin, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn, BUDGET_RANGES } from "@/lib/utils"

const PLACEHOLDER_SUGGESTIONS = [
  "3 BHK in Gurgaon",
  "4 BHK Luxury Apartments",
  "Dwarka Expressway",
  "Golf Course Road",
  "Ready to Move",
  "Under Construction",
  "SCO Plots",
  "Independent Floors",
  "New Launch Projects",
  "Residential Projects",
]

const CATEGORIES = [
  { name: "Apartments", icon: Building2, href: "/properties?category=apartment", color: "bg-blue-500/10 text-blue-600" },
  { name: "Villas", icon: Home, href: "/properties?category=villa", color: "bg-emerald-500/10 text-emerald-600" },
  { name: "Plots", icon: MapPin, href: "/properties?category=plot", color: "bg-amber-500/10 text-amber-600" },
  { name: "SCO", icon: Building2, href: "/properties?category=sco", color: "bg-purple-500/10 text-purple-600" },
  { name: "Commercial", icon: Building2, href: "/properties?category=commercial", color: "bg-rose-500/10 text-rose-600" },
  { name: "Floors", icon: Home, href: "/properties?category=independent_floor", color: "bg-cyan-500/10 text-cyan-600" },
]

// Budget categories for quick selection
const BUDGET_CATEGORIES = BUDGET_RANGES.slice(0, 6).map((range) => ({
  name: range.label,
  href: `/properties?minPrice=${range.min}${range.max ? `&maxPrice=${range.max}` : ''}`,
}))

const locations = [
  "Dwarka Expressway",
  "Golf Course Road",
  "Sohna Road",
  "Sushant Lok",
  "New Gurgaon",
  "Southern Peripheral Road",
  "Golf Course Extn Road",
  "NH-48",
]

const projectTypes = [
  "SCO Plots",
  "Plots In Gurugram",
  "Luxury Apartment",
  "Residential Projects",
  "Commercial Projects",
  "Independent Floors",
]

const projectStatus = ["Upcoming Projects", "New Launch Projects", "Under Construction", "Ready To Move"]

export default function AdvancedSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("")
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Typewriter effect for placeholder
  useEffect(() => {
    if (searchTerm) return // Don't animate if user is typing
    
    const currentSuggestion = PLACEHOLDER_SUGGESTIONS[placeholderIndex]
    let charIndex = 0
    let isDeleting = false
    
    const typeInterval = setInterval(() => {
      if (!isDeleting) {
        if (charIndex <= currentSuggestion.length) {
          setDisplayedPlaceholder(currentSuggestion.slice(0, charIndex))
          charIndex++
        } else {
          setTimeout(() => {
            isDeleting = true
          }, 2000)
        }
      } else {
        if (charIndex > 0) {
          charIndex--
          setDisplayedPlaceholder(currentSuggestion.slice(0, charIndex))
        } else {
          isDeleting = false
          setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_SUGGESTIONS.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearInterval(typeInterval)
  }, [placeholderIndex, searchTerm])

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/properties?limit=100")
        const data = await response.json()
        setProperties(data.properties || [])
      } catch (error) {
        console.error("[v0] Error fetching properties:", error)
      }
    }
    fetchProperties()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([])
      return
    }

    const allSuggestions = [
      ...locations,
      ...projectTypes,
      ...projectStatus,
      ...properties.map((p) => p.property_name),
      ...properties.map((p) => p.address),
      ...properties.map((p) => p.neighborhood),
    ]

    const filtered = allSuggestions
      .filter((item) => item && item.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((item, index, self) => self.indexOf(item) === index)
      .slice(0, 8)

    setSuggestions(filtered)
  }, [searchTerm, properties])

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/properties?search=${encodeURIComponent(searchTerm)}`)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
    setShowSuggestions(false)
    router.push(`/properties?search=${encodeURIComponent(suggestion)}`)
  }

  return (
    <div className="relative -mt-20 z-10 max-w-5xl mx-auto px-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700" 
        ref={searchRef}
      >
        {/* Main Search Area */}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground">Find Your Perfect Property</h2>
              <p className="text-xs text-muted-foreground">Search from 5000+ premium properties</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                ref={inputRef}
                type="text"
                placeholder={searchTerm ? "" : `Search "${displayedPlaceholder}|"`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowSuggestions(true)
                  setIsTyping(e.target.value.length > 0)
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
                className={cn(
                  "w-full h-14 pl-12 pr-4 text-base rounded-xl",
                  "border-2 border-border bg-muted/30",
                  "focus:outline-none focus:border-primary focus:bg-background",
                  "transition-all duration-300",
                  "placeholder:text-muted-foreground/60"
                )}
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-xl max-h-72 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Suggestions</p>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted transition-colors flex items-center gap-3 group"
                      >
                        <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                          <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <span className="text-sm text-foreground">{suggestion}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleSearch} 
              size="lg" 
              className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Categories Section */}
        <div className="border-t border-border bg-muted/20 px-6 md:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Browse by Category</p>
            <Link 
              href="/properties" 
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap",
                  "border border-border bg-background",
                  "hover:border-primary/30 hover:shadow-sm",
                  "transition-all duration-200",
                  "group"
                )}
              >
                <div className={cn("p-1 rounded-md", category.color)}>
                  <category.icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
