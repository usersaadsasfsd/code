import { getDatabase } from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const db = await getDatabase()

    // Find developer by slug
    const developer = await db.collection("developers").findOne({ slug })

    if (!developer) {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 })
    }

    // Find properties by developer_name (matching the developer's name)
    const query = { developer_name: developer.name }

    const [properties, totalCount] = await Promise.all([
      db
        .collection("properties")
        .find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("properties").countDocuments(query),
    ])

    // Serialize ObjectIds to strings
    const serializedProperties = properties.map((p) => ({
      ...p,
      _id: p._id.toString(),
    }))

    const serializedDeveloper = {
      ...developer,
      _id: developer._id.toString(),
    }

    return NextResponse.json({
      developer: serializedDeveloper,
      properties: serializedProperties,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching developer:", error)
    return NextResponse.json(
      { error: "Failed to fetch developer" },
      { status: 500 }
    )
  }
}
