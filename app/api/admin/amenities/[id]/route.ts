import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase()
    const amenity = await db.collection("amenities").findOne({ _id: new ObjectId(params.id) })

    if (!amenity) {
      return NextResponse.json({ error: "Amenity not found" }, { status: 404 })
    }

    return NextResponse.json(amenity)
  } catch (error) {
    console.error("[v0] Error fetching amenity:", error)
    return NextResponse.json({ error: "Failed to fetch amenity" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const body = await req.json()

    const result = await db.collection("amenities").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          name: body.name,
          icon_class: body.icon_class,
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Amenity not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating amenity:", error)
    return NextResponse.json({ error: "Failed to update amenity" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const result = await db.collection("amenities").deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Amenity not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting amenity:", error)
    return NextResponse.json({ error: "Failed to delete amenity" }, { status: 500 })
  }
}
