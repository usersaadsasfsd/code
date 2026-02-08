import { getDatabase } from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(req.url)
    
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit
    
    const db = await getDatabase()

    // Find location by slug
    const location = await db.collection("locations").findOne({ slug })

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    // Build property query based on location
    const propertyQuery: Record<string, any> = { status: "active" }
    
    // Match properties by city, neighborhood, or address containing the location name
    propertyQuery.$or = [
      { city: { $regex: location.name, $options: "i" } },
      { neighborhood: { $regex: location.name, $options: "i" } },
      { address: { $regex: location.name, $options: "i" } },
    ]

    // If location has specific city/state, use those
    if (location.city) {
      propertyQuery.$or.push({ city: { $regex: location.city, $options: "i" } })
    }
    if (location.state) {
      propertyQuery.$or.push({ state: { $regex: location.state, $options: "i" } })
    }

    // Get total count
    const totalProperties = await db.collection("properties").countDocuments(propertyQuery)
    const totalPages = Math.ceil(totalProperties / limit)

    // Get paginated properties
    const properties = await db
      .collection("properties")
      .find(propertyQuery)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Serialize
    const serializedLocation = {
      ...location,
      _id: location._id.toString(),
    }

    const serializedProperties = properties.map((p) => ({
      ...p,
      _id: p._id.toString(),
    }))

    return NextResponse.json({
      location: serializedLocation,
      properties: serializedProperties,
      pagination: {
        page,
        limit,
        total: totalProperties,
        totalPages,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching location:", error)
    return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 })
  }
}
