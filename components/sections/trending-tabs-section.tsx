"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PropertyCard from "@/components/property/property-card"
import { PropertySkeleton } from "@/components/property/property-skeleton"
import { TrendingUp } from "lucide-react"

interface TrendingTabsSectionProps {
  limit?: number
}

const tabs = [
  { value: "trending", label: "Trending", filter: "is_hot=true" },
  { value: "featured", label: "Featured", filter: "is_featured=true" },
  { value: "upcoming", label: "Upcoming", filter: "" },
  { value: "commercial", label: "Commercial", filter: "property_type=commercial" },
  { value: "affordable", label: "Affordable", filter: "" },
  { value: "sco", label: "SCO", filter: "property_type=sco" },
  { value: "budget", label: "Budget", filter: "" },
  { value: "luxury", label: "Luxury", filter: "is_featured=true" },
]

export default function TrendingTabsSection({ limit = 8 }: TrendingTabsSectionProps) {
  const [properties, setProperties] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("trending")

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const fetchedData: Record<string, any[]> = {}
        await Promise.all(
          tabs.map(async (tab) => {
            const response = await fetch(`/api/properties?${tab.filter}&limit=${limit}`)
            const data = await response.json()
            fetchedData[tab.value] = data.properties || []
          }),
        )
        setProperties(fetchedData)
      } catch (error) {
        console.error("[v0] Error fetching properties:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [limit])

  return (
    <section className="w-full py-8 md:py-12 px-3 md:px-4 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-1.5 mb-4 md:mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold">High-Demand Real Estate in Delhi NCR & Gurgaon</h2>
            <TrendingUp size={16} className="text-primary" />
          </div>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Browse by market segment</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full h-auto gap-2 bg-transparent p-0 mb-4">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs md:text-sm px-2 md:px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
                {loading ? (
                  <>
                    {Array.from({ length: limit }).map((_, i) => (
                      <PropertySkeleton key={i} />
                    ))}
                  </>
                ) : properties[tab.value]?.length ? (
                  properties[tab.value].map((property) => <PropertyCard key={property._id} property={property} />)
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                    No properties in {tab.label}
                  </div>
                )}
              </div>
              {properties[tab.value]?.length > 0 && (
                <div className="flex justify-center pt-2">
                  <Button asChild variant="outline" className="bg-transparent text-xs h-8">
                    <Link href={`/properties?${tab.filter}`}>View All {tab.label}</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
