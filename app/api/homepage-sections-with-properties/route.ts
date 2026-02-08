import { getDatabase } from "@/lib/mongodb"
import type { HomepageSection } from "@/lib/schemas"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const db = await getDatabase()

    const sections = await db
      .collection<HomepageSection>("homepage_sections")
      .find({ is_active: true })
      .sort({ sort_order: 1 })
      .toArray()

    // Fetch properties for each section
    const sectionsWithProperties = await Promise.all(
      sections.map(async (section) => {
        let properties = []

        if (section.property_ids && section.property_ids.length > 0) {
          try {
            properties = await db
              .collection("properties")
              .find({
                _id: { $in: section.property_ids.map((id) => new ObjectId(id)) },
                status: "active"
              })
              .limit(section.display_limit)
              .toArray()
          } catch (error) {
            console.warn(`[v0] Failed to fetch properties for section ${section._id}:`, error)
          }
        }

        return {
          ...section,
          properties: properties.map(prop => ({
            ...prop,
            slug: prop.slug || prop._id.toString()
          })),
        }
      }),
    )

    return Response.json(sectionsWithProperties)
  } catch (error) {
    console.error("[v0] Error fetching sections with properties:", error)
    return Response.json({ error: "Failed to fetch sections" }, { status: 500 })
  }
}
