import { Button } from "@/components/ui/button"
import { Search, MapPin, Home, TrendingUp } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative w-full h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src="/home-banner-1.png" alt="Premium Properties" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#002366]/95 via-[#002366]/85 to-transparent" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="max-w-4xl space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-md rounded-full border border-white/30">
              <TrendingUp size={18} className="text-white" />
              <span className="text-white text-sm font-semibold tracking-wide">#1 Real Estate Platform in NCR</span>
            </div>

            <h1 className="text-white text-balance text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Discover Your Dream Property in India
            </h1>

            <p className="text-white/95 text-xl md:text-2xl leading-relaxed max-w-3xl font-light">
              Explore premium residential and commercial properties across Delhi NCR, Gurgaon, and beyond. Your perfect
              home awaits.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 space-y-5">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Enter location (e.g., Gurgaon, Delhi)"
                  className="w-full pl-14 pr-5 py-4 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002366] focus:border-transparent text-base"
                />
              </div>

              <div className="flex-1 relative">
                <Home className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <select className="w-full pl-14 pr-5 py-4 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002366] focus:border-transparent text-base appearance-none bg-white">
                  <option>All Property Types</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Plots</option>
                  <option>Luxury</option>
                </select>
              </div>

              <Button
                size="lg"
                className="md:w-auto w-full bg-[#002366] hover:bg-[#003388] h-14 text-base font-semibold rounded-xl"
              >
                <Search size={20} className="mr-2" />
                Search Properties
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-6">
            <div className="text-white space-y-2">
              <p className="text-4xl md:text-5xl font-bold">5000+</p>
              <p className="text-white/90 text-sm md:text-base font-medium">Premium Properties</p>
            </div>
            <div className="text-white space-y-2">
              <p className="text-4xl md:text-5xl font-bold">1200+</p>
              <p className="text-white/90 text-sm md:text-base font-medium">Verified Agents</p>
            </div>
            <div className="text-white space-y-2">
              <p className="text-4xl md:text-5xl font-bold">98%</p>
              <p className="text-white/90 text-sm md:text-base font-medium">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
