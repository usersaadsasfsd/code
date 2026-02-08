import { getCurrentUser } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"
import { generateCSVFromData, generateXLSXFromData } from "@/lib/import-export"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const entityType = req.nextUrl.searchParams.get("entityType")
    const format = req.nextUrl.searchParams.get("format") || "csv"

    if (!entityType) {
      return NextResponse.json({ error: "entityType is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection(entityType)
    const data = await collection.find({}).toArray()

    // Remove MongoDB _id for cleaner export
    const cleanedData = data.map(({ _id, ...rest }) => rest)

    let fileContent: string | Buffer
    let contentType: string
    let filename: string

    if (format === "xlsx") {
      fileContent = generateXLSXFromData(cleanedData, entityType as any)
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      filename = `${entityType}-export.xlsx`
    } else {
      fileContent = generateCSVFromData(cleanedData, entityType as any)
      contentType = "text/csv"
      filename = `${entityType}-export.csv`
    }

    return new NextResponse(fileContent, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": contentType,
      },
    })
  } catch (error) {
    console.error("[v0] Export error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Export failed" }, { status: 400 })
  }
}
