import { NextRequest, NextResponse } from "next/server"
import { imagekit } from "@/lib/imagekit"

export async function POST(req: NextRequest) {
  try {
    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "ImageKit not configured" },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "properties"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to ImageKit
    const response = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: folder,
    })

    return NextResponse.json({
      success: true,
      url: response.url,
      fileId: response.fileId,
      name: response.name,
      thumbnailUrl: response.thumbnailUrl,
      size: response.size,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file", details: String(error) },
      { status: 500 }
    )
  }
}
