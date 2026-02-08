import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()
    const { propertyId } = await request.json()

    const sectionsCollection = db.collection("homepage_sections")
    await sectionsCollection.updateOne({ _id: params.id }, { $addToSet: { properties: propertyId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error adding property:", error)
    return NextResponse.json({ error: "Failed to add property" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; propertyId: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()
    const propertyId = params.propertyId || new URL(request.url).searchParams.get("propertyId")

    const sectionsCollection = db.collection("homepage_sections")
    await sectionsCollection.updateOne({ _id: params.id }, { $pull: { properties: propertyId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error removing property:", error)
    return NextResponse.json({ error: "Failed to remove property" }, { status: 500 })
  }
}
