import { getCurrentUser } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"
import { parseCSV, parseXLSX, validateRecord } from "@/lib/import-export"

interface ConfigCreationResult {
  type: "category" | "state" | "amenity" | "developer" | "facility"
  name: string
  isNew: boolean
}

async function findOrCreateConfigEntry(
  db: any,
  collection: string,
  name: string,
  additionalFields: Record<string, any> = {}
): Promise<{ _id: string; isNew: boolean }> {
  const normalizedName = name.trim()
  if (!normalizedName) {
    return { _id: "", isNew: false }
  }

  // Try to find existing entry (case-insensitive)
  const existing = await db.collection(collection).findOne({
    name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
  })

  if (existing) {
    return { _id: existing._id.toString(), isNew: false }
  }

  // Create new entry
  const slug = normalizedName.toLowerCase().replace(/\s+/g, "-")
  const newEntry = {
    name: normalizedName,
    slug,
    ...additionalFields,
    created_at: new Date(),
    updated_at: new Date(),
  }

  const result = await db.collection(collection).insertOne(newEntry)
  return { _id: result.insertedId.toString(), isNew: true }
}

async function processPropertyConfigFields(
  db: any,
  record: any
): Promise<{
  processedRecord: any
  configCreations: ConfigCreationResult[]
}> {
  const configCreations: ConfigCreationResult[] = []
  const processedRecord = { ...record }

  // Process Category
  if (record.category) {
    const result = await findOrCreateConfigEntry(db, "categories", record.category, {
      icon_class: "building",
    })
    if (result.isNew) {
      configCreations.push({ type: "category", name: record.category, isNew: true })
    }
  }

  // Process State
  if (record.state) {
    const result = await findOrCreateConfigEntry(db, "states", record.state)
    if (result.isNew) {
      configCreations.push({ type: "state", name: record.state, isNew: true })
    }
  }

  // Process Developer
  if (record.developer_name) {
    const result = await findOrCreateConfigEntry(db, "developers", record.developer_name, {
      logo_url: "",
      description: "",
      website: "",
      project_count: 0,
    })
    processedRecord.developer_id = result._id
    if (result.isNew) {
      configCreations.push({ type: "developer", name: record.developer_name, isNew: true })
    }
  }

  // Process Amenities (comma-separated or array)
  if (record.amenities) {
    const amenitiesList = typeof record.amenities === "string"
      ? record.amenities.split(",").map((a: string) => a.trim()).filter(Boolean)
      : Array.isArray(record.amenities)
        ? record.amenities
        : []

    for (const amenityName of amenitiesList) {
      const result = await findOrCreateConfigEntry(db, "amenities", amenityName, {
        icon_class: "check",
      })
      if (result.isNew) {
        configCreations.push({ type: "amenity", name: amenityName, isNew: true })
      }
    }
    processedRecord.amenities = amenitiesList
  }

  // Process Facilities (comma-separated or array)
  if (record.facilities) {
    const facilitiesList = typeof record.facilities === "string"
      ? record.facilities.split(",").map((f: string) => f.trim()).filter(Boolean)
      : Array.isArray(record.facilities)
        ? record.facilities
        : []

    for (const facilityName of facilitiesList) {
      const result = await findOrCreateConfigEntry(db, "facilities", facilityName, {
        icon_class: "building",
      })
      if (result.isNew) {
        configCreations.push({ type: "facility", name: facilityName, isNew: true })
      }
    }
    processedRecord.facilities = facilitiesList
  }

  return { processedRecord, configCreations }
}

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

    const db = await getDatabase()
    const collection = db.collection(entityType)
    let insertedCount = 0
    let skippedCount = 0
    const errors: any[] = []
    const allConfigCreations: ConfigCreationResult[] = []

    for (let i = 0; i < records.length; i++) {
      let record = records[i]
      const validationResults = validateRecord(record, entityType as any, i)
      const hasErrors = validationResults.some((r) => !r.isValid)

      if (hasErrors) {
        skippedCount++
        errors.push({
          row: i + 2,
          errors: validationResults.filter((r) => !r.isValid).map((r) => r.error),
        })
      } else {
        try {
          // For properties, process config fields and auto-create missing entries
          if (entityType === "properties") {
            const { processedRecord, configCreations } = await processPropertyConfigFields(db, record)
            record = processedRecord
            allConfigCreations.push(...configCreations)
            
            // Generate slug from property name if not provided
            if (!record.slug && record.property_name) {
              let slug = record.property_name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "")
              
              // Ensure unique slug
              let counter = 1
              let uniqueSlug = slug
              while (await db.collection("properties").findOne({ slug: uniqueSlug })) {
                uniqueSlug = `${slug}-${counter}`
                counter++
              }
              record.slug = uniqueSlug
            }
          }

          await collection.insertOne({
            ...record,
            created_at: new Date(),
            updated_at: new Date(),
          })
          insertedCount++
        } catch (error) {
          skippedCount++
          errors.push({
            row: i + 2,
            error: error instanceof Error ? error.message : "Failed to insert record",
          })
        }
      }
    }

    // Summarize config creations by type
    const configSummary: Record<string, string[]> = {}
    for (const creation of allConfigCreations) {
      if (!configSummary[creation.type]) {
        configSummary[creation.type] = []
      }
      if (!configSummary[creation.type].includes(creation.name)) {
        configSummary[creation.type].push(creation.name)
      }
    }

    return NextResponse.json({
      success: true,
      insertedCount,
      skippedCount,
      totalProcessed: records.length,
      errors: errors.length > 0 ? errors : undefined,
      configCreations: Object.keys(configSummary).length > 0 ? {
        summary: configSummary,
        totalNewEntries: allConfigCreations.length,
        details: allConfigCreations,
      } : undefined,
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed" }, { status: 400 })
  }
}
