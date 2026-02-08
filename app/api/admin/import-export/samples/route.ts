import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

const SAMPLE_DATA = {
  properties: [
    {
      property_name: "Luxury Apartment Complex",
      main_thumbnail: "https://example.com/image1.jpg",
      listing_type: "builder_project",
      property_category: "residential",
      property_type: "apartment",
      slug: "luxury-apartment-complex",
      developer_name: "ABC Constructions",
      brand_collection: "Prestige Collection",
      project_status: "under_construction",
      possession_year_quarter: "Q4 2025",
      target_segment: "luxury",
      rera_registered: "true",
      rera_id: "RERA12345",
      rera_website_link: "https://rera.maharashtra.gov.in",
      country: "India",
      address: "123 Prime Street",
      city: "Mumbai",
      state: "Maharashtra",
      postal_code: "400001",
      property_size: "1200 sq ft",
      google_map_link: "https://maps.google.com/...",
      bhk_configuration: "3BHK",
      carpet_area: "1000",
      built_up_area: "1100",
      super_area: "1200",
      direction_facing: "north",
      balconies_count: "2",
      price_range: "50,00,000 - 60,00,000",
      lowest_price: "5000000",
      max_price: "6000000",
      booking_amount: "100000",
      payment_plan: "clp",
      taxes_included: "false",
      offers_discounts: "Early bird discount 5%",
      bedrooms: "3",
      bathrooms: "2",
      area_sqft: "1200",
      parking_type: "covered",
      parking_count: "2",
      total_towers: "5",
      total_units: "500",
      floors_per_tower: "20",
      total_acreage: "10 acres",
      open_area_percentage: "70",
      clubhouse_size: "20000 sq ft",
      main_banner: "https://example.com/banner1.jpg",
      property_video: "https://example.com/video1.mp4",
      brochure_pdf: "https://example.com/brochure1.pdf",
      walkthrough_video: "https://example.com/walkthrough1.mp4",
      drone_video: "https://example.com/drone1.mp4",
      neighborhood: "Andheri West",
      possession: "Dec 2025",
      possession_type: "under_construction",
      possession_date: "2025-12-31",
      furnished_type: "semi_furnished",
      floor_number: "5",
      total_floors: "20",
      latitude: "19.1136",
      longitude: "72.8697",
      developer_id: "dev_001",
      meta_title: "Luxury Apartment Complex - Premium Homes in Mumbai",
      meta_keywords: "luxury apartments, mumbai property, 3bhk",
      meta_description: "Discover premium 3BHK luxury apartments in prime Mumbai location",
    },
    {
      property_name: "Commercial Office Space",
      main_thumbnail: "https://example.com/image2.jpg",
      listing_type: "resale",
      property_category: "commercial",
      property_type: "office",
      slug: "commercial-office-space",
      unit_status: "vacant",
      age_of_property: "5",
      owner_type: "owner",
      ownership_type: "freehold",
      agreement_ready: "true",
      loan_available: "true",
      country: "India",
      address: "456 Business Park",
      city: "Bangalore",
      state: "Karnataka",
      postal_code: "560001",
      property_size: "2000 sq ft",
      carpet_area: "1800",
      built_up_area: "1900",
      super_area: "2000",
      direction_facing: "east",
      price_range: "1,00,00,000 - 1,20,00,000",
      lowest_price: "10000000",
      max_price: "12000000",
      bedrooms: "0",
      bathrooms: "2",
      area_sqft: "2000",
      parking_type: "basement",
      parking_count: "5",
      furnished_type: "fully_furnished",
      floor_number: "3",
      total_floors: "10",
      latitude: "12.9716",
      longitude: "77.5946",
      meta_title: "Commercial Office Space in Bangalore Business Park",
      meta_keywords: "office space, bangalore commercial, business park",
      meta_description: "Premium commercial office space for sale in Bangalore",
    },
  ],
  categories: [
    { name: "Residential", slug: "residential", icon_class: "Home" },
    { name: "Commercial", slug: "commercial", icon_class: "Building2" },
    { name: "Land/Plot", slug: "land-plot", icon_class: "Landmark" },
  ],
  states: [
    { name: "Maharashtra", slug: "maharashtra" },
    { name: "Karnataka", slug: "karnataka" },
    { name: "Delhi", slug: "delhi" },
    { name: "Haryana", slug: "haryana" },
  ],
  amenities: [
    { name: "Swimming Pool", icon_class: "Waves" },
    { name: "Gym", icon_class: "Dumbbell" },
    { name: "Parking", icon_class: "ParkingCircle" },
    { name: "Security", icon_class: "Shield" },
  ],
  developers: [
    {
      name: "ABC Constructions",
      slug: "abc-constructions",
      logo_url: "https://example.com/logo1.png",
      description: "Leading construction company with 20 years of experience",
      website: "https://abcconstructions.com",
      project_count: "50",
    },
    {
      name: "XYZ Builders",
      slug: "xyz-builders",
      logo_url: "https://example.com/logo2.png",
      description: "Premium real estate developer focusing on luxury projects",
      website: "https://xyzbuilders.com",
      project_count: "30",
    },
  ],
  facilities: [
    { name: "Elevator", icon_class: "ArrowUpDown" },
    { name: "Water Supply", icon_class: "Droplet" },
    { name: "Power Backup", icon_class: "Zap" },
    { name: "Lift", icon_class: "Navigation" },
  ],
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const entityType = req.nextUrl.searchParams.get("entityType")
    const format = req.nextUrl.searchParams.get("format") || "csv"

    if (!entityType || !Object.keys(SAMPLE_DATA).includes(entityType)) {
      return NextResponse.json({ error: "Invalid entityType" }, { status: 400 })
    }

    const sampleData = SAMPLE_DATA[entityType as keyof typeof SAMPLE_DATA]

    if (format === "xlsx") {
      const worksheet = XLSX.utils.json_to_sheet(sampleData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sample")

      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })

      return new NextResponse(buffer, {
        headers: {
          "Content-Disposition": `attachment; filename="${entityType}-sample.xlsx"`,
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      })
    } else {
      const headers = Object.keys(sampleData[0])
      const csvHeaders = headers.join(",")

      const csvRows = sampleData.map((record: any) =>
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

      const csvContent = [csvHeaders, ...csvRows].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Disposition": `attachment; filename="${entityType}-sample.csv"`,
          "Content-Type": "text/csv",
        },
      })
    }
  } catch (error) {
    console.error("[v0] Error generating sample:", error)
    return NextResponse.json({ error: "Failed to generate sample" }, { status: 400 })
  }
}
