import { getImageKitAuthenticationParameters } from "@/lib/imagekit"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await getImageKitAuthenticationParameters()
    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] ImageKit auth error:", error)
    return NextResponse.json(
      { error: "Failed to get ImageKit authentication parameters" },
      { status: 500 }
    )
  }
}
