import Link from "next/link"
import { Building2, Home, MapPin, Crown } from "lucide-react"

const propertyTypes = [
  {
    title: "Residential Properties",
    description: "Apartments, Villas, Independent Houses",
    icon: Home,
    count: "3500+",
    image: "/modern-residential-apartment.png",
    link: "/properties?category=residential",
  },
  {
    title: "Commercial Spaces",
    description: "Offices, Retail, Co-working Spaces",
    icon: Building2,
    count: "850+",
    image: "/modern-office-building.png",
    link: "/properties?category=commercial",
  },
  {
    title: "Luxury Properties",
    description: "Premium Penthouses & Villas",
    icon: Crown,
    count: "620+",
    image: "/luxury-penthouse-interior.png",
    link: "/properties?category=luxury",
  },
  {
    title: "Plots & Land",
    description: "Residential & Commercial Plots",
    icon: MapPin,
    count: "450+",
    image: "/land-plot-aerial-view.jpg",
    link: "/properties?category=plots",
  },
]

export default function PropertyTypes() {
  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-primary mb-4">Explore Property Types</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find the perfect property that matches your lifestyle and investment goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {propertyTypes.map((type) => {
            const Icon = type.icon
            return (
              <Link
                key={type.title}
                href={type.link}
                className="relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={type.image || "/placeholder.svg"}
                    alt={type.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={24} />
                      <span className="text-sm font-medium">{type.count} Listings</span>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{type.title}</h3>
                    <p className="text-white/90 text-sm">{type.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
