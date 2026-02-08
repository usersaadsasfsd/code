import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { parseCSV, parseXLSX, generateValidationReport } from "@/lib/import-export"

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const entityType = formData.get("entityType") as string

    if (!file || !entityType) {
      return NextResponse.json({ error: "File and entityType are required" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    let records: any[] = []

    if (file.name.endsWith(".csv")) {
      const text = new TextDecoder().decode(buffer)
      records = parseCSV(text)
    } else if (file.name.endsWith(".xlsx")) {
      records = parseXLSX(Buffer.from(buffer))
    } else {
      return NextResponse.json({ error: "File must be CSV or XLSX" }, { status: 400 })
    }

    const report = generateValidationReport(records, entityType as any)

    return NextResponse.json(report)
  } catch (error) {
    console.error("[v0] Validation error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Validation failed" }, { status: 400 })
  }
}
