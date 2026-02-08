"use client"

import { useState } from "react"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "Property Investor",
    location: "Gurgaon",
    rating: 5,
    image: "/indian-businessman-portrait.png",
    text: "CountryRoof helped me find the perfect commercial space for my business. Their team was professional, responsive, and made the entire process seamless. Highly recommended!",
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Homebuyer",
    location: "Delhi NCR",
    rating: 5,
    image: "/indian-businesswoman-portrait.png",
    text: "Finding my dream home seemed impossible until I discovered CountryRoof. The platform made it easy to browse verified listings and connect with trusted agents. I couldn't be happier!",
  },
  {
    id: 3,
    name: "Amit Patel",
    role: "Real Estate Developer",
    location: "Noida",
    rating: 5,
    image: "/professional-indian-business-executive-portrait.jpg",
    text: "As a developer, CountryRoof has been invaluable for showcasing our premium projects. The exposure and quality of leads we receive is exceptional. A true game-changer for our business.",
  },
]

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const current = testimonials[currentIndex]

  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-muted via-background to-muted">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">What Our Clients Say</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Hear from thousands of satisfied clients who found their perfect property with CountryRoof
          </p>
        </div>

        <div className="relative bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
          <Quote className="absolute top-8 left-8 text-[#002366]/10" size={64} />

          <div className="relative space-y-8">
            <div className="flex items-center gap-6">
              <img
                src={current.image || "/placeholder.svg"}
                alt={current.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-[#002366]/10"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground">{current.name}</h3>
                <p className="text-muted-foreground">{current.role}</p>
                <p className="text-sm text-muted-foreground">{current.location}</p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: current.rating }).map((_, i) => (
                  <Star key={i} size={20} className="fill-[#002366] text-[#002366]" />
                ))}
              </div>
            </div>

            <p className="text-lg md:text-xl leading-relaxed text-foreground/90 italic">"{current.text}"</p>

            <div className="flex items-center justify-between pt-4">
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex ? "w-8 bg-[#002366]" : "w-2 bg-border"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevTestimonial}
                  className="rounded-full border-2 hover:bg-[#002366] hover:text-white hover:border-[#002366] bg-transparent"
                >
                  <ChevronLeft size={20} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextTestimonial}
                  className="rounded-full border-2 hover:bg-[#002366] hover:text-white hover:border-[#002366] bg-transparent"
                >
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
