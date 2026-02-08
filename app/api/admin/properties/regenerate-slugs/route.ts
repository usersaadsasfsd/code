import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    
    // Find all properties without slugs
    const propertiesWithoutSlugs = await db.collection("properties")
      .find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }] })
      .toArray()
    
    let updatedCount = 0
    
    for (const property of propertiesWithoutSlugs) {
      if (!property.property_name) continue
      
      // Generate slug from property name
      let slug = property.property_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      
      // Ensure unique slug
      let counter = 1
      let uniqueSlug = slug
      while (await db.collection("properties").findOne({ 
        slug: uniqueSlug, 
        _id: { $ne: property._id } 
      })) {
        uniqueSlug = `${slug}-${counter}`
        counter++
      }
      
      await db.collection("properties").updateOne(
        { _id: property._id },
        { $set: { slug: uniqueSlug, updated_at: new Date() } }
      )
      updatedCount++
    }

    return NextResponse.json({ 
      success: true, 
      message: `Generated slugs for ${updatedCount} properties`,
      updatedCount 
    })
  } catch (error) {
    console.error("[v0] Error regenerating slugs:", error)
    return NextResponse.json({ error: "Failed to regenerate slugs" }, { status: 500 })
  }
}
