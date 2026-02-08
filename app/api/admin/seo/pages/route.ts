import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const pageType = searchParams.get("page_type")

    const db = await getDatabase()
    
    const query: Record<string, any> = {}
    if (pageType) query.page_type = pageType

    const pages = await db
      .collection("seo_pages")
      .find(query)
      .sort({ page_path: 1 })
      .toArray()

    const serialized = pages.map((p) => ({
      ...p,
      _id: p._id.toString(),
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    console.error("[v0] Error fetching SEO pages:", error)
    return NextResponse.json({ error: "Failed to fetch SEO pages" }, { status: 500 })
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

    // Check if page_path already exists
    const existing = await db.collection("seo_pages").findOne({ page_path: body.page_path })
    if (existing) {
      return NextResponse.json({ error: "Page path already exists" }, { status: 400 })
    }

    const seoPage = {
      page_path: body.page_path,
      page_type: body.page_type || "static",
      page_title: body.page_title || "",
      meta_description: body.meta_description || "",
      meta_keywords: body.meta_keywords || "",
      og_title: body.og_title || "",
      og_description: body.og_description || "",
      og_image: body.og_image || "",
      canonical_url: body.canonical_url || "",
      robots_meta: body.robots_meta || "index, follow",
      schema_markup: body.schema_markup || null,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await db.collection("seo_pages").insertOne(seoPage)
    return NextResponse.json({ _id: result.insertedId.toString(), ...seoPage }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating SEO page:", error)
    return NextResponse.json({ error: "Failed to create SEO page" }, { status: 500 })
  }
}
