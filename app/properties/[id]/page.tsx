"use client"

import { useState, useEffect } from "react"
import { 
  MapPin, Bed, Bath, Square, Building2, 
  ChevronLeft, ChevronRight, Car, Compass, Layers, 
  IndianRupee, Warehouse, Building, Home,
  Share2, Heart, Video, ImageIcon, 
  Check, Phone, Mail, Calendar, ArrowLeft,
  Shield, Clock, TreePine, Dumbbell,
  Waves, Wifi, Zap, Wind, Sun, FileText,
  ExternalLink, Ruler, Grid3X3, Users, Mountain
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { generatePropertySchema } from "@/lib/schema-markup-generator"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"
import { cn, formatPriceToIndian } from "@/lib/utils"

// Amenity icon mapping
const AMENITY_ICONS: Record<string, any> = {
  "swimming pool": Waves, "pool": Waves, "gym": Dumbbell, "fitness": Dumbbell,
  "wifi": Wifi, "internet": Wifi, "garden": TreePine, "park": TreePine,
  "parking": Car, "security": Shield, "power backup": Zap, "electricity": Zap,
  "ac": Wind, "air conditioning": Wind, "sunlight": Sun, "view": Mountain,
}

function getAmenityIcon(amenity: string) {
  const lowerAmenity = amenity.toLowerCase()
  for (const [key, Icon] of Object.entries(AMENITY_ICONS)) {
    if (lowerAmenity.includes(key)) return Icon
  }
  return Check
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [property, setProperty] = useState<any>(null)
  const [developer, setDeveloper] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const { id } = await params
        const res = await fetch(`/api/properties/${id}`)
        const data = await res.json()
        setProperty(data.property)
        if (data.property?.developer_id) {
          const devRes = await fetch(`/api/admin/developers/${data.property.developer_id}`)
          if (devRes.ok) setDeveloper(await devRes.json())
        }
      } catch (error) {
        console.error("Error loading property:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProperty()
  }, [params])

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background animate-pulse">
          <div className="h-[50vh] bg-muted" />
          <div className="max-w-6xl mx-auto px-3 py-4">
            <div className="h-6 bg-muted rounded w-3/4 mb-3" />
            <div className="h-4 bg-muted rounded w-1/2 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-3">
                <div className="h-40 bg-muted rounded-lg" />
                <div className="h-40 bg-muted rounded-lg" />
              </div>
              <div className="h-72 bg-muted rounded-lg" />
            </div>
          </div>
        </div>

      </>
    )
  }

  if (!property) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Building2 className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground mb-1">Property Not Found</h1>
            <p className="text-sm text-muted-foreground mb-4">The property you're looking for doesn't exist.</p>
            <Button asChild size="sm">
              <Link href="/properties"><ArrowLeft className="h-3 w-3 mr-1" />Browse Properties</Link>
            </Button>
          </div>
        </div>

      </>
    )
  }

  const images = [property.main_banner || property.main_thumbnail, ...(property.multiple_images || [])].filter(Boolean)
  const schemaMarkup = property ? generatePropertySchema(property) : null

  const formatPrice = (price: number) => {
    return formatPriceToIndian(price)
  }

  const getPropertyTypeIcon = () => {
    const type = property.property_type?.toLowerCase() || ""
    if (type.includes("apartment") || type.includes("flat")) return Building2
    if (type.includes("villa") || type.includes("house")) return Home
    if (type.includes("plot") || type.includes("land")) return Layers
    if (type.includes("office") || type.includes("commercial") || type.includes("sco")) return Building
    if (type.includes("warehouse")) return Warehouse
    return Home
  }
  const PropertyTypeIcon = getPropertyTypeIcon()

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "ready_to_move": "Ready to Move", "ready": "Ready", "under_construction": "Under Construction",
      "launched": "New Launch", "upcoming": "Upcoming", "resale": "Resale"
    }
    return labels[status] || status?.replace(/_/g, " ")
  }

  const isResidential = ["apartment", "villa", "house", "flat", "penthouse", "duplex", "studio", "independent"].some(
    t => property.property_type?.toLowerCase().includes(t)
  )
  const isPlot = ["plot", "land"].some(t => property.property_type?.toLowerCase().includes(t))

  const nextImage = () => setActiveImage((prev) => (prev + 1) % images.length)
  const prevImage = () => setActiveImage((prev) => (prev - 1 + images.length) % images.length)

  // Create key-value specs to display
  const allSpecs = [
    { label: "Property Type", value: property.property_type, icon: Building2 },
    { label: "Listing Type", value: property.listing_type?.replace(/_/g, " "), icon: FileText },
    { label: "Category", value: property.property_category, icon: Grid3X3 },
    { label: "Project Status", value: getStatusLabel(property.project_status || property.possession_type), icon: Clock },
    { label: "Bedrooms", value: property.bedrooms, icon: Bed, show: isResidential && property.bedrooms > 0 },
    { label: "Bathrooms", value: property.bathrooms, icon: Bath, show: isResidential && property.bathrooms > 0 },
    { label: "Balconies", value: property.balconies_count, icon: Mountain, show: property.balconies_count > 0 },
    { label: "Carpet Area", value: property.carpet_area ? `${property.carpet_area} sqft` : null, icon: Square },
    { label: "Built-up Area", value: property.built_up_area ? `${property.built_up_area} sqft` : null, icon: Ruler },
    { label: "Super Area", value: property.super_area ? `${property.super_area} sqft` : null, icon: Layers },
    { label: "Area", value: property.area_sqft ? `${property.area_sqft} sqft` : null, icon: Square },
    { label: "Property Size", value: property.property_size, icon: Ruler },
    { label: "Facing", value: property.direction_facing?.replace(/_/g, " "), icon: Compass },
    { label: "Floor", value: property.floor_number ? `${property.floor_number}${property.total_floors ? ` of ${property.total_floors}` : ""}` : null, icon: Layers },
    { label: "Total Floors", value: property.total_floors, icon: Building },
    { label: "Parking", value: property.parking_count ? `${property.parking_count} (${property.parking_type || "Open"})` : null, icon: Car },
    { label: "Furnished", value: property.furnished_type?.replace(/_/g, " "), icon: Home },
    { label: "Possession", value: property.possession || property.possession_year_quarter, icon: Calendar },
    { label: "Possession Date", value: property.possession_date, icon: Calendar },
    { label: "Developer", value: property.developer_name || developer?.name, icon: Building },
    { label: "Brand Collection", value: property.brand_collection, icon: FileText },
    { label: "Target Segment", value: property.target_segment, icon: Users },
    { label: "Total Towers", value: property.total_towers, icon: Building },
    { label: "Total Units", value: property.total_units, icon: Grid3X3 },
    { label: "Floors/Tower", value: property.floors_per_tower, icon: Layers },
    { label: "Total Acreage", value: property.total_acreage ? `${property.total_acreage} acres` : null, icon: Ruler },
    { label: "Open Area", value: property.open_area_percentage ? `${property.open_area_percentage}%` : null, icon: TreePine },
    { label: "Clubhouse Size", value: property.clubhouse_size ? `${property.clubhouse_size} sqft` : null, icon: Building },
    { label: "BHK Config", value: property.bhk_configuration, icon: Bed },
    { label: "Booking Amount", value: property.booking_amount ? `₹${formatPrice(property.booking_amount)}` : null, icon: IndianRupee },
    { label: "Payment Plan", value: property.payment_plan, icon: FileText },
    { label: "Taxes Included", value: property.taxes_included !== undefined ? (property.taxes_included ? "Yes" : "No") : null, icon: FileText },
  ].filter(spec => spec.value && (spec.show === undefined || spec.show))

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {schemaMarkup && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
        )}

        {/* Hero Gallery */}
        <section className="relative h-[45vh] lg:h-[55vh] overflow-hidden bg-muted">
          {images.length > 0 ? (
            <>
              <img
                src={images[activeImage] || "/placeholder.svg"}
                alt={property.property_name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setShowFullscreen(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                {property.is_featured && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary text-primary-foreground">Featured</span>
                )}
                {property.is_hot && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500 text-white">Hot</span>
                )}
                {(property.project_status || property.possession_type) && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500 text-white">
                    {getStatusLabel(property.project_status || property.possession_type)}
                  </span>
                )}
                {property.rera_registered && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500 text-white">RERA</span>
                )}
              </div>

              {/* Actions */}
              <div className="absolute top-3 right-3 flex gap-1.5">
                <button onClick={() => setIsLiked(!isLiked)} className={cn("p-2 rounded-full", isLiked ? "bg-rose-500 text-white" : "bg-black/40 text-white hover:bg-black/60")}>
                  <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                </button>
                <button className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              {/* Image counter & video */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="bg-black/60 text-white px-2.5 py-1 rounded text-xs flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />{activeImage + 1}/{images.length}
                </span>
                {property.walkthrough_video && (
                  <a href={property.walkthrough_video} target="_blank" rel="noopener noreferrer" className="bg-black/60 text-white px-2.5 py-1 rounded text-xs flex items-center gap-1 hover:bg-black/80">
                    <Video className="h-3 w-3" />Video
                  </a>
                )}
                {property.drone_video && (
                  <a href={property.drone_video} target="_blank" rel="noopener noreferrer" className="bg-black/60 text-white px-2.5 py-1 rounded text-xs flex items-center gap-1 hover:bg-black/80">
                    <Video className="h-3 w-3" />Drone
                  </a>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 flex gap-1">
                  {images.slice(0, 4).map((img: string, idx: number) => (
                    <button key={idx} onClick={() => setActiveImage(idx)} className={cn("h-10 w-14 rounded overflow-hidden border", activeImage === idx ? "border-white" : "border-transparent opacity-70")}>
                      <img src={img || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {images.length > 4 && (
                    <button onClick={() => setShowFullscreen(true)} className="h-10 w-14 rounded bg-black/60 flex items-center justify-center text-white text-xs font-medium">
                      +{images.length - 4}
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </section>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-3 py-4 lg:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                    <PropertyTypeIcon className="h-3 w-3" />
                    <span className="capitalize">{property.property_type}</span>
                  </span>
                  {property.listing_type && (
                    <span className="px-2 py-1 rounded bg-muted text-muted-foreground font-medium capitalize">
                      {property.listing_type.replace(/_/g, " ")}
                    </span>
                  )}
                </div>

                <h1 className="text-xl lg:text-2xl font-bold text-foreground leading-tight">{property.property_name}</h1>

                {(property.developer_name || developer?.name) && (
                  <p className="text-xs text-muted-foreground">by <span className="font-medium text-foreground">{property.developer_name || developer?.name}</span></p>
                )}

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span>{[property.address, property.neighborhood, property.city, property.state].filter(Boolean).join(", ")}</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-xl lg:text-2xl font-bold text-primary">
                    {property.lowest_price ? `₹${formatPrice(property.lowest_price)}` : "Price on Request"}
                  </span>
                  {property.max_price && property.max_price !== property.lowest_price && (
                    <span className="text-sm text-muted-foreground">- ₹{formatPrice(property.max_price)}</span>
                  )}
                  {property.price_range && !property.lowest_price && (
                    <span className="text-sm text-muted-foreground">{property.price_range}</span>
                  )}
                </div>
                {property.offers_discounts && (
                  <p className="text-xs text-emerald-600 font-medium">{property.offers_discounts}</p>
                )}
              </div>

              {/* Quick Stats - Compact Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {isResidential && property.bedrooms > 0 && (
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <Bed className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="text-sm font-bold">{property.bedrooms}</p>
                    <p className="text-[10px] text-muted-foreground">Beds</p>
                  </div>
                )}
                {isResidential && property.bathrooms > 0 && (
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <Bath className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="text-sm font-bold">{property.bathrooms}</p>
                    <p className="text-[10px] text-muted-foreground">Baths</p>
                  </div>
                )}
                {(property.carpet_area || property.super_area || property.area_sqft) && (
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <Square className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="text-sm font-bold">{property.carpet_area || property.super_area || property.area_sqft}</p>
                    <p className="text-[10px] text-muted-foreground">Sq.Ft</p>
                  </div>
                )}
                {property.direction_facing && (
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <Compass className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="text-sm font-bold capitalize">{property.direction_facing.split("_")[0]}</p>
                    <p className="text-[10px] text-muted-foreground">Facing</p>
                  </div>
                )}
                {property.parking_count > 0 && (
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <Car className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="text-sm font-bold">{property.parking_count}</p>
                    <p className="text-[10px] text-muted-foreground">Parking</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {(property.short_description || property.long_description) && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h2 className="text-sm font-bold mb-2 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-primary" />About
                  </h2>
                  {property.short_description && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{property.short_description}</p>
                  )}
                  {property.long_description && (
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{property.long_description}</p>
                  )}
                </div>
              )}

              {/* All Property Specifications */}
              {allSpecs.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" />Property Details
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                    {allSpecs.map((spec, idx) => (
                      <div key={idx} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0">
                        <spec.icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-muted-foreground truncate">{spec.label}</p>
                          <p className="text-xs font-medium text-foreground truncate capitalize">{spec.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RERA Information */}
              {(property.rera_registered || property.rera_id) && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                  <h2 className="text-sm font-bold mb-2 flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                    <Shield className="h-4 w-4" />RERA Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {property.rera_id && (
                      <div><span className="text-muted-foreground">RERA ID:</span> <span className="font-medium">{property.rera_id}</span></div>
                    )}
                    {property.rera_website_link && (
                      <a href={property.rera_website_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                        <ExternalLink className="h-3 w-3" />View on RERA Website
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Configurations for Builder Projects */}
              {property.configurations?.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-primary" />Configurations
                  </h2>
                  <div className="space-y-2">
                    {property.configurations.map((config: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-xs">
                        <div className="flex items-center gap-2">
                          <Bed className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium">{config.type || config.bedrooms + " BHK"}</p>
                            {config.area && <p className="text-[10px] text-muted-foreground">{config.area} sqft</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{formatPrice(config.price || config.starting_price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {property.amenities?.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-primary" />Amenities
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {property.amenities.map((amenity: string, idx: number) => {
                      const Icon = getAmenityIcon(amenity)
                      return (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                          <Icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          <span className="truncate">{amenity}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Facilities */}
              {property.facilities?.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-primary" />Facilities
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {property.facilities.map((facility: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                        <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Luxury Amenities */}
              {property.luxury_amenities?.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                    <IndianRupee className="h-4 w-4 text-amber-500" />Luxury Amenities
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {property.luxury_amenities.map((amenity: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded text-xs border border-amber-200/50">
                        <Check className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                        <span className="truncate">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Floor Plans */}
              {property.floor_plans?.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-primary" />Floor Plans
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {property.floor_plans.map((plan: string, idx: number) => (
                      <a key={idx} href={plan} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border hover:border-primary transition-colors">
                        <img src={plan || "/placeholder.svg"} alt={`Floor Plan ${idx + 1}`} className="w-full h-24 object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Master Plan */}
              {property.master_plan && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                    <Grid3X3 className="h-4 w-4 text-primary" />Master Plan
                  </h2>
                  <a href={property.master_plan} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border hover:border-primary transition-colors">
                    <img src={property.master_plan || "/placeholder.svg"} alt="Master Plan" className="w-full h-48 object-cover" />
                  </a>
                </div>
              )}

              {/* Location Map */}
              {property.google_map_link && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />Location
                  </h2>
                  <a href={property.google_map_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" />View on Google Maps
                  </a>
                </div>
              )}

              {/* Documents */}
              {property.brochure_pdf && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" />Documents
                  </h2>
                  <a href={property.brochure_pdf} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors">
                    <FileText className="h-4 w-4" />Download Brochure
                  </a>
                </div>
              )}

              {/* Developer Info */}
              {developer && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-primary" />Developer
                  </h2>
                  <div className="flex items-start gap-3">
                    {developer.logo_url && (
                      <img src={developer.logo_url || "/placeholder.svg"} alt={developer.name} className="h-12 w-12 object-contain rounded border bg-white p-1" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{developer.name}</p>
                      {developer.project_count && <p className="text-[10px] text-muted-foreground">{developer.project_count} Projects</p>}
                      {developer.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{developer.description}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Contact Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                {/* Price Card */}
                <div className="bg-primary text-primary-foreground rounded-lg p-4">
                  <p className="text-xs opacity-80 mb-0.5">Starting from</p>
                  <p className="text-2xl font-bold mb-2">{property.lowest_price ? `₹${formatPrice(property.lowest_price)}` : "Contact Us"}</p>
                  {property.booking_amount > 0 && (
                    <p className="text-xs opacity-90">Booking: ₹{formatPrice(property.booking_amount)}</p>
                  )}
                </div>

                {/* Contact Form */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-bold text-sm mb-3">Get Details</h3>
                  <form className="space-y-2.5">
                    <input type="text" placeholder="Name" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                    <input type="tel" placeholder="Phone" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                    <input type="email" placeholder="Email" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                    <Button className="w-full h-9 text-xs">
                      <Phone className="h-3.5 w-3.5 mr-1.5" />Request Callback
                    </Button>
                  </form>
                </div>

                {/* Quick Contact */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <a href="tel:+919876543210" className="flex items-center gap-2 text-xs hover:text-primary">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="font-medium">+91 98765 43210</span>
                  </a>
                  <a href="mailto:info@countryroof.com" className="flex items-center gap-2 text-xs hover:text-primary">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="font-medium">info@countryroof.com</span>
                  </a>
                </div>

                <Button variant="outline" size="sm" className="w-full bg-transparent text-xs">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />Schedule Visit
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Gallery */}
        {showFullscreen && (
          <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            <button onClick={() => setShowFullscreen(false)} className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-10">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <img src={images[activeImage] || "/placeholder.svg"} alt={property.property_name} className="max-h-[90vh] max-w-[90vw] object-contain" />
            <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white">
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white text-xs">{activeImage + 1} / {images.length}</div>
          </div>
        )}
      </main>
    </>
  )
}
