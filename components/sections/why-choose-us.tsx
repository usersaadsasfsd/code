import { Shield, Award, Users, TrendingUp, Clock, HeadphonesIcon } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "100% Verified Listings",
    description: "Every property is thoroughly verified and authenticated by our expert team",
  },
  {
    icon: Award,
    title: "Award-Winning Service",
    description: "Recognized as India's most trusted real estate platform in 2024",
  },
  {
    icon: Users,
    title: "Expert Guidance",
    description: "Connect with certified agents and property consultants",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description: "Access real-time market trends and property valuations",
  },
  {
    icon: Clock,
    title: "Quick Transactions",
    description: "Streamlined process with digital documentation and support",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Our customer support team is always ready to help you",
  },
]

export default function WhyChooseUs() {
  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-primary/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-primary mb-4">Why Choose CountryRoof</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            India's most trusted real estate platform with unmatched service and support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 hover:bg-primary hover:scale-110 transition-all">
                  <Icon className="text-primary hover:text-white transition-colors" size={28} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
