import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const page = await db.collection("seo_pages").findOne({ _id: objectId })

    if (!page) {
      return NextResponse.json({ error: "SEO page not found" }, { status: 404 })
    }

    return NextResponse.json({ ...page, _id: page._id.toString() })
  } catch (error) {
    console.error("[v0] Error fetching SEO page:", error)
    return NextResponse.json({ error: "Failed to fetch SEO page" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const body = await req.json()

    const result = await db.collection("seo_pages").updateOne(
      { _id: objectId },
      {
        $set: {
          page_path: body.page_path,
          page_type: body.page_type,
          page_title: body.page_title,
          meta_description: body.meta_description,
          meta_keywords: body.meta_keywords,
          og_title: body.og_title,
          og_description: body.og_description,
          og_image: body.og_image,
          canonical_url: body.canonical_url,
          robots_meta: body.robots_meta,
          schema_markup: body.schema_markup,
          updated_at: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "SEO page not found" }, { status: 404 })
    }

    const updated = await db.collection("seo_pages").findOne({ _id: objectId })
    return NextResponse.json({ ...updated, _id: updated?._id.toString() })
  } catch (error) {
    console.error("[v0] Error updating SEO page:", error)
    return NextResponse.json({ error: "Failed to update SEO page" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection("seo_pages").deleteOne({ _id: objectId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "SEO page not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting SEO page:", error)
    return NextResponse.json({ error: "Failed to delete SEO page" }, { status: 500 })
  }
}
