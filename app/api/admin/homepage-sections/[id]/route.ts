import { connectToDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { ObjectId } from "mongodb"
import type { HomepageSection } from "@/lib/schemas"

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(req: Request, context: Context) {
  try {
    // CRITICAL: Await params before accessing properties (Next.js 16)
    const resolvedParams = await context.params
    const sectionId = resolvedParams.id
    
    const { db } = await connectToDatabase()
    
    let objectId
    try {
      objectId = new ObjectId(sectionId)
    } catch (idError) {
      return Response.json({ error: "Invalid section ID format" }, { status: 400 })
    }
    
    const section = await db.collection<HomepageSection>("homepage_sections").findOne({ 
      _id: objectId
    })
    
    if (!section) {
      return Response.json({ error: "Section not found" }, { status: 404 })
    }
    
    return Response.json(section)
  } catch (error) {
    console.error("[v0] Error fetching section:", error)
    return Response.json({ error: "Failed to fetch section" }, { status: 500 })
  }
}

export async function PUT(req: Request, context: Context) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // CRITICAL: Await params before accessing properties (Next.js 16)
    const resolvedParams = await context.params
    const sectionId = resolvedParams.id
    
    const { db } = await connectToDatabase()
    const updates = await req.json()
    updates.updated_at = new Date()
    
    await db
      .collection<HomepageSection>("homepage_sections")
      .updateOne({ _id: new ObjectId(sectionId) }, { $set: updates })
      
    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating section:", error)
    return Response.json({ error: "Failed to update section" }, { status: 500 })
  }
}

export async function PATCH(req: Request, context: Context) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // CRITICAL: Await params before accessing properties (Next.js 16)
    const resolvedParams = await context.params
    const sectionId = resolvedParams.id
    
    const { db } = await connectToDatabase()
    const { is_active } = await req.json()
    
    await db
      .collection<HomepageSection>("homepage_sections")
      .updateOne({ _id: new ObjectId(sectionId) }, { $set: { is_active, updated_at: new Date() } })
      
    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating section:", error)
    return Response.json({ error: "Failed to update section" }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: Context) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // CRITICAL: Await params before accessing properties (Next.js 16)
    const resolvedParams = await context.params
    const sectionId = resolvedParams.id
    
    const { db } = await connectToDatabase()
    const result = await db
      .collection<HomepageSection>("homepage_sections")
      .deleteOne({ _id: new ObjectId(sectionId) })
    
    if (result.deletedCount === 0) {
      return Response.json({ error: "Section not found" }, { status: 404 })
    }
    
    return Response.json({ success: true, deletedCount: result.deletedCount })
  } catch (error) {
    console.error("[v0] Error deleting section:", error)
    return Response.json({ error: "Failed to delete section" }, { status: 500 })
  }
}
