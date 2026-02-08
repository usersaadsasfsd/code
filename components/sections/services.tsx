import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const services = [
  {
    title: "Roof Installation",
    description: "Professional installation of new roofing systems using premium materials.",
    icon: "🏗️",
  },
  {
    title: "Roof Repair",
    description: "Expert repair services for all roof types and damage conditions.",
    icon: "🔧",
  },
  {
    title: "Maintenance Plans",
    description: "Regular maintenance to extend roof life and prevent costly repairs.",
    icon: "📋",
  },
  {
    title: "Emergency Services",
    description: "24/7 emergency response for storm damage and urgent repairs.",
    icon: "🚨",
  },
  {
    title: "Inspections",
    description: "Comprehensive roof inspections with detailed reports.",
    icon: "🔍",
  },
  {
    title: "Consultations",
    description: "Free expert consultations to assess your roofing needs.",
    icon: "💬",
  },
]

export default function Services() {
  return (
    <section id="services" className="w-full py-12 md:py-16 px-4 bg-muted/30">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        <div className="space-y-2">
          <h2 className="text-foreground">Our Services</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Comprehensive roofing solutions tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((service, index) => (
            <Card key={index} className="border border-border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{service.title}</CardTitle>
                  </div>
                  <span className="text-lg">{service.icon}</span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs leading-relaxed">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
