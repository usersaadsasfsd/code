import { getCurrentUser } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const db = await connectDB()
    const reviews = await db
      .collection("reviews")
      .find({ property: new ObjectId(params.id), is_approved: true })
      .toArray()

    return Response.json(reviews)
  } catch (error) {
    console.error("[v0] Error fetching reviews:", error)
    return Response.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()
    const body = await req.json()

    const result = await db.collection("reviews").insertOne({
      property: new ObjectId(params.id),
      user: new ObjectId(user._id),
      rating: body.rating,
      comment: body.comment,
      is_approved: false,
      created_at: new Date(),
    })

    return Response.json({ id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating review:", error)
    return Response.json({ error: "Failed to create review" }, { status: 500 })
  }
}
