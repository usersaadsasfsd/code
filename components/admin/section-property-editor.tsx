"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { Plus, Trash2, Search, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Section {
  _id: string
  title: string
  subtitle?: string
  section_type: string
  display_limit: number
  property_ids: string[]
}

interface Property {
  _id: string
  property_name: string
  lowest_price: number
  max_price: number
  main_thumbnail: string
  city: string
  bedrooms: number
  bathrooms: number
}

interface Props {
  sectionId: string
}

export default function SectionPropertyEditor({ sectionId }: Props) {
  const [section, setSection] = useState<Section | null>(null)
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [addingProperty, setAddingProperty] = useState<string | null>(null)
  const [removingProperty, setRemovingProperty] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sectionRes, propertiesRes] = await Promise.all([
          fetch(`/api/admin/homepage-sections/${sectionId}`),
          fetch("/api/properties?limit=1000"),
        ])

        console.log("[v0] Section ID:", sectionId);
        console.log("[v0] Section response status:", sectionRes.status);
        // Handle section response
        if (sectionRes.status === 404) {
          console.warn("[v0] Section not found (404) - it may not have been initialized yet")
          setLoading(false)
          return
        }

        if (sectionRes.ok) {
          const sectionData = await sectionRes.json()
          console.log("[v0] Section data:", sectionData);
          // Ensure property_ids is always an array
          if (sectionData && typeof sectionData === "object") {
            setSection({
              ...sectionData,
              property_ids: Array.isArray(sectionData.property_ids) ? sectionData.property_ids : [],
            })
          }
        } else {
          const error = await sectionRes.json()
          console.error("[v0] Error fetching section:", error)
        }

        // Handle properties response
        if (propertiesRes.ok) {
          const propertiesData = await propertiesRes.json()

          // Handle both array and pagination response formats
          let propertiesList = []
          if (Array.isArray(propertiesData)) {
            propertiesList = propertiesData
          } else if (propertiesData.properties && Array.isArray(propertiesData.properties)) {
            propertiesList = propertiesData.properties
          }

          console.log("[v0] Properties response:", propertiesRes);
          console.log("[v0] Properties response status:", propertiesRes.status);
          console.log("[v0] Properties response data:", propertiesData);
          console.log("[v0] Properties data:", propertiesList);

          setAllProperties(propertiesList)
        }
      } catch (error) {
        console.error("[v0] Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [sectionId])

  const removeProperty = async (propertyId: string) => {
    if (!confirm("Remove this property from section?")) return

    setRemovingProperty(propertyId)
    try {
      const res = await fetch(`/api/admin/homepage-sections/${sectionId}/properties?propertyId=${propertyId}`, {
        method: "DELETE",
      })

      if (res.ok && section) {
        const propertyIds = Array.isArray(section.property_ids) ? section.property_ids : []
        setSection({
          ...section,
          property_ids: propertyIds.filter((p) => p !== propertyId),
        })
        toast({
          title: "Property removed",
          description: "Property has been removed from this section",
        })
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.error || "Failed to remove property",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error removing property:", error)
      toast({
        title: "Error",
        description: "Error removing property. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRemovingProperty(null)
    }
  }

  const addProperty = async (propertyId: string) => {
    if (!section) {
      toast({
        title: "Error",
        description: "Section data not loaded",
        variant: "destructive",
      })
      return
    }

    const propertyIds = Array.isArray(section.property_ids) ? section.property_ids : []

    if (propertyIds.length >= (section.display_limit || 0)) {
      toast({
        title: "Limit reached",
        description: `Maximum ${section.display_limit} properties allowed in this section`,
        variant: "destructive",
      })
      return
    }

    setAddingProperty(propertyId)
    try {
      const res = await fetch(`/api/admin/homepage-sections/${sectionId}/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      })

      if (res.ok && section) {
        setSection({
          ...section,
          property_ids: [...propertyIds, propertyId],
        })
        setSearchTerm("")
        toast({
          title: "Property added",
          description: "Property has been added to this section",
        })
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.error || "Failed to add property",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error adding property:", error)
      toast({
        title: "Error",
        description: "Error adding property. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAddingProperty(null)
    }
  }

  if (loading) {
    return (
      <div className="border border-border rounded-xl p-12">
        <div className="flex flex-col items-center justify-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading properties...</p>
        </div>
      </div>
    )
  }

  if (!section) {
    return (
      <div className="border-2 border-dashed rounded-lg p-12 text-center bg-muted/30">
        <p className="text-muted-foreground font-medium mb-3">Section Not Found</p>
        <p className="text-sm text-muted-foreground mb-4">
          This section hasn't been initialized yet. Go back to the sections list and click "Initialize Default Sections" to get started.
        </p>
        <Button asChild variant="outline">
          <a href="/admin/homepage-sections">Return to Sections</a>
        </Button>
      </div>
    )
  }

  if (allProperties.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg">
        <p className="mb-2">No properties available</p>
        <p className="text-xs">Properties will appear here once they are added to the database.</p>
      </div>
    )
  }

  const sectionPropertyIds = Array.isArray(section.property_ids) ? section.property_ids : []
  const selectedProperties = allProperties.filter((p) => sectionPropertyIds.includes(p._id))
  const availableProperties = allProperties.filter(
    (p) => !sectionPropertyIds.includes(p._id) && p.property_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Selected Properties */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground">
              In Section
            </h2>
            <p className="text-xs text-muted-foreground">
              {sectionPropertyIds.length} of {section.display_limit || 0} slots used
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  sectionPropertyIds.length >= (section.display_limit || 0) 
                    ? "bg-amber-500" 
                    : "bg-primary"
                )}
                style={{ 
                  width: `${Math.min((sectionPropertyIds.length / (section.display_limit || 1)) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
          {selectedProperties.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No properties added yet</p>
              <p className="text-xs mt-1">Search and add properties from the right panel</p>
            </div>
          ) : (
            selectedProperties.map((prop, index) => (
              <div
                key={prop._id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border border-border bg-background",
                  "hover:border-primary/30 hover:bg-muted/30 transition-all"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs font-medium text-muted-foreground w-5 shrink-0">
                    {index + 1}
                  </span>
                  <img
                    src={prop.main_thumbnail || "/placeholder.jpg"}
                    alt={prop.property_name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg"
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{prop.property_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {prop.city} • {prop.bedrooms} BHK • ₹{prop.lowest_price?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeProperty(prop._id)}
                  disabled={removingProperty === prop._id}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2 shrink-0 h-8 w-8 p-0"
                >
                  {removingProperty === prop._id ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Available Properties */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <div className="bg-muted/50 border-b border-border px-4 py-3">
          <h2 className="font-semibold text-foreground">Available Properties</h2>
          <p className="text-xs text-muted-foreground">
            {availableProperties.length} properties available to add
          </p>
        </div>
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by property name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </div>
        <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
          {availableProperties.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {searchTerm ? "No matching properties found" : "All properties have been added"}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-primary hover:underline mt-2"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            availableProperties.slice(0, 50).map((prop) => {
              const isAtLimit = (sectionPropertyIds.length) >= (section?.display_limit || 0)
              const isAdding = addingProperty === prop._id
              
              return (
                <div
                  key={prop._id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border border-border bg-background",
                    "hover:border-primary/30 hover:bg-muted/30 transition-all",
                    isAtLimit && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={prop.main_thumbnail || "/placeholder.jpg"}
                      alt={prop.property_name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.jpg"
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{prop.property_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {prop.city} • {prop.bedrooms} BHK • ₹{prop.lowest_price?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addProperty(prop._id)}
                    disabled={isAdding || isAtLimit}
                    className={cn(
                      "ml-2 shrink-0 h-8 w-8 p-0",
                      !isAtLimit && "text-primary hover:text-primary hover:bg-primary/10"
                    )}
                  >
                    {isAdding ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                  </Button>
                </div>
              )
            })
          )}
          {availableProperties.length > 50 && (
            <p className="text-xs text-center text-muted-foreground py-2">
              Showing first 50 results. Use search to find specific properties.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
