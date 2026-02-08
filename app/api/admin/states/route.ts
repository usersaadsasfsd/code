import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await getDatabase()
    const states = await db.collection("states").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json(states)
  } catch (error) {
    console.error("[v0] Error fetching states:", error)
    return NextResponse.json({ error: "Failed to fetch states" }, { status: 500 })
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

    const state = {
      name: body.name,
      slug: body.name.toLowerCase().replace(/\s+/g, "-"),
    }

    const result = await db.collection("states").insertOne(state)
    return NextResponse.json({ _id: result.insertedId, ...state }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating state:", error)
    return NextResponse.json({ error: "Failed to create state" }, { status: 500 })
  }
}
