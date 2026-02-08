import { connectToDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import type { HomepageSection } from "@/lib/schemas"

export async function GET() {
  try {
    console.log("[v0] Fetching sections - GET /api/admin/homepage-sections")
    
    const user = await getCurrentUser()
    console.log("[v0] User authenticated:", user ? `${user.email}` : "No")
    
    if (!user || user.user_type !== "admin") {
      console.log("[v0] User not admin, rejecting request")
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    console.log("[v0] Database connected successfully")
    
    const sections = await db
      .collection<HomepageSection>("homepage_sections")
      .find({})
      .sort({ sort_order: 1 })
      .toArray()
    
    console.log("[v0] Fetched sections count:", sections.length)
    if (sections.length > 0) {
      console.log("[v0] First 3 sections:", sections.slice(0, 3).map(s => ({ 
        _id: s._id?.toString(), 
        title: s.title,
        section_type: s.section_type 
      })))
    } else {
      console.log("[v0] WARNING: No sections found in database!")
    }
    
    return Response.json(sections)
  } catch (error) {
    console.error("[v0] Error fetching sections:", error)
    return Response.json({ error: "Failed to fetch sections", details: String(error) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const section: HomepageSection = await req.json()
    section.created_at = new Date()
    section.updated_at = new Date()
    const result = await db.collection<HomepageSection>("homepage_sections").insertOne(section)
    return Response.json({ _id: result.insertedId, ...section }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating section:", error)
    return Response.json({ error: "Failed to create section" }, { status: 500 })
  }
}
