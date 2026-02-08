import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getDatabase()
    const developer = await db.collection("developers").findOne({ _id: new ObjectId(id) })

    if (!developer) {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 })
    }

    return NextResponse.json(developer)
  } catch (error) {
    console.error("[v0] Error fetching developer:", error)
    return NextResponse.json({ error: "Failed to fetch developer" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const body = await req.json()

    const slug = body.name.toLowerCase().replace(/\s+/g, "-")

    const result = await db.collection("developers").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: body.name,
          slug,
          logo_url: body.logo_url,
          about_developer: body.about_developer || "",
          updated_at: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Developer updated" })
  } catch (error) {
    console.error("[v0] Error updating developer:", error)
    return NextResponse.json({ error: "Failed to update developer" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const result = await db.collection("developers").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Developer deleted" })
  } catch (error) {
    console.error("[v0] Error deleting developer:", error)
    return NextResponse.json({ error: "Failed to delete developer" }, { status: 500 })
  }
}
