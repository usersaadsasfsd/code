import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // In Next.js 16, params must be awaited
    const { id } = await params
    const db = await getDatabase()
    
    // Try to find by slug first, then fall back to _id for backward compatibility
    let property = null
    
    // First try slug
    property = await db.collection("properties").findOne({ slug: id })
    
    // If not found by slug, try _id
    if (!property) {
      try {
        const objectId = new ObjectId(id)
        property = await db.collection("properties").findOne({ _id: objectId })
      } catch (e) {
        // Invalid ObjectId format, that's ok - we already tried slug
      }
    }

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Convert _id to string for consistent handling
    const propertyData = {
      ...property,
      _id: property._id.toString(),
    }

    const reviews = await db
      .collection("reviews")
      .find({ property: property._id, is_approved: true })
      .toArray()

    return NextResponse.json({ property: propertyData, reviews })
  } catch (error) {
    console.error("[v0] Error fetching property:", error)
    return NextResponse.json({ error: "Failed to fetch property", details: String(error) }, { status: 500 })
  }
}
