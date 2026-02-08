import type { Metadata } from "next"
import { Building2, Users, Shield, Award, Search, Eye, Scale, FileCheck, Handshake, CheckCircle2 } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "About CountryRoof | Premium Real Estate Company",
  description:
    "Country Roof - Where Quality Meets Durability. Established in 2021, we specialize in bringing together buyers and sellers in the residential real estate market.",
  openGraph: {
    title: "About CountryRoof | Premium Real Estate Company",
    description: "Protecting Your Property, Enhancing Your Investment. Trust Country Roof for your next home purchase.",
    url: "https://countryroof.com/about",
  },
}

const services = [
  {
    icon: Search,
    title: "Property Search",
    description: "Assisting clients in finding houses that meet their needs and budgets with access to exclusive listings not available on open portals."
  },
  {
    icon: Eye,
    title: "Property Viewing",
    description: "Setting up property viewings with detailed information about neighborhoods, amenities, and local schools."
  },
  {
    icon: Scale,
    title: "Negotiation Support",
    description: "Serving as a mediator between buyers and sellers to negotiate the best terms for our clients."
  },
  {
    icon: FileCheck,
    title: "Legal & Financial Support",
    description: "Connecting clients with attorneys, mortgage brokers, and accountants while providing guidance throughout the process."
  },
  {
    icon: Handshake,
    title: "Closing the Deal",
    description: "Ensuring all legal requirements are satisfied and assisting with completing required documentation for property ownership transfer."
  }
]

const values = [
  { icon: Shield, label: "Honesty" },
  { icon: Award, label: "Integrity" },
  { icon: CheckCircle2, label: "Transparency" },
  { icon: Users, label: "Professionalism" },
]

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 px-4 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="space-y-4 text-center">
              <p className="text-primary font-semibold text-sm tracking-wider uppercase">We are</p>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground">CountryRoof</h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
                Secure your property's future with Country Roof - Where Quality Meets Durability
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="w-full py-12 md:py-16 px-4 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Building2 className="h-3.5 w-3.5" />
                  Established 2021
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">Protecting Your Property, Enhancing Your Investment</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  At Country Roof, we take great pride in assisting customers in finding the homes of their dreams. As a top real estate company, we specialize in bringing together buyers and sellers in the residential real estate market.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Country Roof has grown to be one of the most reputable brands in the real estate sector. We prioritize meeting or exceeding client expectations and fostering enduring connections with them.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { stat: "2021", label: "Established" },
                  { stat: "500+", label: "Happy Clients" },
                  { stat: "100+", label: "Properties" },
                  { stat: "50+", label: "Projects" },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-card border border-border rounded-lg text-center hover:border-primary/30 transition-colors">
                    <p className="text-2xl md:text-3xl font-bold text-primary">{item.stat}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section className="w-full py-12 md:py-16 px-4 bg-muted/30 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="sticky top-24 space-y-3">
                  <p className="text-xs font-medium text-primary uppercase tracking-wider">Our Founder</p>
                  <h2 className="text-xl md:text-2xl font-bold">Mr. Dharampal Chaudhary</h2>
                  <p className="text-xs text-muted-foreground">Founder - Country Roof | Chairman - Rite Group</p>
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Mr. Dharampal Chaudhary is a renowned entrepreneur who has excelled in various fields, including real estate development, politics, education, and social work. He is the founder of Country Roof and the chairman of Rite Group, which has established itself as a leading real estate company under his visionary leadership.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Through Rite Group, Mr. Chaudhary has developed high-quality residential and commercial spaces catering to clients' diverse needs. He has also established Rite Real Estate Pvt. Ltd. to provide value-based solutions to clients in various fields.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Mr. Chaudhary's passion for preserving and promoting Indian culture is evident through establishing Rite Hospitality Pvt. Ltd., an e-commerce food delivery company that offers authentic Indian delicacies. This venture showcases his willingness to explore new opportunities while promoting Indian culture.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  In addition to his successful real estate and hospitality ventures, Mr. Chaudhary is dedicated to social reform through education and empowerment. As the founder trustee of Rite Group, he has facilitated the creation of innovative educational programs and services that have positively impacted individuals and organizations.
                </p>
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground italic">
                    "Together, they sowed the seed of the Country Roof. Combining both expertise, the team country roof comprehends the process of buying or selling a house simple and stress-free experience."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Country Roof */}
        <section className="w-full py-12 md:py-16 px-4 border-b border-border">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold">Why Country Roof?</h2>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                With a team of experienced professionals who provide exceptional services to enhance your investment.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 bg-card border border-border rounded-lg space-y-3">
                <h3 className="text-base font-semibold">What Sets Us Apart</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our commitment to customer satisfaction, competitive pricing, and expertise in the Real Estate makes Country Roof the clear choice for all your Real Estate needs.
                </p>
              </div>
              <div className="p-5 bg-card border border-border rounded-lg space-y-3">
                <h3 className="text-base font-semibold">Our Commitment</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We are here to support you in achieving your real estate objectives, whether you're a first-time buyer or a seasoned investor. Our team is always growing and learning to keep up with the ever-changing market.
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="flex flex-wrap justify-center gap-3">
              {values.map((value, idx) => (
                <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full">
                  <value.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{value.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="w-full py-12 md:py-16 px-4 bg-muted/30 border-b border-border">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold">What Does Country Roof Offer?</h2>
              <p className="text-sm text-muted-foreground">Comprehensive real estate services for all your needs</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service, idx) => (
                <div key={idx} className="group p-4 bg-card border border-border rounded-lg hover:border-primary/30 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <service.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="text-sm font-semibold">{service.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Trust Country Roof for Your Next Home Purchase</h2>
            <p className="text-sm text-muted-foreground">
              Ready to find your dream property? Let our experienced team guide you through every step of the journey.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <a href="/properties" className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                Browse Properties
              </a>
              <a href="/contact" className="inline-flex items-center justify-center px-5 py-2.5 bg-transparent border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
