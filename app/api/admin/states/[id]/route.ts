import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase()
    const state = await db.collection("states").findOne({ _id: new ObjectId(params.id) })

    if (!state) {
      return NextResponse.json({ error: "State not found" }, { status: 404 })
    }

    return NextResponse.json(state)
  } catch (error) {
    console.error("[v0] Error fetching state:", error)
    return NextResponse.json({ error: "Failed to fetch state" }, { status: 500 })
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

    const result = await db.collection("states").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          name: body.name,
          slug: body.slug,
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "State not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating state:", error)
    return NextResponse.json({ error: "Failed to update state" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const result = await db.collection("states").deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "State not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting state:", error)
    return NextResponse.json({ error: "Failed to delete state" }, { status: 500 })
  }
}
