import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await getDatabase()
    const facilities = await db.collection("facilities").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json(facilities)
  } catch (error) {
    console.error("[v0] Error fetching facilities:", error)
    return NextResponse.json({ error: "Failed to fetch facilities" }, { status: 500 })
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

    const facility = {
      name: body.name,
      icon_class: body.icon_class,
    }

    const result = await db.collection("facilities").insertOne(facility)
    return NextResponse.json({ _id: result.insertedId, ...facility }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating facility:", error)
    return NextResponse.json({ error: "Failed to create facility" }, { status: 500 })
  }
}
