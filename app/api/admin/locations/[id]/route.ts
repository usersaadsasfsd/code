import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getDatabase()
    
    let objectId: ObjectId
    try {
      objectId = new ObjectId(id)
    } catch (e) {
      return NextResponse.json({ error: "Invalid location ID" }, { status: 400 })
    }

    const location = await db.collection("locations").findOne({ _id: objectId })

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    return NextResponse.json({ ...location, _id: location._id.toString() })
  } catch (error) {
    console.error("[v0] Error fetching location:", error)
    return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let objectId: ObjectId
    try {
      objectId = new ObjectId(id)
    } catch (e) {
      return NextResponse.json({ error: "Invalid location ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const body = await req.json()

    // Generate slug if name changed
    let slug = body.slug
    if (!slug && body.name) {
      slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      // Ensure unique slug (excluding current)
      let counter = 1
      let uniqueSlug = slug
      while (await db.collection("locations").findOne({ slug: uniqueSlug, _id: { $ne: objectId } })) {
        uniqueSlug = `${slug}-${counter}`
        counter++
      }
      slug = uniqueSlug
    }

    const result = await db.collection("locations").updateOne(
      { _id: objectId },
      {
        $set: {
          ...body,
          slug,
          updated_at: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    const updated = await db.collection("locations").findOne({ _id: objectId })
    return NextResponse.json({ ...updated, _id: updated?._id.toString() })
  } catch (error) {
    console.error("[v0] Error updating location:", error)
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let objectId: ObjectId
    try {
      objectId = new ObjectId(id)
    } catch (e) {
      return NextResponse.json({ error: "Invalid location ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection("locations").deleteOne({ _id: objectId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting location:", error)
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 })
  }
}
