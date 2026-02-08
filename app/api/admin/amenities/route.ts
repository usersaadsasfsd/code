import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await getDatabase()
    const amenities = await db.collection("amenities").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json(amenities)
  } catch (error) {
    console.error("[v0] Error fetching amenities:", error)
    return NextResponse.json({ error: "Failed to fetch amenities" }, { status: 500 })
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

    const amenity = {
      name: body.name,
      icon_class: body.icon_class,
    }

    const result = await db.collection("amenities").insertOne(amenity)
    return NextResponse.json({ _id: result.insertedId, ...amenity }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating amenity:", error)
    return NextResponse.json({ error: "Failed to create amenity" }, { status: 500 })
  }
}
