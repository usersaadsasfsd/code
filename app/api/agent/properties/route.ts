import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.user_type !== "agent" && user.user_type !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const properties = await db
      .collection("properties")
      .find({ agent: user._id || (user.user_type === "admin" ? {} : { $exists: false }) })
      .sort({ created_at: -1 })
      .toArray()

    return NextResponse.json(properties)
  } catch (error) {
    console.error("[v0] Error fetching agent properties:", error)
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.user_type !== "agent" && user.user_type !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const body = await req.json()

    // Generate slug from property name if not provided
    let slug = body.slug
    if (!slug && body.property_name) {
      slug = body.property_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      
      // Ensure unique slug
      let counter = 1
      let uniqueSlug = slug
      while (await db.collection("properties").findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${slug}-${counter}`
        counter++
      }
      slug = uniqueSlug
    }

    const property = {
      ...body,
      slug,
      agent: user._id,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await db.collection("properties").insertOne(property)
    return NextResponse.json({ _id: result.insertedId, ...property }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating property:", error)
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
  }
}
