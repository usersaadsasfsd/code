import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await getDatabase()
    const categories = await db.collection("categories").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json(categories)
  } catch (error) {
    console.error("[v0] Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
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

    const category = {
      name: body.name,
      slug: body.name.toLowerCase().replace(/\s+/g, "-"),
      icon_class: body.icon_class,
    }

    const result = await db.collection("categories").insertOne(category)
    return NextResponse.json({ _id: result.insertedId, ...category }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
