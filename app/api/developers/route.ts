import { getDatabase } from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await getDatabase()
    
    // Get all developers with their property counts
    const developers = await db.collection("developers").find({}).sort({ name: 1 }).toArray()
    
    // Get property counts for each developer
    const developersWithCounts = await Promise.all(
      developers.map(async (dev) => {
        const propertyCount = await db.collection("properties").countDocuments({ 
          developer_name: dev.name 
        })
        return {
          ...dev,
          _id: dev._id.toString(),
          property_count: propertyCount,
        }
      })
    )
    
    return NextResponse.json(developersWithCounts)
  } catch (error) {
    console.error("[v0] Error fetching developers:", error)
    return NextResponse.json({ error: "Failed to fetch developers" }, { status: 500 })
  }
}
