import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Phone } from "lucide-react"

export default function CTA() {
  return (
    <section className="relative w-full py-20 md:py-28 px-4 md:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src="/modern-city-skyline.png" alt="CTA Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/90" />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-white text-balance">Ready to Find Your Dream Property?</h2>
        <p className="text-white/90 text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto">
          Join 50,000+ satisfied customers who found their perfect home with CountryRoof
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 h-14 px-8 text-base font-semibold"
          >
            <Link href="/properties">
              Explore Properties
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-transparent text-white border-white hover:bg-white/10 h-14 px-8 text-base font-semibold"
          >
            <Link href="/contact">
              <Phone className="mr-2" size={20} />
              Talk to Expert
            </Link>
          </Button>
        </div>

        <div className="pt-8 flex items-center justify-center gap-8 text-white/90 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>No Brokerage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>Verified Properties</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>Expert Support</span>
          </div>
        </div>
      </div>
    </section>
  )
}
