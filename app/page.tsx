import { Suspense } from "react"
import BannerSlider from "@/components/sections/banner-slider"
import AdvancedSearch from "@/components/sections/advanced-search"
import PromoBanners from "@/components/sections/promo-banners"
import FeaturedVideoProperties from "@/components/sections/featured-video-properties"
import CTA from "@/components/sections/cta"
import DynamicSections from "@/components/sections/dynamic-sections"
import WhyChooseUs from "@/components/sections/why-choose-us"
import TrendingLocations from "@/components/sections/trending-locations"
import FeaturedDevelopers from "@/components/sections/featured-developers"

export default function Home() {
  return (
    <Suspense fallback={null}>
      <BannerSlider />
      <AdvancedSearch />
      <FeaturedVideoProperties />
      <TrendingLocations />
      <DynamicSections />
      <FeaturedDevelopers />
      <WhyChooseUs />
      <CTA />
    </Suspense>
  )
}
