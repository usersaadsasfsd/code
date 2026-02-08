import { getDatabase } from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase()
    const searchParams = req.nextUrl.searchParams

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const total = await db.collection("news").countDocuments({ is_published: true })
    const news = await db
      .collection("news")
      .find({ is_published: true })
      .sort({ publication_date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching news:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}
