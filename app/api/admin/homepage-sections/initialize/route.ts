import { connectToDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import type { HomepageSection } from "@/lib/schemas"

const PREDEFINED_SECTIONS = [
  {
    name: "Handpicked Selections",
    section_type: "handpicked",
    title: "Countryroof's Handpicked Selections",
    subtitle: "Curated properties selected just for you",
    display_limit: 4,
    sort_order: 1,
  },
  {
    name: "Trending Tabs",
    section_type: "trending_tabs",
    title: "High-Demand Real Estate in Delhi NCR & Gurgaon",
    subtitle: "Most sought-after properties in the region",
    display_limit: 32,
    sort_order: 2,
  },
  {
    name: "New Launches",
    section_type: "new_launches",
    title: "Fresh Arrivals: Latest Gurgaon Developments",
    subtitle: "Be the first to explore new projects",
    display_limit: 4,
    sort_order: 3,
  },
  {
    name: "Luxury",
    section_type: "luxury",
    title: "Elite Residences & Premium Penthouses",
    subtitle: "Experience luxury living at its finest",
    display_limit: 4,
    sort_order: 4,
  },
  {
    name: "Developers",
    section_type: "developers",
    title: "Premier Residential & Business Hubs",
    subtitle: "Projects from top developers",
    display_limit: 3,
    sort_order: 5,
  },
  {
    name: "Affordable",
    section_type: "affordable",
    title: "Value-Driven Housing in Gurugram",
    subtitle: "Quality homes within your budget",
    display_limit: 4,
    sort_order: 6,
  },
  {
    name: "SCO",
    section_type: "sco",
    title: "Prime SCO Plots & Commercial Land",
    subtitle: "Investment opportunities in commercial spaces",
    display_limit: 4,
    sort_order: 7,
  },
  {
    name: "Iconic",
    section_type: "iconic",
    title: "Iconic Living in the Center of Gurugram",
    subtitle: "Landmark properties in prime locations",
    display_limit: 8,
    sort_order: 8,
  },
  {
    name: "Plots",
    section_type: "plots",
    title: "Affordable Residential & Investment Plots",
    subtitle: "Build your dream home on your own land",
    display_limit: 4,
    sort_order: 9,
  },
  {
    name: "Commercial",
    section_type: "commercial",
    title: "Top-Tier Commercial Ventures in NCR",
    subtitle: "Premium spaces for your business",
    display_limit: 4,
    sort_order: 10,
  },
  {
    name: "Spotlight Projects",
    section_type: "spotlight",
    title: "Our Signature Spotlight Projects",
    subtitle: "Featured properties with exceptional value",
    display_limit: 3,
    sort_order: 11,
  },
  {
    name: "Investment",
    section_type: "investment",
    title: "High-Growth Investment Corridors",
    subtitle: "Properties with excellent appreciation potential",
    display_limit: 4,
    sort_order: 12,
  },
  {
    name: "Budget",
    section_type: "budget",
    title: "Budget-Friendly Living in Gurgaon",
    subtitle: "Affordable options for first-time buyers",
    display_limit: 4,
    sort_order: 13,
  },
  {
    name: "Builders",
    section_type: "builders",
    title: "Leading Builders & Industry Pioneers",
    subtitle: "Trusted names in real estate development",
    display_limit: 12,
    sort_order: 14,
  },
]

export async function POST() {
  try {
    console.log("[v0] Initialize request started")
    
    const user = await getCurrentUser()
    console.log("[v0] User check:", user ? `${user.email} (${user.user_type})` : "Not authenticated")
    
    if (!user || user.user_type !== "admin") {
      console.log("[v0] Unauthorized - not admin")
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Connecting to database...")
    const { db } = await connectToDatabase()
    const collection = db.collection<HomepageSection>("homepage_sections")

    // Check if sections already exist
    console.log("[v0] Checking for existing sections...")
    const existingCount = await collection.countDocuments({})
    console.log(`[v0] Existing sections count: ${existingCount}`)
    
    if (existingCount > 0) {
      console.log(`[v0] Sections already initialized (${existingCount} sections exist)`)
      return Response.json({ 
        success: true, 
        count: 0,
        message: "Sections already initialized"
      })
    }

    const now = new Date()
    const sections: HomepageSection[] = PREDEFINED_SECTIONS.map((s) => ({
      name: s.name,
      section_type: s.section_type as HomepageSection["section_type"],
      title: s.title,
      subtitle: s.subtitle,
      display_limit: s.display_limit,
      sort_order: s.sort_order,
      is_active: true,
      property_ids: [],
      created_at: now,
      updated_at: now,
    }))

    console.log(`[v0] Attempting to insert ${sections.length} sections...`)
    // Insert new sections
    const insertResult = await collection.insertMany(sections)
    const insertedCount = Object.keys(insertResult.insertedIds).length
    
    console.log(`[v0] Successfully initialized ${insertedCount} sections`)
    console.log(`[v0] Inserted IDs:`, Object.values(insertResult.insertedIds).map(id => id.toString()))

    return Response.json({ 
      success: true, 
      count: insertedCount,
      ids: Object.values(insertResult.insertedIds).map(id => id.toString())
    })
  } catch (error) {
    console.error("[v0] Error initializing sections:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return Response.json({ error: "Failed to initialize sections", details: errorMessage }, { status: 500 })
  }
}
