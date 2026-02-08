import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const mongoUrl = process.env.MONGODB_URI || ""

async function registerUser(
  username: string,
  email: string,
  password: string,
  phone_number: string,
  user_type: "customer" | "agent" = "customer",
) {
  if (!mongoUrl) {
    throw new Error("MongoDB URI not configured")
  }

  const client = new MongoClient(mongoUrl)

  try {
    await client.connect()
    const db = client.db("countryroof")
    const collection = db.collection("users")

    // Check if user exists
    const existingUser = await collection.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    })
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await collection.insertOne({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      phone_number,
      user_type,
      date_joined: new Date(),
      profile_picture: null,
    })

    return { id: result.insertedId, username, email, user_type }
  } finally {
    await client.close()
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, email, password, phone_number, user_type } = body

    if (!username || !email || !password || !phone_number) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const user = await registerUser(username, email, password, phone_number, user_type || "customer")

    return new Response(
      JSON.stringify({
        success: true,
        message: "Account created successfully",
        user,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Registration failed"
    const statusCode = errorMessage.includes("already exists") ? 409 : 500

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    })
  }
}
