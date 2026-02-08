import { connectToDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import type { HomepageSection } from "@/lib/schemas"
import { ObjectId } from "mongodb"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { db } = await connectToDatabase()
    const { propertyId } = await req.json()

    const section = await db.collection<HomepageSection>("homepage_sections").findOne({ _id: new ObjectId(id) })

    if (!section) {
      return Response.json({ error: "Section not found" }, { status: 404 })
    }

    if ((section.property_ids?.length || 0) >= section.display_limit) {
      return Response.json({ error: "Property limit reached for this section" }, { status: 400 })
    }

    await db
      .collection<HomepageSection>("homepage_sections")
      .updateOne(
        { _id: new ObjectId(id) },
        { $addToSet: { property_ids: new ObjectId(propertyId) }, $set: { updated_at: new Date() } },
      )

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Error adding property:", error)
    return Response.json({ error: "Failed to add property" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const propertyId = new URL(req.url).searchParams.get("propertyId")
    if (!propertyId) {
      return Response.json({ error: "Property ID required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    await db
      .collection<HomepageSection>("homepage_sections")
      .updateOne(
        { _id: new ObjectId(id) },
        { $pull: { property_ids: new ObjectId(propertyId) }, $set: { updated_at: new Date() } },
      )

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Error removing property:", error)
    return Response.json({ error: "Failed to remove property" }, { status: 500 })
  }
}
