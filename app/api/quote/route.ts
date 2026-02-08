import { MongoClient } from "mongodb"

const mongoUrl = process.env.MONGODB_URI || ""

async function saveQuoteRequest(data: {
  name: string
  email: string
  phone: string
  serviceType: string
  propertyType: string
  roofSize: string
  urgency: string
  details: string
  timestamp?: Date
}) {
  if (!mongoUrl) {
    throw new Error("MongoDB URI not configured")
  }

  const client = new MongoClient(mongoUrl)

  try {
    await client.connect()
    const db = client.db("countryroof")
    const collection = db.collection("quotes")

    const result = await collection.insertOne({
      ...data,
      timestamp: new Date(),
      status: "pending",
    })

    return result.insertedId
  } finally {
    await client.close()
  }
}

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  try {
    const body = await request.json()

    const { name, email, phone, serviceType, propertyType, roofSize, urgency, details } = body

    if (!name || !email || !phone || !serviceType || !propertyType) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Save to MongoDB
    const id = await saveQuoteRequest({
      name,
      email,
      phone,
      serviceType,
      propertyType,
      roofSize,
      urgency,
      details,
    })

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user

    return new Response(
      JSON.stringify({
        success: true,
        message: "Quote request submitted successfully",
        id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Quote request error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to submit quote request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
