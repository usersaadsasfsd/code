import type { Metadata } from "next"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Roofing Services | CountryRoof",
  description:
    "Explore our comprehensive roofing services including installation, repair, maintenance, and emergency services.",
  openGraph: {
    title: "Roofing Services | CountryRoof",
    description: "Comprehensive roofing solutions for residential and commercial properties.",
    url: "https://countryroof.com/services",
  },
}

const serviceDetails = [
  {
    id: "installation",
    title: "Roof Installation",
    description: "Professional installation of new roofing systems",
    image: "🏗️",
    details: [
      "New construction roofing",
      "Full roof replacement",
      "Premium material selection",
      "Warranty coverage included",
    ],
    price: "Starting at $5,000",
  },
  {
    id: "repair",
    title: "Roof Repair",
    description: "Expert repair services for all roof types",
    image: "🔧",
    details: ["Leak detection and repair", "Storm damage restoration", "Flashing repair", "Fast response times"],
    price: "Starting at $500",
  },
  {
    id: "maintenance",
    title: "Maintenance Plans",
    description: "Regular maintenance to extend roof life",
    image: "📋",
    details: ["Quarterly inspections", "Debris removal", "Preventive repairs", "Extended roof life"],
    price: "Starting at $199/year",
  },
  {
    id: "emergency",
    title: "Emergency Services",
    description: "24/7 emergency response available",
    image: "🚨",
    details: [
      "Same-day response",
      "Storm damage assistance",
      "Tarping and temporary repairs",
      "Insurance coordination",
    ],
    price: "Call for quote",
  },
  {
    id: "inspection",
    title: "Roof Inspections",
    description: "Comprehensive roof assessments",
    image: "🔍",
    details: ["Detailed inspection report", "Photography included", "Recommendations provided", "Free for estimates"],
    price: "Starting at $250",
  },
  {
    id: "consultation",
    title: "Expert Consultations",
    description: "Free guidance on roofing needs",
    image: "💬",
    details: ["Material recommendations", "Budget planning", "Timeline discussions", "No obligation quotes"],
    price: "FREE",
  },
]

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="w-full py-12 md:py-16 px-4 bg-primary/5 border-b border-border">
          <div className="max-w-4xl mx-auto space-y-3">
            <h1 className="text-primary">Our Roofing Services</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
              Comprehensive roofing solutions tailored to your specific needs. From new installations to emergency
              repairs, we've got you covered.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="w-full py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {serviceDetails.map((service) => (
                <div
                  key={service.id}
                  className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <div className="p-4 md:p-6 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg md:text-xl font-semibold text-foreground">{service.title}</h2>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">{service.description}</p>
                      </div>
                      <span className="text-3xl flex-shrink-0">{service.image}</span>
                    </div>

                    <ul className="grid grid-cols-2 gap-2">
                      {service.details.map((detail, idx) => (
                        <li key={idx} className="text-xs flex items-start gap-2">
                          <span className="text-primary mt-0.5">→</span>
                          <span className="text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <p className="text-sm font-semibold text-primary">{service.price}</p>
                      <Button asChild variant="outline" size="sm" className="text-xs h-8 bg-transparent">
                        <Link href="#contact">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-12 md:py-16 px-4 bg-primary/5 border-t border-border">
          <div className="max-w-2xl mx-auto space-y-4 text-center">
            <h2>Ready to Get Started?</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Contact us today for a free consultation and quote
            </p>
            <Button asChild className="text-sm h-9">
              <Link href="#contact">Request Free Quote</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
