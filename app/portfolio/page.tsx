import type { Metadata } from "next"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Portfolio | CountryRoof",
  description: "View our completed roofing projects showcasing quality craftsmanship and customer satisfaction.",
  openGraph: {
    title: "Portfolio | CountryRoof",
    description: "Completed roofing projects that showcase our expertise and quality work.",
    url: "https://countryroof.com/portfolio",
  },
}

const portfolioProjects = [
  {
    id: 1,
    title: "Modern Residential Roof",
    category: "Installation",
    location: "Downtown Area",
    year: 2024,
    description: "Complete roof replacement with premium asphalt shingles",
    beforeAfter: "Before/After Available",
    rating: 5,
  },
  {
    id: 2,
    title: "Commercial Building Restoration",
    category: "Repair",
    location: "Business District",
    year: 2024,
    description: "Large-scale commercial roof restoration and reinforcement",
    beforeAfter: "Before/After Available",
    rating: 5,
  },
  {
    id: 3,
    title: "Emergency Storm Damage",
    category: "Emergency",
    location: "Suburban Area",
    year: 2023,
    description: "Rapid emergency response and damage restoration",
    beforeAfter: "Before/After Available",
    rating: 5,
  },
  {
    id: 4,
    title: "Metal Roof Installation",
    category: "Installation",
    location: "Rural Property",
    year: 2023,
    description: "Custom metal roofing system for durability",
    beforeAfter: "Before/After Available",
    rating: 5,
  },
  {
    id: 5,
    title: "Warehouse Roof System",
    category: "Installation",
    location: "Industrial Zone",
    year: 2023,
    description: "Large industrial roof installation with energy-efficient materials",
    beforeAfter: "Before/After Available",
    rating: 5,
  },
  {
    id: 6,
    title: "Historic Building Preservation",
    category: "Repair",
    location: "Historic District",
    year: 2023,
    description: "Specialized repair maintaining historical integrity",
    beforeAfter: "Before/After Available",
    rating: 5,
  },
]

const categories = [
  { name: "All", count: 6 },
  { name: "Installation", count: 3 },
  { name: "Repair", count: 2 },
  { name: "Emergency", count: 1 },
]

export default function PortfolioPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="w-full py-12 md:py-16 px-4 bg-primary/5 border-b border-border">
          <div className="max-w-4xl mx-auto space-y-3">
            <h1 className="text-primary">Our Portfolio</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
              Explore our recent projects showcasing quality craftsmanship and satisfied customers across residential,
              commercial, and industrial sectors.
            </p>
          </div>
        </section>

        {/* Filter */}
        <section className="w-full py-6 px-4 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  className="px-3 py-1.5 text-xs font-medium whitespace-nowrap border border-border rounded hover:border-primary hover:text-primary transition-colors"
                >
                  {cat.name} <span className="text-muted-foreground">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="w-full py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolioProjects.map((project) => (
                <Card
                  key={project.id}
                  className="border border-border overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative overflow-hidden">
                    <div className="text-5xl opacity-20 hover:opacity-30 transition-opacity">
                      {project.category === "Installation" && "🏗️"}
                      {project.category === "Repair" && "🔧"}
                      {project.category === "Emergency" && "🚨"}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{project.title}</CardTitle>
                        <CardDescription className="text-xs mt-1">{project.location}</CardDescription>
                      </div>
                      <span className="text-xs font-semibold text-primary whitespace-nowrap">{project.year}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">{project.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">{project.category}</span>
                      <div className="flex gap-0.5">
                        {[...Array(project.rating)].map((_, i) => (
                          <span key={i} className="text-xs">
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 md:py-16 px-4 bg-muted/30 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1 text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary">500+</p>
                <p className="text-xs md:text-sm text-muted-foreground">Projects Completed</p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary">4.9/5</p>
                <p className="text-xs md:text-sm text-muted-foreground">Average Rating</p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary">20+</p>
                <p className="text-xs md:text-sm text-muted-foreground">Years in Business</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
