import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const search = searchParams.get("search")

    const query: Record<string, any> = {}
    if (type) query.type = type
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } },
      ]
    }

    const locations = await db
      .collection("locations")
      .find(query)
      .sort({ name: 1 })
      .toArray()

    // Serialize _id to string
    const serialized = locations.map((l) => ({
      ...l,
      _id: l._id.toString(),
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    console.error("[v0] Error fetching locations:", error)
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const body = await req.json()

    // Generate slug
    let slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Ensure unique slug
    let counter = 1
    let uniqueSlug = slug
    while (await db.collection("locations").findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    const location = {
      name: body.name,
      slug: uniqueSlug,
      type: body.type || "city",
      state: body.state || "",
      city: body.city || "",
      description: body.description || "",
      featured_image: body.featured_image || "",
      meta_title: body.meta_title || body.name,
      meta_description: body.meta_description || "",
      schema_markup: body.schema_markup || null,
      is_featured: body.is_featured || false,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await db.collection("locations").insertOne(location)
    return NextResponse.json({ _id: result.insertedId.toString(), ...location }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating location:", error)
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 })
  }
}
