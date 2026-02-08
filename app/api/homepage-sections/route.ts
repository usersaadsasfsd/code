import { connectToDatabase } from "@/lib/mongodb"
import type { HomepageSection } from "@/lib/schemas"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const sections = await db
      .collection<HomepageSection>("homepage_sections")
      .find({ is_active: true })
      .sort({ sort_order: 1 })
      .toArray()

    return Response.json(sections)
  } catch (error) {
    console.error("[v0] Error fetching sections:", error)
    return Response.json({ error: "Failed to fetch sections" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
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
