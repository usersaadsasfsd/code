import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, Bed, Bath, Square } from "lucide-react"

const luxuryProperties = [
  {
    id: 1,
    title: "Penthouse Paradise",
    location: "Golf Course Road, Gurgaon",
    price: "₹12.5 Cr",
    beds: 5,
    baths: 6,
    area: "5,200 sq.ft",
    image: "/luxury-penthouse-interior-modern-design.jpg",
    featured: true,
  },
  {
    id: 2,
    title: "Modern Villa Estate",
    location: "DLF Phase 5, Gurgaon",
    price: "₹8.2 Cr",
    beds: 4,
    baths: 5,
    area: "4,500 sq.ft",
    image: "/modern-luxury-villa-exterior-pool.jpg",
  },
  {
    id: 3,
    title: "Executive Suite",
    location: "Cyber City, Gurgaon",
    price: "₹3.8 Cr",
    beds: 3,
    baths: 4,
    area: "2,800 sq.ft",
    image: "/executive-apartment-interior-luxury.jpg",
  },
]

export default function LuxuryShowcase() {
  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">Exclusive Luxury Collection</h2>
            <p className="text-muted-foreground text-lg">Handpicked properties that redefine luxury living</p>
          </div>
          <Button asChild variant="link" className="text-[#002366] hidden md:flex">
            <Link href="/properties?category=luxury">
              View All Luxury
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Featured Large Property */}
          <div className="md:row-span-2 relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="relative h-full min-h-[600px]">
              <img
                src={luxuryProperties[0].image || "/placeholder.svg"}
                alt={luxuryProperties[0].title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-8 text-white space-y-4">
                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
                  FEATURED
                </div>
                <h3 className="text-3xl font-bold">{luxuryProperties[0].title}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin size={16} />
                  <span className="text-sm">{luxuryProperties[0].location}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Bed size={18} />
                    <span>{luxuryProperties[0].beds} Beds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath size={18} />
                    <span>{luxuryProperties[0].baths} Baths</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square size={18} />
                    <span>{luxuryProperties[0].area}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <p className="text-2xl font-bold">{luxuryProperties[0].price}</p>
                  <Button className="bg-white text-[#002366] hover:bg-white/90">View Details</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Two smaller properties */}
          {luxuryProperties.slice(1).map((property) => (
            <div
              key={property.id}
              className="relative overflow-hidden rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500"
            >
              <div className="relative h-full min-h-[290px]">
                <img
                  src={property.image || "/placeholder.svg"}
                  alt={property.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-3">
                  <h3 className="text-xl font-bold">{property.title}</h3>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <MapPin size={14} />
                    <span>{property.location}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Bed size={16} />
                      <span>{property.beds}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bath size={16} />
                      <span>{property.baths}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Square size={16} />
                      <span>{property.area}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/20">
                    <p className="text-xl font-bold">{property.price}</p>
                    <Button size="sm" className="bg-white text-[#002366] hover:bg-white/90 text-xs">
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8 md:hidden">
          <Button asChild variant="outline" className="text-[#002366] border-2 bg-transparent">
            <Link href="/properties?category=luxury">
              View All Luxury Properties
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
