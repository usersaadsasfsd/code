import Link from "next/link"
import { MapPin, Bed, Bath, Maximize2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatPriceRange } from "@/lib/utils"

interface PropertyCardProps {
  property: {
    _id: string
    slug?: string
    property_name: string
    main_thumbnail: string
    lowest_price: number
    max_price?: number
    price_range?: string
    bedrooms: number
    bathrooms: number
    area_sqft: number
    address: string
    city: string
    state: string
    is_featured?: boolean
    is_hot?: boolean
  }
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const imageUrl = property.main_thumbnail || "/placeholder.jpg"
  
  // Use price_range if available, otherwise format from lowest/max price
  const priceDisplay = property.price_range || formatPriceRange(property.lowest_price, property.max_price)
  
  return (
    <Link href={`/properties/${property.slug || property._id}`}>
      <div className="bento-card hover:shadow-lg cursor-pointer">
        {/* Image with badges */}
        <div className="relative mb-2.5 overflow-hidden rounded bg-muted h-40 hover:shadow-md transition-shadow">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={property.property_name || "Property"}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.jpg"
            }}
          />
          <div className="absolute top-2 left-2 flex gap-1.5">
            {property.is_featured && <Badge className="text-xs bg-primary">Featured</Badge>}
            {property.is_hot && (
              <Badge variant="destructive" className="text-xs">
                Hot
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h3 className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors">
            {property.property_name || "Property"}
          </h3>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={12} />
            <span className="line-clamp-1">
              {property.address || "Location"}, {property.city || ""}
            </span>
          </div>

          {/* Specs - High-density micro-format */}
          <div className="flex gap-2 text-xs text-muted-foreground border-t border-border/30 pt-1.5">
            <div className="flex items-center gap-0.5 optical-divider">
              <Bed size={12} />
              <span>{property.bedrooms || 0}</span>
            </div>
            <div className="flex items-center gap-0.5 optical-divider">
              <Bath size={12} />
              <span>{property.bathrooms || 0}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Maximize2 size={12} />
              <span>{property.area_sqft || 0}</span>
            </div>
          </div>

          {/* Price */}
          <div className="pt-1.5 border-t border-border/30">
            <p className="font-bold text-sm text-primary">
              {priceDisplay}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
