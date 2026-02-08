import { getDatabase } from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await getDatabase()
    const states = await db.collection("states").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json(states)
  } catch (error) {
    console.error("[v0] Error fetching states:", error)
    return NextResponse.json({ error: "Failed to fetch states" }, { status: 500 })
  }
}
