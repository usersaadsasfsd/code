import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await getDatabase()
    const developers = await db.collection("developers").find({}).sort({ name: 1 }).toArray()
    return NextResponse.json(developers)
  } catch (error) {
    console.error("[v0] Error fetching developers:", error)
    return NextResponse.json({ error: "Failed to fetch developers" }, { status: 500 })
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

    const slug = body.name.toLowerCase().replace(/\s+/g, "-")

    const developer = {
      name: body.name,
      slug,
      logo_url: body.logo_url,
      about_developer: body.about_developer || "",
      project_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await db.collection("developers").insertOne(developer)
    return NextResponse.json({ _id: result.insertedId, ...developer }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating developer:", error)
    return NextResponse.json({ error: "Failed to create developer" }, { status: 500 })
  }
}
