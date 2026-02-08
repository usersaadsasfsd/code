import { parse } from "csv-parse/sync"
import * as XLSX from "xlsx"

export interface ValidationResult {
  isValid: boolean
  fieldName: string
  value: any
  error?: string
}

export interface ImportValidationReport {
  totalRows: number
  validRows: number
  invalidRows: number
  duplicateRows: number
  warnings: string[]
  errors: ValidationResult[]
  fieldAccuracy: Record<string, { valid: number; invalid: number; percentage: number }>
}

export const VALIDATION_SCHEMAS = {
  properties: {
    required: ["property_name", "main_thumbnail"],
    optional: [
      "listing_type",
      "property_category",
      "property_type",
      "slug",
      "developer_name",
      "brand_collection",
      "project_status",
      "possession_year_quarter",
      "target_segment",
      "unit_status",
      "age_of_property",
      "rera_registered",
      "rera_id",
      "rera_website_link",
      "rera_no",
      "license_no",
      "oc_cc_status",
      "country",
      "address",
      "city",
      "state",
      "postal_code",
      "property_size",
      "google_map_link",
      "bhk_configuration",
      "tower_name",
      "unit_no",
      "carpet_area",
      "built_up_area",
      "super_area",
      "direction_facing",
      "balconies_count",
      "price_range",
      "booking_amount",
      "payment_plan",
      "taxes_included",
      "offers_discounts",
      "monthly_rent",
      "security_deposit",
      "lock_in_period",
      "maintenance_charge",
      "negotiable",
      "all_inclusive",
      "total_towers",
      "total_units",
      "floors_per_tower",
      "total_acreage",
      "open_area_percentage",
      "clubhouse_size",
      "owner_type",
      "ownership_type",
      "agreement_ready",
      "loan_available",
      "main_banner",
      "property_video",
      "brochure_pdf",
      "walkthrough_video",
      "drone_video",
      "neighborhood",
      "possession",
      "possession_type",
      "possession_date",
      "furnished_type",
      "floor_number",
      "total_floors",
      "latitude",
      "longitude",
      "developer_id",
      "meta_title",
      "meta_keywords",
      "meta_description",
      "lowest_price",
      "max_price",
      "bedrooms",
      "bathrooms",
      "area_sqft",
      "parking_type",
      "parking_count",
    ],
  },
  categories: {
    required: ["name"],
    optional: ["icon_class", "slug"],
  },
  states: {
    required: ["name"],
    optional: ["slug"],
  },
  amenities: {
    required: ["name"],
    optional: ["icon_class"],
  },
  developers: {
    required: ["name"],
    optional: ["logo_url", "description", "website", "project_count", "slug"],
  },
  facilities: {
    required: ["name"],
    optional: ["icon_class"],
  },
}

export function parseCSV(fileContent: string): any[] {
  try {
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
    return records
  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export function parseXLSX(buffer: Buffer): any[] {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const records = XLSX.utils.sheet_to_json(sheet)
    return records
  } catch (error) {
    throw new Error(`Failed to parse XLSX: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export function validateRecord(
  record: any,
  entityType: keyof typeof VALIDATION_SCHEMAS,
  index: number,
): ValidationResult[] {
  const schema = VALIDATION_SCHEMAS[entityType]
  const results: ValidationResult[] = []

  // Check required fields
  for (const field of schema.required) {
    if (!record[field] || (typeof record[field] === "string" && record[field].trim() === "")) {
      results.push({
        isValid: false,
        fieldName: field,
        value: record[field],
        error: `Required field '${field}' is missing at row ${index + 1}`,
      })
    } else {
      results.push({
        isValid: true,
        fieldName: field,
        value: record[field],
      })
    }
  }

  // Check optional fields
  for (const field of schema.optional) {
    if (record[field]) {
      results.push({
        isValid: true,
        fieldName: field,
        value: record[field],
      })
    }
  }

  return results
}

export function generateValidationReport(
  records: any[],
  entityType: keyof typeof VALIDATION_SCHEMAS,
): ImportValidationReport {
  const allValidationResults: ValidationResult[] = []
  const fieldAccuracy: Record<string, { valid: number; invalid: number; percentage: number }> = {}
  const schema = VALIDATION_SCHEMAS[entityType]

  // Initialize field accuracy tracking
  const allFields = [...schema.required, ...schema.optional]
  allFields.forEach((field) => {
    fieldAccuracy[field] = { valid: 0, invalid: 0, percentage: 0 }
  })

  let validRows = 0
  let invalidRows = 0
  const duplicateRows = new Set<string>()
  const seenRecords = new Set<string>()

  // Validate each record
  records.forEach((record, index) => {
    // Check for duplicates
    const recordKey = JSON.stringify(record)
    if (seenRecords.has(recordKey)) {
      duplicateRows.add(`Row ${index + 2}`)
    } else {
      seenRecords.add(recordKey)
    }

    // Validate fields
    const validationResults = validateRecord(record, entityType, index)
    allValidationResults.push(...validationResults)

    // Track field accuracy
    validationResults.forEach((result) => {
      if (result.isValid) {
        fieldAccuracy[result.fieldName].valid++
      } else {
        fieldAccuracy[result.fieldName].invalid++
      }
    })

    // Count valid/invalid rows
    const isRowValid = validationResults.every((r) => r.isValid)
    if (isRowValid) {
      validRows++
    } else {
      invalidRows++
    }
  })

  // Calculate percentages
  Object.keys(fieldAccuracy).forEach((field) => {
    const total = fieldAccuracy[field].valid + fieldAccuracy[field].invalid
    fieldAccuracy[field].percentage = total > 0 ? Math.round((fieldAccuracy[field].valid / total) * 100) : 0
  })

  return {
    totalRows: records.length,
    validRows,
    invalidRows,
    duplicateRows: duplicateRows.size,
    warnings: Array.from(duplicateRows),
    errors: allValidationResults.filter((r) => !r.isValid),
    fieldAccuracy,
  }
}

export function generateCSVFromData(data: any[], entityType: keyof typeof VALIDATION_SCHEMAS): string {
  if (data.length === 0) return ""

  const schema = VALIDATION_SCHEMAS[entityType]
  const headers = [...schema.required, ...schema.optional]
  const csvHeaders = headers.join(",")

  const csvRows = data.map((record) =>
    headers
      .map((header) => {
        const value = record[header]
        if (typeof value === "string" && value.includes(",")) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ""
      })
      .join(","),
  )

  return [csvHeaders, ...csvRows].join("\n")
}

export function generateXLSXFromData(data: any[], entityType: keyof typeof VALIDATION_SCHEMAS): Buffer {
  const schema = VALIDATION_SCHEMAS[entityType]
  const headers = [...schema.required, ...schema.optional]

  const worksheet = XLSX.utils.json_to_sheet(
    data.map((record) => {
      const row: any = {}
      headers.forEach((header) => {
        row[header] = record[header] || ""
      })
      return row
    }),
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data")

  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })
}
