import { getCurrentUser } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()
    const news = await db.collection("news").find({}).sort({ publication_date: -1 }).toArray()

    return Response.json(news)
  } catch (error) {
    console.error("[v0] Error fetching news:", error)
    return Response.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()
    const body = await req.json()

    const result = await db.collection("news").insertOne({
      ...body,
      created_at: new Date(),
      updated_at: new Date(),
    })

    return Response.json({ id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating news:", error)
    return Response.json({ error: "Failed to create news" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()
    const body = await req.json()
    const { id, ...updateData } = body

    const result = await db.collection("news").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updated_at: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return Response.json({ error: "News not found" }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating news:", error)
    return Response.json({ error: "Failed to update news" }, { status: 500 })
  }
}
