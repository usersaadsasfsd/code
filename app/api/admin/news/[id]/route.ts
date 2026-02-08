import { getCurrentUser } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const db = await connectDB()
    const news = await db.collection("news").findOne({ _id: new ObjectId(params.id) })

    if (!news) {
      return Response.json({ error: "News not found" }, { status: 404 })
    }

    return Response.json(news)
  } catch (error) {
    console.error("[v0] Error fetching news:", error)
    return Response.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()
    const body = await req.json()

    const result = await db.collection("news").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...body,
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()
    const result = await db.collection("news").deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return Response.json({ error: "News not found" }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting news:", error)
    return Response.json({ error: "Failed to delete news" }, { status: 500 })
  }
}
